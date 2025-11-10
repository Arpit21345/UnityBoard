import express from 'express';
import auth from '../middleware/auth.js'; // Use consistent import
import { listSolutions, createSolution, updateSolution, deleteSolution } from '../controllers/solutions.controller.js';

const router = express.Router();

router.get('/projects/:id/solutions', auth, listSolutions);
router.post('/projects/:id/solutions', auth, createSolution);
router.patch('/solutions/:solutionId', auth, updateSolution);
router.delete('/solutions/:solutionId', auth, deleteSolution);

export default router;
