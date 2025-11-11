import { Router } from 'express';
import auth from '../middleware/auth.js';
import { upload } from '../services/uploads.js';
import { updateMe, getUserById, uploadAvatar } from '../controllers/users.controller.js';

const router = Router();

// Update user profile (name, avatar URL)
router.patch('/users/me', auth, updateMe);

// Upload avatar file
router.post('/users/me/avatar', auth, upload.single('avatar'), uploadAvatar);

// Get user by ID
router.get('/users/:userId', auth, getUserById);

export default router;
