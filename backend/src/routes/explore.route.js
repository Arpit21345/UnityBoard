import { Router } from 'express';
import { listPublicProjects } from '../controllers/project.controller.js';

const router = Router();
router.get('/projects', listPublicProjects);
export default router;
