import express from 'express';
import auth from '../middleware/auth.js'; // Use consistent import
import { listLearning, createLearning, updateLearning, deleteLearning } from '../controllers/learning.controller.js';

const router = express.Router();

// Project-scoped
router.get('/projects/:id/learning', auth, listLearning);
router.post('/projects/:id/learning', auth, createLearning);

// Entry-scoped
router.patch('/learning/:entryId', auth, updateLearning);
router.delete('/learning/:entryId', auth, deleteLearning);

export default router;
