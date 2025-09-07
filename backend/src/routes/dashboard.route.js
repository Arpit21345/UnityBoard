import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const router = Router();

// Aggregate lightweight dashboard stats for current user.
router.get('/dashboard/overview', requireAuth, async (req, res) => {
	try {
		const userId = req.user.id;
		const projects = await Project.find({ 'members.user': userId }).select('name visibility members');
		const projectIds = projects.map(p => p._id);
		// My open tasks (limit 20 for now)
		const myTasks = await Task.find({ project: { $in: projectIds }, assignees: userId, status: { $ne: 'done' } })
			.select('title project status priority dueDate')
			.sort({ dueDate: 1, updatedAt: -1 })
			.limit(20);
		const now = new Date();
		const soon = new Date(Date.now() + 1000*60*60*24*7); // 7 days
		const dueSoonCount = await Task.countDocuments({ project: { $in: projectIds }, assignees: userId, status: { $ne: 'done' }, dueDate: { $gte: now, $lte: soon } });
		res.json({ ok:true, projects: projects.map(p => ({ _id:p._id, name:p.name, visibility:p.visibility, members:p.members })), myTasks, dueSoonCount });
	} catch(e){
		res.status(500).json({ ok:false, error:'Overview failed' });
	}
});

export default router;
