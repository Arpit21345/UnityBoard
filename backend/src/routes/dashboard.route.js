import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDashboardOverview } from '../controllers/dashboard.controller.js';

const router = Router();

// Aggregate lightweight dashboard stats for current user.
router.get('/dashboard/overview', requireAuth, getDashboardOverview);

export default router;
