import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Snippet from '../models/Snippet.js';
import Solution from '../models/Solution.js';
import Resource from '../models/Resource.js';
import Thread from '../models/Thread.js';
import Message from '../models/Message.js';
import Learning from '../models/Learning.js';
import Invitation from '../models/Invitation.js';

export async function createProject(req, res) {
  try {
  const { name, description, visibility = 'private', allowMemberInvites = false } = req.body;
    if (!name) return res.status(400).json({ ok: false, error: 'Name required' });
  const project = await Project.create({ name, description, visibility, allowMemberInvites, createdBy: req.user.id, members: [{ user: req.user.id, role: 'owner' }] });
    res.status(201).json({ ok: true, project });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Create failed' });
  }
}

export async function listMyProjects(req, res) {
  try {
    const projects = await Project.find({ 'members.user': req.user.id }).sort({ createdAt: -1 });
    res.json({ ok: true, projects });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed' });
  }
}

export async function getProject(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    if (!project.members.some(m => String(m.user) === req.user.id)) return res.status(403).json({ ok: false, error: 'Forbidden' });
    res.json({ ok: true, project });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed' });
  }
}

export async function updateProjectSettings(req, res) {
  try {
    const { id } = req.params;
    const { visibility, allowMemberInvites, name, description } = req.body || {};
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    const me = req.user.id;
    const isPrivileged = project.members.some(m => String(m.user) === me && (m.role === 'owner' || m.role === 'admin'));
    if (!isPrivileged) return res.status(403).json({ ok: false, error: 'Forbidden' });
    if (visibility) project.visibility = visibility;
    if (typeof allowMemberInvites === 'boolean') project.allowMemberInvites = allowMemberInvites;
    if (name) project.name = name;
    if (typeof description === 'string') project.description = description;
    await project.save();
    res.json({ ok: true, project });
  } catch (e) {
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

export async function joinPublicProject(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    if (project.visibility !== 'public') return res.status(400).json({ ok: false, error: 'Project is private' });
    if (project.members.some(m => String(m.user) === userId)) return res.json({ ok: true, project });
    project.members.push({ user: userId, role: 'member' });
    await project.save();
    res.json({ ok: true, project });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Join failed' });
  }
}

export async function listProjectMembers(req, res) {
  try {
    const { id } = req.params;
    let project = await Project.findById(id).populate('members.user', 'name email avatar');
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    const isMember = project.members.some(m => String(m.user?._id || m.user) === req.user.id);
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
    const meIsOwner = project.members.some(m => String(m.user?._id || m.user) === req.user.id && m.role === 'owner');
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
    // Only owners can remove members
    const meIsOwner = project.members.some(m => String(m.user) === req.user.id && m.role === 'owner');
    if (!meIsOwner) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const mIdx = project.members.findIndex(m => String(m.user) === String(userId));
    if (mIdx === -1) return res.status(404).json({ ok: false, error: 'Member not found' });
    if (project.members[mIdx].role === 'owner') return res.status(400).json({ ok: false, error: 'Cannot remove an owner' });
    project.members.splice(mIdx, 1);
    await project.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Remove failed' });
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Not found' });
    const meIsOwner = project.members.some(m => String(m.user) === req.user.id && m.role === 'owner');
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
