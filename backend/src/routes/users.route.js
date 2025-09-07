import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { updateMe } from '../controllers/users.controller.js';

const router = Router();

router.patch('/users/me', requireAuth, updateMe);

export default router;
