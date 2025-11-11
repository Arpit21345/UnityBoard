import env from '../config/env.js';
import fetch from 'node-fetch';

const COHERE_API_URL = 'https://api.cohere.ai/v1/chat';

// Fallback models in order of preference
const FALLBACK_MODELS = [
  'command-a-03-2025',          // Latest and strongest Command model
  'command-r-plus-08-2024',     // R+ snapshot for tool use/long context
  'command-r-08-2024',          // Older R snapshot (cheaper)
  'command'                     // Basic fallback
];

async function callCohereWithFallback(prompt, options = {}) {
  if (!env.cohere.apiKey) throw new Error('COHERE_API_KEY not set');
  
  // Start with configured model, then try fallbacks
  const modelsToTry = [env.cohere.model, ...FALLBACK_MODELS.filter(m => m !== env.cohere.model)];
  
  for (const model of modelsToTry) {
    try {
      const body = {
        model: model,
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
        const errorText = await res.text();
        const error = new Error(`Cohere error ${res.status}: ${errorText}`);
        
        // If model is removed/deprecated (404) or message mentions "removed", try next model
        if (res.status === 404 || errorText.includes('removed') || errorText.includes('deprecated')) {
          console.warn(`Model ${model} unavailable (${res.status}), trying next fallback...`);
          continue;
        }
        
        // For other errors, throw immediately
        throw error;
      }
      
      const data = await res.json();
      const text = data?.text || data?.message || '';
      
      // Log successful model if it wasn't the configured one
      if (model !== env.cohere.model) {
        console.info(`Successfully used fallback model: ${model}`);
      }
      
      return text;
      
    } catch (err) {
      // If it's a network/JSON error, try next model
      if (err.message.includes('fetch') || err.message.includes('JSON')) {
        console.warn(`Network/parsing error with model ${model}, trying next...`);
        continue;
      }
      
      // For other errors, try next model but log the error
      console.warn(`Error with model ${model}: ${err.message}`);
      if (model === modelsToTry[modelsToTry.length - 1]) {
        // If this was the last model, throw the error
        throw err;
      }
    }
  }
  
  throw new Error('All Cohere models failed or were unavailable. Please check your API key and model configuration.');
}

// Legacy function name for backward compatibility
async function callCohere(prompt, options = {}) {
  return callCohereWithFallback(prompt, options);
}

// Static fallback responses when AI is completely unavailable
const FALLBACK_RESPONSES = {
  tasks: [
    "• Break down large goals into smaller, manageable tasks",
    "• Set clear deadlines and priorities for each task", 
    "• Use labels or categories to organize related tasks",
    "• Review and update your task list regularly",
    "• Focus on completing high-priority items first"
  ].join('\n'),
  
  qna: {
    organize: "Try organizing tasks by priority, deadline, or project category. Break large tasks into smaller actionable steps.",
    collaborate: "Use clear communication, assign specific roles, set regular check-ins, and document decisions.",
    planning: "Start with defining clear goals, break them into milestones, estimate time needed, and build in buffer time.",
    default: "I'm here to help with your project questions. You can ask about task organization, team collaboration, or project planning."
  }
};

async function safeAiCall(aiFunction, fallbackKey, fallbackSubkey = null) {
  try {
    return await aiFunction();
  } catch (error) {
    console.warn('AI service unavailable, using fallback response:', error.message);
    
    if (fallbackSubkey && FALLBACK_RESPONSES[fallbackKey] && FALLBACK_RESPONSES[fallbackKey][fallbackSubkey]) {
      return FALLBACK_RESPONSES[fallbackKey][fallbackSubkey];
    }
    
    return FALLBACK_RESPONSES[fallbackKey] || "Sorry, AI assistant is temporarily unavailable. Please try again later.";
  }
}

export async function aiSuggestTasks(context) {
  return safeAiCall(async () => {
    const prompt = `You are an assistant helping to generate concise actionable tasks. Context: ${context}. Return 5 short task suggestions.`;
    return callCohere(prompt);
  }, 'tasks');
}

export async function aiSummarize(text) {
  return safeAiCall(async () => {
    const prompt = `Summarize the following for a project log in 5-7 bullet points:\n\n${text}`;
    return callCohere(prompt, { max_tokens: Math.min(env.cohere.maxTokens, 400) });
  }, 'default', null);
}

export async function aiQnA(question, context = '') {
  return safeAiCall(async () => {
    const prompt = `Answer briefly and helpfully. Question: ${question}\nContext: ${context}`;
    return callCohere(prompt, { max_tokens: Math.min(env.cohere.maxTokens, 256) });
  }, 'qna', getQnAFallbackKey(question));
}

function getQnAFallbackKey(question) {
  const q = question.toLowerCase();
  if (q.includes('organiz') || q.includes('task') || q.includes('manage')) return 'organize';
  if (q.includes('collaborat') || q.includes('team') || q.includes('work together')) return 'collaborate';
  if (q.includes('plan') || q.includes('schedule') || q.includes('timeline')) return 'planning';
  return 'default';
}
