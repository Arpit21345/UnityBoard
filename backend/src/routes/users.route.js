import { Router } from 'express';
import auth from '../middleware/auth.js'; // Use consistent import
import { updateMe, getUserById } from '../controllers/users.controller.js';

const router = Router();

router.patch('/users/me', auth, updateMe);
router.get('/users/:userId', auth, getUserById);

export default router;
