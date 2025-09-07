import { Router } from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Simple aggregated search across user's projects (projects by name, tasks by title, members by name/email) limited result counts.
router.get('/search', requireAuth, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ ok: true, projects: [], tasks: [], members: [] });
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    // Find user projects
    const myProjects = await Project.find({ 'members.user': req.user.id }).select('name members').limit(40);
    const projectIds = myProjects.map(p => p._id);
    const projects = myProjects.filter(p => regex.test(p.name)).slice(0, 8).map(p => ({ _id: p._id, name: p.name }));
    // Tasks search
    const tasks = await Task.find({ project: { $in: projectIds }, title: regex }).select('title project').limit(10);
    // Members: collect user ids from projects then search names/emails
    const memberIds = [...new Set(myProjects.flatMap(p => p.members.map(m => String(m.user))))];
    const users = await User.find({ _id: { $in: memberIds }, $or: [{ name: regex }, { email: regex }] }).select('name email').limit(10);
    const members = users.map(u => ({ _id: u._id, name: u.name, email: u.email }));
    res.json({ ok: true, projects, tasks, members });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Search failed' });
  }
});

export default router;