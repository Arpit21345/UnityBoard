import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Snippet from '../models/Snippet.js';
import Solution from '../models/Solution.js';
import Resource from '../models/Resource.js';
import Thread from '../models/Thread.js';
import Message from '../models/Message.js';
import Learning from '../models/Learning.js';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';
import { incrementUserAnalytics } from '../utils/analyticsHelpers.js';

export async function createProject(req, res) {
  try {
  const { name, description, visibility = 'private', allowMemberInvites = false, projectPassword } = req.body;
    if (!name) return res.status(400).json({ ok: false, error: 'Name required' });
  
  // Fix: Ensure consistent user ID storage
  const project = await Project.create({ 
    name: name.trim(), 
    description, 
    visibility, 
    allowMemberInvites, 
    createdBy: req.user.id, 
    members: [{ user: String(req.user.id), role: 'owner' }],
    projectPassword: projectPassword || undefined // Only set if provided
  });
  
  // Increment user's lifetime project count
  await incrementUserAnalytics(req.user.id, 'totalProjectsCreated');
  
    res.status(201).json({ ok: true, project });
  } catch (e) {
    // Handle duplicate project name error (MongoDB E11000)
    if (e.code === 11000 && e.keyPattern?.name) {
      return res.status(400).json({ 
        ok: false, 
        error: 'A project with this name already exists. Please choose a different name.' 
      });
    }
    res.status(500).json({ ok: false, error: 'Create failed' });
  }
}

export async function listMyProjects(req, res) {
  try {
    // Fix: Search for both string and ObjectId versions to handle all projects
    const projects = await Project.find({ 
      $or: [
        { 'members.user': req.user.id },
        { 'members.user': String(req.user.id) }
      ]
    }).sort({ createdAt: -1 });
    res.json({ ok: true, projects });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed' });
  }
}

export async function listUserProjects(req, res) {
  try {
    const { userId } = req.params;
    // Get projects where the specified user is a member
    const projects = await Project.find({ 
      $or: [
        { 'members.user': userId },
        { 'members.user': String(userId) }
      ]
    }).sort({ createdAt: -1 });
    res.json({ ok: true, projects });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed' });
  }
}

export async function getProject(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate('members.user', 'name email avatar');
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    
    // Fix: Ensure consistent string comparison for membership check  
    const userId = req.user.id;
    const isMember = project.members.some(m => String(m.user?._id || m.user) === String(userId));
    
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    res.json({ ok: true, project });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed' });
  }
}

export async function updateProjectSettings(req, res) {
  try {
    const { id } = req.params;
    const { visibility, allowMemberInvites, name, description, projectPassword } = req.body || {};
    const project = await Project.findById(id).populate('members.user', 'name email avatar');
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    const me = req.user.id;
  // Settings editing is intentionally restricted to OWNER ONLY (admins get read-only client UI)
  // Fix: Ensure consistent string comparison for ownership check with populated members
  const isOwner = project.members.some(m => String(m.user?._id || m.user) === String(me) && m.role === 'owner');
  if (!isOwner) return res.status(403).json({ ok: false, error: 'Forbidden' });
    if (visibility) project.visibility = visibility;
    if (typeof allowMemberInvites === 'boolean') project.allowMemberInvites = allowMemberInvites;
    if (name && name.trim()) project.name = name.trim();
    if (typeof description === 'string') project.description = description;
    if (typeof projectPassword === 'string') project.projectPassword = projectPassword;
    await project.save();
    res.json({ ok: true, project });
  } catch (e) {
    // Handle duplicate project name error when renaming
    if (e.code === 11000 && e.keyPattern?.name) {
      return res.status(400).json({ 
        ok: false, 
        error: 'A project with this name already exists. Please choose a different name.' 
      });
    }
    res.status(500).json({ ok: false, error: 'Update failed' });
  }
}

export async function listPublicProjects(_req, res) {
  try {
    const projects = await Project.find({ visibility: 'public' }).sort({ createdAt: -1 }).select('name description createdAt');
    res.json({ ok: true, projects });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed' });
  }
}

