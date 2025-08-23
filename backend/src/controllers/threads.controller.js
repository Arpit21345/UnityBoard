import Thread from '../models/Thread.js';
import Message from '../models/Message.js';
import Project from '../models/Project.js';

function isMember(project, userId){
  return project.members?.some(m => String(m.user) === String(userId));
}
function isOwnerOrAdmin(project, userId){
  return project.members?.some(m => String(m.user) === String(userId) && (m.role === 'owner' || m.role === 'admin'));
}

export async function listThreads(req, res){
  try {
    const { id } = req.params; // project id
    const project = await Project.findById(id).select('members chatSingleRoom name');
    if (!project) return res.status(404).json({ ok:false, error:'Project not found' });
    if (!isMember(project, req.user.id)) return res.status(403).json({ ok:false, error:'Forbidden' });
    let items = await Thread.find({ project: id }).sort({ pinned: -1, lastActivityAt: -1, updatedAt: -1 });
    if (project.chatSingleRoom) {
      if (!items.length) {
        const title = `${project.name || 'Project'} Chat`;
        const def = await Thread.create({ project: id, title, tags: ['general'], createdBy: req.user.id, pinned: true });
        items = [def];
      } else {
        items = [items[0]];
      }
    }
    res.json({ ok:true, items });
  } catch { res.status(500).json({ ok:false, error:'Fetch failed' }); }
}

export async function createThread(req, res){
  try {
    const { id } = req.params; // project id
    const { title, tags = [] } = req.body || {};
    if (!title) return res.status(400).json({ ok:false, error:'Title required' });
    const project = await Project.findById(id).select('members chatSingleRoom');
    if (!project) return res.status(404).json({ ok:false, error:'Project not found' });
  if (project.chatSingleRoom) return res.status(400).json({ ok:false, error:'Single-room mode active' });
  if (!isOwnerOrAdmin(project, req.user.id)) return res.status(403).json({ ok:false, error:'Only owner/admin can create threads' });
  const item = await Thread.create({ project: id, title, tags, createdBy: req.user.id, lastActivityAt: new Date() });
    res.status(201).json({ ok:true, item });
  } catch { res.status(500).json({ ok:false, error:'Create failed' }); }
}

export async function updateThread(req, res){
  try {
    const { threadId } = req.params;
    const updates = req.body || {};
    const item = await Thread.findById(threadId);
    if (!item) return res.status(404).json({ ok:false, error:'Not found' });
    const project = await Project.findById(item.project).select('members');
    if (!project) return res.status(404).json({ ok:false, error:'Project not found' });
  if (!(isOwnerOrAdmin(project, req.user.id) || String(item.createdBy) === String(req.user.id))) return res.status(403).json({ ok:false, error:'Forbidden' });
    // Only owner/admin can change moderation fields
    const wantsModerationChange = Object.prototype.hasOwnProperty.call(updates, 'pinned') || Object.prototype.hasOwnProperty.call(updates, 'locked');
    if (wantsModerationChange && !isOwnerOrAdmin(project, req.user.id)) {
      return res.status(403).json({ ok:false, error:'Only owner/admin can pin or lock' });
    }
    if (typeof updates.title === 'string') item.title = updates.title;
    if (Array.isArray(updates.tags)) item.tags = updates.tags;
  if (typeof updates.pinned === 'boolean') item.pinned = updates.pinned; // owner/admin only
  if (typeof updates.locked === 'boolean') item.locked = updates.locked; // owner/admin only
    await item.save();
    res.json({ ok:true, item });
  } catch { res.status(500).json({ ok:false, error:'Update failed' }); }
}

export async function deleteThread(req, res){
  try {
    const { threadId } = req.params;
    const item = await Thread.findById(threadId);
    if (!item) return res.status(404).json({ ok:false, error:'Not found' });
    const project = await Project.findById(item.project).select('members');
    if (!project) return res.status(404).json({ ok:false, error:'Project not found' });
  if (!(isOwnerOrAdmin(project, req.user.id) || String(item.createdBy) === String(req.user.id))) return res.status(403).json({ ok:false, error:'Forbidden' });
    await Message.deleteMany({ thread: threadId });
    await Thread.deleteOne({ _id: threadId });
    res.json({ ok:true });
  } catch { res.status(500).json({ ok:false, error:'Delete failed' }); }
}

export async function listMessages(req, res){
  try {
    const { threadId } = req.params;
    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ ok:false, error:'Thread not found' });
    const project = await Project.findById(thread.project).select('members');
    if (!project) return res.status(404).json({ ok:false, error:'Project not found' });
    if (!isMember(project, req.user.id)) return res.status(403).json({ ok:false, error:'Forbidden' });
  const docs = await Message.find({ thread: threadId }).sort({ createdAt: 1 });
  const items = docs.map(m => m.deleted ? ({ _id: m._id, thread: m.thread, user: m.user, text: '(message deleted)', createdAt: m.createdAt, deleted: true }) : m);
    res.json({ ok:true, items });
  } catch { res.status(500).json({ ok:false, error:'Fetch failed' }); }
}

export async function createMessage(req, res){
  try {
    const { threadId } = req.params;
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ ok:false, error:'Text required' });
    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ ok:false, error:'Thread not found' });
    if (thread.locked) return res.status(423).json({ ok:false, error:'Thread is locked' });
    const project = await Project.findById(thread.project).select('members');
    if (!project) return res.status(404).json({ ok:false, error:'Project not found' });
    if (!isMember(project, req.user.id)) return res.status(403).json({ ok:false, error:'Forbidden' });
    const msg = await Message.create({ thread: threadId, user: req.user.id, text });
    thread.lastActivityAt = new Date();
    await thread.save();
    res.status(201).json({ ok:true, item: msg });
  } catch { res.status(500).json({ ok:false, error:'Create failed' }); }
}

export async function deleteMessage(req, res){
  try {
    const { threadId, messageId } = req.params;
    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ ok:false, error:'Thread not found' });
    const project = await Project.findById(thread.project).select('members');
    if (!project) return res.status(404).json({ ok:false, error:'Project not found' });
    const msg = await Message.findOne({ _id: messageId, thread: threadId });
    if (!msg) return res.status(404).json({ ok:false, error:'Message not found' });
    const canModerate = isOwnerOrAdmin(project, req.user.id);
    const isAuthor = String(msg.user) === String(req.user.id);
    if (!(canModerate || isAuthor)) return res.status(403).json({ ok:false, error:'Forbidden' });
    if (msg.deleted) return res.json({ ok:true, item: msg });
    msg.deleted = true;
    msg.deletedBy = req.user.id;
    msg.deletedAt = new Date();
    await msg.save();
    res.json({ ok:true, item: { _id: msg._id, thread: msg.thread, user: msg.user, text: '(message deleted)', createdAt: msg.createdAt, deleted: true } });
  } catch { res.status(500).json({ ok:false, error:'Delete failed' }); }
}
