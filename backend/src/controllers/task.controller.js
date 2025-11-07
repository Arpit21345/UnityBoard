import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { notifyTaskAssigned } from '../utils/notificationHelpers.js';
import { incrementUserAnalytics } from '../utils/analyticsHelpers.js';

export async function createTask(req, res) {
  try {
    const { id } = req.params; // project id
    const { title, description, priority, dueDate, assignees = [], labels = [] } = req.body;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    if (!project.members.some(m => String(m.user) === req.user.id)) return res.status(403).json({ ok: false, error: 'Forbidden' });
    
    const task = await Task.create({ project: id, title, description, priority, dueDate, assignees, labels });
    
    // Send notifications to assigned users
    if (assignees && assignees.length > 0) {
      const assignedBy = await User.findById(req.user.id);
      const notificationPromises = assignees.map(async (assigneeId) => {
        // Don't notify if user assigned task to themselves
        if (String(assigneeId) !== req.user.id) {
          await notifyTaskAssigned(task, project, String(assigneeId), assignedBy);
        }
      });
      
      // Don't wait for notifications to complete
      Promise.all(notificationPromises).catch(() => {});
    }
    
    res.status(201).json({ ok: true, task });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Create failed' });
  }
}

export async function listTasks(req, res) {
  try {
    const { id } = req.params; // project id
    const tasks = await Task.find({ project: id }).sort({ createdAt: -1 });
    res.json({ ok: true, tasks });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed' });
  }
}

export async function updateTask(req, res) {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    delete updates._id; // Prevent ID override
    
    const task = await Task.findById(taskId).populate('project', 'members name');
    if (!task) return res.status(404).json({ ok: false, error: 'Not found' });
    
    // Ensure requester is a project member
    if (!task.project.members.some(m => String(m.user) === req.user.id)) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    
    // Store old values for comparison
    const oldAssignees = task.assignees ? task.assignees.map(id => String(id)) : [];
    const oldStatus = task.status;
    
    // Update task
    const updated = await Task.findByIdAndUpdate(taskId, updates, { new: true });
    
    // If task was completed by user, increment their analytics
    if (updates.status === 'completed' && oldStatus !== 'completed') {
      await incrementUserAnalytics(req.user.id, 'totalTasksCompleted');
    }
    
    // Handle notifications for assignment changes
    if (updates.assignees !== undefined) {
      const newAssignees = Array.isArray(updates.assignees) ? updates.assignees.map(id => String(id)) : [];
      const addedAssignees = newAssignees.filter(id => !oldAssignees.includes(id));
      
      if (addedAssignees.length > 0) {
        const assignedBy = await User.findById(req.user.id);
        const notificationPromises = addedAssignees.map(async (assigneeId) => {
          // Don't notify if user assigned task to themselves
          if (String(assigneeId) !== req.user.id) {
            await notifyTaskAssigned(updated, task.project, assigneeId, assignedBy);
          }
        });
        
        // Don't wait for notifications to complete
        Promise.all(notificationPromises).catch(() => {});
      }
    }
    
    res.json({ ok: true, task: updated });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Update failed' });
  }
}

export async function deleteTask(req, res) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).select('project');
    if (!task) return res.status(404).json({ ok: false, error: 'Not found' });
    // Ensure requester is a project member
    const project = await Project.findById(task.project).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    await Task.deleteOne({ _id: taskId });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Delete failed' });
  }
}

export async function listTaskComments(req, res) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).select('comments project');
    if (!task) return res.status(404).json({ ok: false, error: 'Not found' });
    // Ensure requester is a project member
    const project = await Project.findById(task.project).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const comments = (task.comments || []).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    res.json({ ok: true, comments });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed' });
  }
}

export async function addTaskComment(req, res) {
  try {
    const { taskId } = req.params;
    const { text } = req.body || {};
    if (!text || !String(text).trim()) return res.status(400).json({ ok: false, error: 'Text required' });
    const task = await Task.findById(taskId).select('comments project');
    if (!task) return res.status(404).json({ ok: false, error: 'Not found' });
    const project = await Project.findById(task.project).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const comment = { user: req.user.id, text: String(text).trim(), createdAt: new Date() };
    task.comments.push(comment);
    await task.save();
    res.status(201).json({ ok: true, comment });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Create failed' });
  }
}
