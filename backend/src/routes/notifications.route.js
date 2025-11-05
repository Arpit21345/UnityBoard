import { Router } from 'express';
import auth from '../middleware/auth.js';
import { listNotifications, markAllRead, deleteSelected, deleteAll, createTestNotification } from '../controllers/notification.controller.js';

const router = Router();
router.use(auth);
router.get('/', listNotifications);
router.post('/mark-all-read', markAllRead);
router.delete('/selected', deleteSelected);
router.delete('/all', deleteAll);
router.post('/test', createTestNotification);

export default router;
