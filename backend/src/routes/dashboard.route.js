import express from 'express';
import requireAuth from '../middleware/auth.js';
import { projectStats } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/projects/:id/stats', requireAuth, projectStats);

export default router;