// Simple project search for dashboard
export async function searchProjects(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ ok: true, projects: [] });
    }
    
    const searchQuery = {
      visibility: 'public', // Only search public projects
      $or: [
        { name: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } }
      ]
    };
    
    const projects = await Project.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(10) // Limit results to keep it simple
      .select('name description visibility members createdAt')
      .lean();
    
    // Add member count for each project
    const projectsWithStats = projects.map(p => ({
      ...p,
      memberCount: p.members?.length || 0
    }));
    
    res.json({ ok: true, projects: projectsWithStats });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Search failed' });
  }
}

export async function joinPublicProject(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    if (project.visibility !== 'public') return res.status(400).json({ ok: false, error: 'Project is private' });
    
    // Fix: Ensure consistent string comparison for membership check
    const isAlreadyMember = project.members.some(m => String(m.user) === String(userId));
    
    if (isAlreadyMember) {
      return res.json({ ok: true, project });
    }
    
    project.members.push({ user: String(userId), role: 'member' });
    await project.save();
    
    // Send notifications about new member joining
    const newMember = await User.findById(userId);
    if (newMember) {
      const { notifyMemberJoined } = await import('../utils/notificationHelpers.js');
      notifyMemberJoined(project, newMember).catch(err => 
        console.error('Failed to send member joined notifications:', err)
      );
    }
    
    res.json({ ok: true, project });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Join failed' });
  }
}

// Simple private project join endpoint that requires project name and password
export async function joinPrivateProject(req, res) {
  try {
    const { projectName, password } = req.body;
    const userId = req.user.id;

    if (!projectName || !password) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Both project name and password are required' 
      });
    }

    // Find private project with exact name match (case-sensitive) and password
    const project = await Project.findOne({ 
      name: projectName.trim(), // Exact match (case-sensitive like GitHub)
      visibility: 'private',
      projectPassword: password.trim()
    });

    if (!project) {
      return res.status(404).json({ 
        ok: false, 
        error: 'No private project found with that name and password combination' 
      });
    }

    // Check if user is already a member
    const isAlreadyMember = project.members.some(m => String(m.user) === String(userId));
    
    if (isAlreadyMember) {
      return res.json({ 
        ok: true, 
        project, 
        message: 'You are already a member of this project' 
      });
    }
    
    // Add user to project
    project.members.push({ user: String(userId), role: 'member' });
    await project.save();
    
    // Send notifications about new member joining
    const newMember = await User.findById(userId);
    if (newMember) {
      const { notifyMemberJoined } = await import('../utils/notificationHelpers.js');
      notifyMemberJoined(project, newMember).catch(err => 
        console.error('Failed to send member joined notifications:', err)
      );
    }
    
    res.json({ 
      ok: true, 
      project,
      message: `Successfully joined "${project.name}"!` 
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Join failed' });
  }
}

export async function listProjectMembers(req, res) {
  try {
    const { id } = req.params;
    let project = await Project.findById(id).populate('members.user', 'name email avatar');
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    // Fix: consistent string comparison
    const isMember = project.members.some(m => String(m.user?._id || m.user) === String(req.user.id));
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const members = project.members.map(m => ({
      user: m.user?._id || m.user,
      name: m.user?.name || '',
      email: m.user?.email || '',
      avatar: m.user?.avatar || '',
      role: m.role
    }));
    res.json({ ok: true, members });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed' });
  }
}

export async function updateMemberRole(req, res) {
  try {
    const { id, userId } = req.params;
    const { role } = req.body || {};
    if (!['admin', 'member'].includes(role)) return res.status(400).json({ ok: false, error: 'Invalid role' });
    const project = await Project.findById(id).populate('members.user', 'name email avatar');
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    // Only owners can change member roles
    // Fix: consistent string comparison
    const meIsOwner = project.members.some(m => String(m.user?._id || m.user) === String(req.user.id) && m.role === 'owner');
    if (!meIsOwner) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const mIdx = project.members.findIndex(m => String(m.user?._id || m.user) === String(userId));
    if (mIdx === -1) return res.status(404).json({ ok: false, error: 'Member not found' });
    if (project.members[mIdx].role === 'owner') return res.status(400).json({ ok: false, error: 'Cannot modify owner role' });
    project.members[mIdx].role = role;
    await project.save();
    const updated = project.members.map(m => ({
      user: m.user?._id || m.user,
      name: m.user?.name || '',
      email: m.user?.email || '',
      avatar: m.user?.avatar || '',
      role: m.role
    }));
    res.json({ ok: true, members: updated });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Update failed' });
  }
}

