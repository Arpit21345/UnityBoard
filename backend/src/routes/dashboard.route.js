import { Router } from 'express';
import auth from '../middleware/auth.js'; // Use consistent import
import { getDashboardOverview } from '../controllers/dashboard.controller.js';

const router = Router();

// Aggregate lightweight dashboard stats for current user.
router.get('/dashboard/overview', auth, getDashboardOverview);

export default router;
