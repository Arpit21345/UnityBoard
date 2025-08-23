import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getMe, updateMe, changePassword } from '../controllers/users.controller.js';

const router = Router();
router.use(auth);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.post('/me/change-password', changePassword);

export default router;
