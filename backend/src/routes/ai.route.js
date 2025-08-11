import { Router } from 'express';
import { aiSuggestTasks, aiSummarize, aiQnA } from '../services/ai.js';
import env from '../config/env.js';

const router = Router();

router.get('/health', (req, res) => {
  const hasKey = Boolean(env.cohere.apiKey);
  res.json({ ok: true, provider: 'cohere', hasKey, model: env.cohere.model });
});

router.post('/suggest-tasks', async (req, res) => {
  try {
    const { context = '' } = req.body || {};
    const text = await aiSuggestTasks(context);
    res.json({ ok: true, text });
  } catch (e) {
  console.error('AI /suggest-tasks error:', e?.message || e);
  res.status(400).json({ ok: false, error: e.message });
  }
});

router.post('/summarize', async (req, res) => {
  try {
    const { text = '' } = req.body || {};
    const out = await aiSummarize(text);
    res.json({ ok: true, text: out });
  } catch (e) {
  console.error('AI /summarize error:', e?.message || e);
  res.status(400).json({ ok: false, error: e.message });
  }
});

router.post('/qna', async (req, res) => {
  try {
    const { question = '', context = '' } = req.body || {};
    const out = await aiQnA(question, context);
    res.json({ ok: true, text: out });
  } catch (e) {
  console.error('AI /qna error:', e?.message || e);
  res.status(400).json({ ok: false, error: e.message });
  }
});

export default router;
