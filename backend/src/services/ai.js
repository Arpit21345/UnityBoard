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
    default: `Hi! I'm your UnityBoard Assistant working on your project. I'm currently learning more about your specific needs and will be back with better assistance soon. 

In the meantime, I can help with:
• Creating and managing projects
• Adding team members (share project name & password)
• Task management and organization
• Using current UnityBoard features

Feel free to ask about any UnityBoard functionality!`
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

// Direct answers for common UnityBoard questions
const DIRECT_ANSWERS = {
  'how do i create a new project': `To create a new project in UnityBoard:
1. Go to your Dashboard
2. Click the "Create Project" button
3. Fill in project name and description
4. Choose visibility: Public (discoverable by others) or Private
5. Click "Create" to set up your project
6. You can then invite team members and start adding tasks!`,

  'create new project': `To create a new project in UnityBoard:
1. Go to your Dashboard
2. Click the "Create Project" button
3. Fill in project name and description
4. Choose visibility: Public (discoverable by others) or Private
5. Click "Create" to set up your project`,

  'how can i invite team members': `To add team members to your UnityBoard project:
1. Create your project and note the project name
2. Share the project name and password with your team members
3. Team members can then join using the shared credentials
4. Once they join, they can collaborate on tasks and project activities

Note: Email invitation feature is coming soon!`,

  'invite team members': `To add team members:
1. Share your project name and password with them
2. Team members can join using these credentials
3. They'll then have access to collaborate on your project

Note: Direct email invitations are coming soon!`,

  'what are the best project management practices': `Best practices for UnityBoard project management:
• Break large goals into smaller, manageable tasks
• Set clear deadlines and priorities for each task
• Assign specific team members to tasks for accountability
• Use the Team Chat for regular communication
• Store important files in the Resource Vault
• Track progress regularly on your project dashboard
• Hold regular team check-ins and updates
• Use task comments for detailed discussions`,

  'project management practices': `Best UnityBoard practices:
• Break work into manageable tasks
• Set clear deadlines and priorities
• Use Team Chat for communication
• Store files in Resource Vault
• Track progress on dashboard
• Hold regular team check-ins`,

  'show me unityboard features': `UnityBoard Key Features:
🎯 Project Management - Create public/private projects with team collaboration
📋 Task Management - Create, assign, and track tasks with priorities and deadlines
💬 Team Chat - Real-time messaging and communication
🌐 Explore Page - Discover and join public community projects
📚 Resource Vault - File storage and document sharing
💡 Solution Database - Best practices and knowledge sharing
⚡ Smart Snippets - Code snippet library
📊 Learning Tracker - Track progress and milestones
👤 User Profiles - Detailed contribution history
🔧 Admin Panel - Platform management and analytics`,

  'unityboard features': `UnityBoard Features:
• Project & Task Management
• Team Chat & Collaboration
• Explore Public Projects
• Resource Vault & File Storage
• Solution Database
• Smart Snippets Library
• Learning Tracker
• User Profiles & Analytics`,

  'features': `Main UnityBoard features:
• Create and manage projects
• Task assignment and tracking
• Real-time team chat
• File storage and sharing
• Discover public projects
• Track learning progress`,

  'how do i join a project': `To join projects in UnityBoard:
• For Public Projects: Go to Explore page → Browse projects → Click "Join Project"
• For Private Projects: Get the project name and password from the project owner, then use those credentials to join
• Once joined, you can participate in tasks, chat, and access project resources
• You'll have access based on your assigned role in the project`,

  'how do i manage tasks': `Task management in UnityBoard:
1. Open your project dashboard
2. Click "Add Task" or "Create Task"
3. Fill in task details: title, description, due date, priority
4. Assign to team members
5. Track status: To-Do → In Progress → In Review → Completed
6. Use task comments for discussions and updates
7. Monitor progress on your project dashboard`,

  'manage tasks': `To manage tasks:
1. Go to project dashboard
2. Click "Add Task"
3. Fill details and assign members
4. Track progress (To-Do → In Progress → Completed)  
5. Use comments for discussions`,

  'add team members': `To add team members to your project:
1. Share your project name and password with them
2. Team members can join using these shared credentials
3. Once they join, they can collaborate on tasks and project activities
Note: Email invitation system is coming soon!`,

  'team collaboration': `Current team collaboration in UnityBoard:
• Share project name and password for members to join
• Real-time team chat for communication
• Task assignment and tracking
• File sharing in Resource Vault
• Collaborative project dashboard
Note: Direct email invitations are being developed!`
};

export async function aiQnA(question, context = '') {
  // Check for direct answers first
  const normalizedQuestion = question.toLowerCase().trim();
  for (const [key, answer] of Object.entries(DIRECT_ANSWERS)) {
    if (normalizedQuestion.includes(key)) {
      return answer;
    }
  }
  
  // For other questions, use AI with simple context
  return safeAiCall(async () => {
    const prompt = `You are the UnityBoard Assistant helping users with UnityBoard project management platform.

UnityBoard is a collaborative platform with these main features:
- Project Management (create/manage projects, invite teams)
- Task Management (create/assign/track tasks)
- Team Chat (real-time messaging)
- Explore Page (discover public projects)
- Resource Vault (file storage)
- Solution Database (knowledge sharing)
- User Profiles and Analytics

Current context: ${context}
User question: ${question}

Provide a helpful answer about UnityBoard functionality. Keep it concise and accurate.`;
    
    return callCohere(prompt, { max_tokens: Math.min(env.cohere.maxTokens, 300) });
  }, 'qna', 'default');
}

function getQnAFallbackKey(question) {
  return 'default'; // Always use the friendly default fallback
}
