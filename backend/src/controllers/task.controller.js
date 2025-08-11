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
