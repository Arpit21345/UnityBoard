import express from 'express';
import requireAuth from '../middleware/auth.js';
import { listLearning, createLearning, updateLearning, deleteLearning } from '../controllers/learning.controller.js';

const router = express.Router();

// Project-scoped
router.get('/projects/:id/learning', requireAuth, listLearning);
router.post('/projects/:id/learning', requireAuth, createLearning);

// Entry-scoped
router.patch('/learning/:entryId', requireAuth, updateLearning);
router.delete('/learning/:entryId', requireAuth, deleteLearning);

export default router;
