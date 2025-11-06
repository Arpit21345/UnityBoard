import Thread from '../models/Thread.js';
import Message from '../models/Message.js';
import Project from '../models/Project.js';
import { getIo } from '../socketHub.js';
import { incrementUserAnalytics } from '../utils/analyticsHelpers.js';

function isMember(project, userId){
  return project.members?.some(m => {
    // Handle both populated and non-populated user references
    const memberId = typeof m.user === 'object' ? m.user._id : m.user;
    return String(memberId) === String(userId);
  });
}
function isOwnerOrAdmin(project, userId){
  return project.members?.some(m => {
    // Handle both populated and non-populated user references
    const memberId = typeof m.user === 'object' ? m.user._id : m.user;
    return String(memberId) === String(userId) && (m.role === 'owner' || m.role === 'admin');
  });
}

export async function listThreads(req, res){
  try {
    const { id } = req.params; // project id
    const project = await Project.findById(id).select('members chatSingleRoom');
    if (!project) return res.status(404).json({ ok:false, error:'Project not found' });
    if (!isMember(project, req.user.id)) return res.status(403).json({ ok:false, error:'Forbidden' });
    let items = await Thread.find({ project: id }).sort({ pinned: -1, lastActivityAt: -1, updatedAt: -1 });
    // In single-room mode, ensure one default thread and return only it
    if (project.chatSingleRoom) {
      let general = items.find(t => t.title === 'General');
      if (!general) {
        general = await Thread.create({ project: id, title: 'General', tags: [], createdBy: req.user.id, lastActivityAt: new Date() });
      }
      items = [general];
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
  if (project.chatSingleRoom) return res.status(400).json({ ok:false, error:'Single-room mode: cannot create threads' });
  if (!isOwnerOrAdmin(project, req.user.id)) return res.status(403).json({ ok:false, error:'Only owner/admin can create threads' });
  const item = await Thread.create({ project: id, title, tags, createdBy: req.user.id, lastActivityAt: new Date() });
  
  // Increment user's contributions count
  await incrementUserAnalytics(req.user.id, 'totalContributions');
  
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
    // Broadcast moderation changes
    try {
      const io = getIo();
      if (io) io.to(`project:${item.project}`).emit('thread:update', { _id: item._id, pinned: item.pinned, locked: item.locked, title: item.title, tags: item.tags });
    } catch {}
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
    try {
      const io = getIo();
      if (io) io.to(`project:${item.project}`).emit('thread:deleted', { _id: threadId });
    } catch {}
    res.json({ ok:true });
  } catch { res.status(500).json({ ok:false, error:'Delete failed' }); }
}

export async function listMessages(req, res){
  try {
    const { threadId } = req.params;
    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ ok:false, error:'Thread not found' });
    const project = await Project.findById(thread.project).populate('members.user', 'name email avatar');
    if (!project) return res.status(404).json({ ok:false, error:'Project not found' });
    if (!isMember(project, req.user.id)) return res.status(403).json({ ok:false, error:'Forbidden' });
    
    const docs = await Message.find({ thread: threadId }).populate('user', 'name email avatar').sort({ createdAt: 1 });
    const items = docs.map(m => {
      if (m.deleted) {
        return { _id: m._id, thread: m.thread, user: m.user, text: '(message deleted)', createdAt: m.createdAt, deleted: true };
      }
      return {
        _id: m._id,
        thread: m.thread,
        user: {
          _id: m.user._id,
          name: m.user.name,
          email: m.user.email,
          avatar: m.user.avatar
        },
        text: m.text,
        createdAt: m.createdAt
      };
    });
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
    await msg.populate('user', 'name email avatar');
    thread.lastActivityAt = new Date();
    await thread.save();
    
    const messageData = {
      _id: msg._id,
      thread: msg.thread,
      user: {
        _id: msg.user._id,
        name: msg.user.name,
        email: msg.user.email,
        avatar: msg.user.avatar
      },
      text: msg.text,
      createdAt: msg.createdAt
    };
    
    // Increment user's contributions count
    await incrementUserAnalytics(req.user.id, 'totalContributions');
    // Broadcast new message to project room
    try {
      const io = getIo();
      if (io) io.to(`project:${thread.project}`).emit('message:new', { threadId, item: messageData });
    } catch {}
    res.status(201).json({ ok:true, item: messageData });
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
    const payload = { _id: msg._id, thread: msg.thread, user: msg.user, text: '(message deleted)', createdAt: msg.createdAt, deleted: true };
    try {
      const io = getIo();
      if (io) io.to(`project:${thread.project}`).emit('message:deleted', { threadId, item: payload });
    } catch {}
    res.json({ ok:true, item: payload });
  } catch { res.status(500).json({ ok:false, error:'Delete failed' }); }
}
