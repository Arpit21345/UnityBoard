import Task from '../models/Task.js';
import Project from '../models/Project.js';

export async function createTask(req, res) {
  try {
    const { id } = req.params; // project id
    const { title, description, priority, dueDate } = req.body;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    if (!project.members.some(m => String(m.user) === req.user.id)) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const task = await Task.create({ project: id, title, description, priority, dueDate });
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
    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });
    if (!task) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, task });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Update failed' });
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
