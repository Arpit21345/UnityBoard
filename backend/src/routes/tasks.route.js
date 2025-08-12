import { Router } from 'express';
import auth from '../middleware/auth.js';
import { updateTask, listTaskComments, addTaskComment } from '../controllers/task.controller.js';

const router = Router();
router.use(auth);

router.patch('/:taskId', updateTask);
router.get('/:taskId/comments', listTaskComments);
router.post('/:taskId/comments', addTaskComment);

export default router;
