import express from 'express';
import auth from '../middleware/auth.js'; // Use consistent import
import { listSnippets, createSnippet, updateSnippet, deleteSnippet } from '../controllers/snippets.controller.js';

const router = express.Router();

router.get('/projects/:id/snippets', auth, listSnippets);
router.post('/projects/:id/snippets', auth, createSnippet);
router.patch('/snippets/:snippetId', auth, updateSnippet);
router.delete('/snippets/:snippetId', auth, deleteSnippet);

export default router;
