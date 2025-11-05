import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { updateMe, getUserById } from '../controllers/users.controller.js';

const router = Router();

router.patch('/users/me', requireAuth, updateMe);
router.get('/users/:userId', requireAuth, getUserById);

export default router;
