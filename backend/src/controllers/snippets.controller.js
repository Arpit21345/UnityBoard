import Snippet from '../models/Snippet.js';
import Project from '../models/Project.js';

export async function listSnippets(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const items = await Snippet.find({ project: id }).sort({ updatedAt: -1 });
    res.json({ ok: true, items });
  } catch (e) { res.status(500).json({ ok: false, error: 'Fetch failed' }); }
}

export async function createSnippet(req, res) {
  try {
    const { id } = req.params;
    const { title, code = '', language = 'plaintext', tags = [], notes = '' } = req.body || {};
    if (!title) return res.status(400).json({ ok: false, error: 'Title required' });
    const project = await Project.findById(id).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const item = await Snippet.create({ project: id, title, code, language, tags, notes, createdBy: req.user.id });
    res.status(201).json({ ok: true, item });
  } catch (e) { res.status(500).json({ ok: false, error: 'Create failed' }); }
}

export async function updateSnippet(req, res) {
  try {
    const { snippetId } = req.params;
    const updates = req.body || {};
    const item = await Snippet.findById(snippetId);
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

export async function deleteSnippet(req, res) {
  try {
    const { snippetId } = req.params;
    const item = await Snippet.findById(snippetId);
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    const project = await Project.findById(item.project).select('members');
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isMember = project.members.some(m => String(m.user) === req.user.id);
    if (!isMember) return res.status(403).json({ ok: false, error: 'Forbidden' });
    await Snippet.deleteOne({ _id: snippetId });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: 'Delete failed' }); }
}
