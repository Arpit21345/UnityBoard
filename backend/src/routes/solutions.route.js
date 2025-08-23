import express from 'express';
import requireAuth from '../middleware/auth.js';
import { listSolutions, createSolution, updateSolution, deleteSolution } from '../controllers/solutions.controller.js';

const router = express.Router();

router.get('/projects/:id/solutions', requireAuth, listSolutions);
router.post('/projects/:id/solutions', requireAuth, createSolution);
router.patch('/solutions/:solutionId', requireAuth, updateSolution);
router.delete('/solutions/:solutionId', requireAuth, deleteSolution);

export default router;
