import Learning from '../models/Learning.js';
import Project from '../models/Project.js';

export async function listLearning(req, res) {
  try {
    const { id } = req.params; // project id
    const project = await Project.findById(id).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    // Only show learnings created by the current user (personal learning tracker)
    const items = await Learning.find({ project: id, createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ ok: true, items });
  } catch (e) { res.status(500).json({ ok: false, error: 'Fetch failed' }); }
}

export async function createLearning(req, res) {
  try {
    const { id } = req.params; // project id
    const { title, description, status = 'todo', tags = [], dueDate, materials = [] } = req.body || {};
    if (!title) return res.status(400).json({ ok: false, error: 'Title required' });
    const project = await Project.findById(id).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const item = await Learning.create({ project: id, title, description, status, tags, dueDate, materials, createdBy: req.user.id });
    res.status(201).json({ ok: true, item });
  } catch (e) { res.status(500).json({ ok: false, error: 'Create failed' }); }
}

export async function updateLearning(req, res) {
  try {
    const { entryId } = req.params;
    const updates = req.body || {};
    const item = await Learning.findById(entryId);
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    const project = await Project.findById(item.project).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    Object.assign(item, updates);
    await item.save();
    res.json({ ok: true, item });
  } catch (e) { res.status(500).json({ ok: false, error: 'Update failed' }); }
}

export async function deleteLearning(req, res) {
  try {
    const { entryId } = req.params;
    const item = await Learning.findById(entryId);
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    const project = await Project.findById(item.project).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    await Learning.deleteOne({ _id: entryId });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: 'Delete failed' }); }
}
