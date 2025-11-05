import crypto from 'crypto';
import Invitation from '../models/Invitation.js';
import Project from '../models/Project.js';

function shortCode() { return crypto.randomBytes(4).toString('hex'); }
function tokenStr() { return crypto.randomBytes(24).toString('hex'); }

function isOwnerOrAdmin(project, userId) {
  return project.members.some(m => String(m.user) === userId && (m.role === 'owner' || m.role === 'admin'));
}

export async function createInvite(req, res) {
  try {
    const { id } = req.params; // project id
    const { expiresInDays = 7, role = 'member', usageLimit = null } = req.body || {};
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    const isPrivileged = isOwnerOrAdmin(project, req.user.id) || project.allowMemberInvites;
    if (!isPrivileged) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const invite = await Invitation.create({
      project: id,
      code: shortCode(),
      token: tokenStr(),
      createdBy: req.user.id,
      role,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      usageLimit,
    });
    res.status(201).json({ ok: true, invite });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Create failed' });
  }
}

export async function listInvites(req, res) {
  try {
    const { id } = req.params; // project id
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    if (!isOwnerOrAdmin(project, req.user.id)) return res.status(403).json({ ok: false, error: 'Forbidden' });
    const invites = await Invitation.find({ project: id, enabled: true }).sort({ createdAt: -1 });
    res.json({ ok: true, invites });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed' });
  }
}

export async function toggleInvite(req, res) {
  try {
    const { inviteId } = req.params;
    const { enabled } = req.body;
    const invite = await Invitation.findById(inviteId);
    if (!invite) return res.status(404).json({ ok: false, error: 'Not found' });
    const project = await Project.findById(invite.project);
    if (!isOwnerOrAdmin(project, req.user.id)) return res.status(403).json({ ok: false, error: 'Forbidden' });
    invite.enabled = !!enabled;
    await invite.save();
    res.json({ ok: true, invite });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Update failed' });
  }
}

async function consumeInvite(invite, userId) {
  const project = await Project.findById(invite.project);
  if (!project) throw new Error('Project not found');
  if (project.members.some(m => String(m.user) === userId)) return project;
  
  project.members.push({ user: userId, role: invite.role === 'admin' ? 'admin' : 'member' });
  await project.save();
  invite.usedCount += 1;
  await invite.save();
  
  // Send notifications about new member joining via invite
  const User = (await import('../models/User.js')).default;
  const newMember = await User.findById(userId);
  if (newMember) {
    const { notifyMemberJoined } = await import('../utils/notificationHelpers.js');
    notifyMemberJoined(project, newMember).catch(err => 
      console.error('Failed to send member joined notifications:', err)
    );
  }
  
  return project;
}

export async function acceptByCode(req, res) {
  try {
    const { code } = req.body;
    const invite = await Invitation.findOne({ code, enabled: true });
    if (!invite) return res.status(404).json({ ok: false, error: 'Invalid code' });
    if (invite.expiresAt && invite.expiresAt < new Date()) return res.status(400).json({ ok: false, error: 'Expired' });
    if (invite.usageLimit && invite.usedCount >= invite.usageLimit) return res.status(400).json({ ok: false, error: 'Usage limit reached' });
    const project = await consumeInvite(invite, req.user.id);
    res.json({ ok: true, project });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Accept failed' });
  }
}

export async function acceptByToken(req, res) {
  try {
    const { token } = req.params;
    const invite = await Invitation.findOne({ token, enabled: true });
    if (!invite) return res.status(404).json({ ok: false, error: 'Invalid token' });
    if (invite.expiresAt && invite.expiresAt < new Date()) return res.status(400).json({ ok: false, error: 'Expired' });
    if (invite.usageLimit && invite.usedCount >= invite.usageLimit) return res.status(400).json({ ok: false, error: 'Usage limit reached' });
    const project = await consumeInvite(invite, req.user.id);
    res.json({ ok: true, project });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Accept failed' });
  }
}