export async function removeMember(req, res) {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    // Only owners can remove members - Fix: consistent string comparison
    const meIsOwner = project.members.some(m => String(m.user) === String(req.user.id) && m.role === 'owner');
    if (!meIsOwner) return res.status(403).json({ ok: false, error: 'Forbidden' });
    
    const mIdx = project.members.findIndex(m => String(m.user) === String(userId));
    if (mIdx === -1) return res.status(404).json({ ok: false, error: 'Member not found' });
    if (project.members[mIdx].role === 'owner') return res.status(400).json({ ok: false, error: 'Cannot remove an owner' });
    
    // Get member info before removing for notification
    const User = (await import('../models/User.js')).default;
    const removedMember = await User.findById(userId);
    
    project.members.splice(mIdx, 1);
    await project.save();
    
    // Send notifications about member being removed
    if (removedMember) {
      const { notifyMemberRemoved } = await import('../utils/notificationHelpers.js');
      const removedBy = await User.findById(req.user.id);
      notifyMemberRemoved(project, removedMember, removedBy).catch(err => 
        console.error('Failed to send member removed notifications:', err)
      );
    }
    
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Remove failed' });
  }
}

// Allow a non-owner member (member or admin) to leave the project themselves
export async function leaveProject(req, res) {
  try {
    const { id } = req.params; // project id
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    // Fix: consistent string comparison
    const idx = project.members.findIndex(m => String(m.user) === String(req.user.id));
    if (idx === -1) return res.status(403).json({ ok: false, error: 'Forbidden' });
    if (project.members[idx].role === 'owner') return res.status(400).json({ ok: false, error: 'Owner cannot leave (transfer ownership first)' });
    
    // Get member info before removing for notification
    const User = (await import('../models/User.js')).default;
    const leavingMember = await User.findById(req.user.id);
    
    project.members.splice(idx, 1);
    await project.save();
    
    // Send notifications about member leaving
    if (leavingMember) {
      const { notifyMemberLeft } = await import('../utils/notificationHelpers.js');
      notifyMemberLeft(project, leavingMember).catch(err => 
        console.error('Failed to send member left notifications:', err)
      );
    }
    
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Leave failed' });
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    // Fix: consistent string comparison
    const meIsOwner = project.members.some(m => String(m.user) === String(req.user.id) && m.role === 'owner');
    if (!meIsOwner) return res.status(403).json({ ok: false, error: 'Forbidden' });
    // Cascade delete related documents
    await Promise.all([
      Task.deleteMany({ project: id }),
      Snippet.deleteMany({ project: id }),
      Solution.deleteMany({ project: id }),
      Resource.deleteMany({ project: id }),
      Thread.deleteMany({ project: id }),
      Message.deleteMany({ project: id }),
      Learning.deleteMany({ project: id }),
      Invitation.deleteMany({ project: id })
    ]);
    await Project.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Delete failed' });
  }
}

export async function archiveProject(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    // Fix: consistent string comparison
    const meIsOwner = project.members.some(m => String(m.user) === String(req.user.id) && m.role === 'owner');
    if (!meIsOwner) return res.status(403).json({ ok: false, error: 'Forbidden' });
    project.status = 'archived';
    await project.save();
    res.json({ ok: true, project });
  } catch (e) { res.status(500).json({ ok: false, error: 'Archive failed' }); }
}

export async function unarchiveProject(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    // Fix: consistent string comparison
    const meIsOwner = project.members.some(m => String(m.user) === String(req.user.id) && m.role === 'owner');
    if (!meIsOwner) return res.status(403).json({ ok: false, error: 'Forbidden' });
    project.status = 'active';
    await project.save();
    res.json({ ok: true, project });
  } catch (e) { res.status(500).json({ ok: false, error: 'Unarchive failed' }); }
}
