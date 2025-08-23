import express from 'express';
import requireAuth from '../middleware/auth.js';
import { listSnippets, createSnippet, updateSnippet, deleteSnippet } from '../controllers/snippets.controller.js';

const router = express.Router();

router.get('/projects/:id/snippets', requireAuth, listSnippets);
router.post('/projects/:id/snippets', requireAuth, createSnippet);
router.patch('/snippets/:snippetId', requireAuth, updateSnippet);
router.delete('/snippets/:snippetId', requireAuth, deleteSnippet);

export default router;
