import env from '../config/env.js';
import fetch from 'node-fetch';

const COHERE_API_URL = 'https://api.cohere.ai/v1/chat';

async function callCohere(prompt, options = {}) {
  if (!env.cohere.apiKey) throw new Error('COHERE_API_KEY not set');
  const body = {
    model: env.cohere.model,
    // Cohere v1/chat expects a single `message` string and optional `chat_history`.
    message: prompt,
    max_tokens: env.cohere.maxTokens,
    temperature: 0.3,
    ...options
  };
  const res = await fetch(COHERE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.cohere.apiKey}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text();
    // Include response text for easier debugging upstream; it will be sanitized by route error handlers.
    throw new Error(`Cohere error ${res.status}: ${t}`);
  }
  const data = await res.json();
  // Cohere typically returns { text: string, ... }
  const text = data?.text || data?.message || '';
  return text;
}

export async function aiSuggestTasks(context) {
  const prompt = `You are an assistant helping to generate concise actionable tasks. Context: ${context}. Return 5 short task suggestions.`;
  return callCohere(prompt);
}

export async function aiSummarize(text) {
  const prompt = `Summarize the following for a project log in 5-7 bullet points:\n\n${text}`;
  return callCohere(prompt, { max_tokens: Math.min(env.cohere.maxTokens, 400) });
}

export async function aiQnA(question, context = '') {
  const prompt = `Answer briefly and helpfully. Question: ${question}\nContext: ${context}`;
  return callCohere(prompt, { max_tokens: Math.min(env.cohere.maxTokens, 256) });
}
