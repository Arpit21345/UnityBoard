import Notification from '../models/Notification.js';
import { getIo } from '../socketHub.js';
import { deleteNotifications, deleteAllNotifications } from '../utils/notificationHelpers.js';

export async function listNotifications(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const items = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(limit);
    res.json({ ok: true, items });
  } catch (e) { res.status(500).json({ ok: false, error: 'Fetch failed' }); }
}

export async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: 'Update failed' }); }
}

export async function deleteSelected(req, res) {
  try {
    const { notificationIds } = req.body;
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ ok: false, error: 'Notification IDs required' });
    }
    
    const deletedCount = await deleteNotifications(req.user.id, notificationIds);
    res.json({ ok: true, deletedCount });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || 'Delete failed' });
  }
}

export async function deleteAll(req, res) {
  try {
    const deletedCount = await deleteAllNotifications(req.user.id);
    res.json({ ok: true, deletedCount });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || 'Delete all failed' });
  }
}

export async function createTestNotification(req, res){
  try {
    const n = await Notification.create({ 
      user: req.user.id, 
      type:'test_message', 
      message:`Test notification at ${new Date().toLocaleTimeString()}`,
      meta: { test: true }
    });
    
    const io = getIo();
    if (io) {
      io.emit('notification:new', { 
        userId: String(req.user.id), 
        item: n 
      });
    }
    
    res.json({ ok: true, item: n });
  } catch (e) { 
    res.status(500).json({ ok: false, error: 'Create failed' }); 
  }
}
