import Project from '../models/Project.js';

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
