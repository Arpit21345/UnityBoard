import express from 'express';
import auth from '../middleware/auth.js'; // Use consistent import
import { listThreads, createThread, updateThread, deleteThread, listMessages, createMessage, deleteMessage } from '../controllers/threads.controller.js';

const router = express.Router();

router.get('/projects/:id/threads', auth, listThreads);
router.post('/projects/:id/threads', auth, createThread);
router.patch('/threads/:threadId', auth, updateThread);
router.delete('/threads/:threadId', auth, deleteThread);
router.get('/threads/:threadId/messages', auth, listMessages);
router.post('/threads/:threadId/messages', auth, createMessage);
router.delete('/threads/:threadId/messages/:messageId', auth, deleteMessage);

export default router;
