import { Router } from 'express';
import auth from '../middleware/auth.js';
import { listNotifications, markAllRead, createTestNotification } from '../controllers/notification.controller.js';

const router = Router();
router.use(auth);
router.get('/', listNotifications);
router.post('/mark-all-read', markAllRead);
router.post('/test', createTestNotification);

export default router;
