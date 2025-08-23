import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select('name email avatar createdAt updatedAt');
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json({ ok: true, user });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Failed to load profile' });
  }
}

export async function updateMe(req, res) {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof avatar === 'string') updates.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, select: 'name email avatar createdAt updatedAt' });
    res.json({ ok: true, user });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Update failed' });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ ok: false, error: 'Missing fields' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ ok: false, error: 'Current password incorrect' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Password change failed' });
  }
}
