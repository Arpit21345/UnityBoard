import { Router } from 'express';
import auth from '../middleware/auth.js';
import { updateTask } from '../controllers/task.controller.js';

const router = Router();
router.use(auth);

router.patch('/:taskId', updateTask);

export default router;
