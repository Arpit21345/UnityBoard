import express from 'express';
import requireAuth from '../middleware/auth.js';
import { listThreads, createThread, updateThread, deleteThread, listMessages, createMessage, deleteMessage } from '../controllers/threads.controller.js';

const router = express.Router();

router.get('/projects/:id/threads', requireAuth, listThreads);
router.post('/projects/:id/threads', requireAuth, createThread);
router.patch('/threads/:threadId', requireAuth, updateThread);
router.delete('/threads/:threadId', requireAuth, deleteThread);
router.get('/threads/:threadId/messages', requireAuth, listMessages);
router.post('/threads/:threadId/messages', requireAuth, createMessage);
router.delete('/threads/:threadId/messages/:messageId', requireAuth, deleteMessage);

export default router;
