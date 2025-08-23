import Solution from '../models/Solution.js';
import Project from '../models/Project.js';

export async function listSolutions(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const items = await Solution.find({ project: id }).sort({ updatedAt: -1 });
    res.json({ ok: true, items });
  } catch (e) { res.status(500).json({ ok: false, error: 'Fetch failed' }); }
}

export async function createSolution(req, res) {
  try {
    const { id } = req.params;
    const { title, problemUrl = '', category = '', difficulty = '', approach = '', code = '', language = 'plaintext', tags = [] } = req.body || {};
    if (!title) return res.status(400).json({ ok: false, error: 'Title required' });
    const project = await Project.findById(id).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const item = await Solution.create({ project: id, title, problemUrl, category, difficulty, approach, code, language, tags, createdBy: req.user.id });
    res.status(201).json({ ok: true, item });
  } catch (e) { res.status(500).json({ ok: false, error: 'Create failed' }); }
}

export async function updateSolution(req, res) {
  try {
    const { solutionId } = req.params;
    const updates = req.body || {};
    const item = await Solution.findById(solutionId);
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

export async function deleteSolution(req, res) {
  try {
    const { solutionId } = req.params;
    const item = await Solution.findById(solutionId);
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    const project = await Project.findById(item.project).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    await Solution.deleteOne({ _id: solutionId });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: 'Delete failed' }); }
}
