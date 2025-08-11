import Project from '../models/Project.js';
import Resource from '../models/Resource.js';
import env from '../config/env.js';
import { makeFileRecord } from '../services/uploads.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

async function ensureMember(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return { ok: false, code: 404, error: 'Project not found' };
  const isMember = project.members.some(m => String(m.user) === String(userId));
  if (!isMember) return { ok: false, code: 403, error: 'Forbidden' };
  return { ok: true, project };
}

export async function listResources(req, res) {
  try {
    const { id } = req.params; // project id
    const check = await ensureMember(id, req.user.id);
    if (!check.ok) return res.status(check.code).json({ ok: false, error: check.error });
    const items = await Resource.find({ project: id }).sort({ createdAt: -1 });
    res.json({ ok: true, resources: items });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed' });
  }
}

export async function uploadResource(req, res) {
  try {
    const { id } = req.params; // project id
    const check = await ensureMember(id, req.user.id);
    if (!check.ok) return res.status(check.code).json({ ok: false, error: check.error });

    if (!req.file) return res.status(400).json({ ok: false, error: 'No file' });

    let record;
    if (env.fileStorage === 'local') {
      record = makeFileRecord(req.file);
    } else {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      record = { provider: 'cloudinary', url: result.secure_url, mime: req.file.mimetype, size: req.file.size, name: req.file.originalname };
    }

    const resource = await Resource.create({
      project: id,
      type: 'file',
      title: req.body?.title || record?.name,
      url: record.url,
      provider: record.provider,
      mime: record.mime,
      size: record.size,
      name: record.name,
      createdBy: req.user.id
    });

    res.status(201).json({ ok: true, resource });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Upload failed' });
  }
}

export async function createLinkResource(req, res) {
  try {
    const { id } = req.params; // project id
    const { title, url } = req.body || {};
    if (!url) return res.status(400).json({ ok: false, error: 'URL required' });

    const check = await ensureMember(id, req.user.id);
    if (!check.ok) return res.status(check.code).json({ ok: false, error: check.error });

    const resource = await Resource.create({
      project: id,
      type: 'link',
      title: title || url,
      url,
      provider: 'external',
      createdBy: req.user.id
    });

    res.status(201).json({ ok: true, resource });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Create failed' });
  }
}

export async function deleteResource(req, res) {
  try {
    const { id, resourceId } = req.params;
    const check = await ensureMember(id, req.user.id);
    if (!check.ok) return res.status(check.code).json({ ok: false, error: check.error });

    const resource = await Resource.findOne({ _id: resourceId, project: id });
    if (!resource) return res.status(404).json({ ok: false, error: 'Not found' });

    await Resource.deleteOne({ _id: resourceId });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Delete failed' });
  }
}
