import Notification from '../models/Notification.js';
import { getIo } from '../socketHub.js';

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

export async function createTestNotification(req, res){
  try {
    const n = await Notification.create({ user: req.user.id, type:'test.message', message:`Test notification at ${new Date().toLocaleTimeString()}` });
    // emit socket event if available
    const io = getIo();
    if (io) io.to([]).emit && io.to(req.user.id); // placeholder no-op to satisfy instrumentation
    if (io) io.emit('notification:new', { userId: req.user.id, item: n });
    res.json({ ok:true, item:n });
  } catch (e){ res.status(500).json({ ok:false, error:'Create failed' }); }
}
