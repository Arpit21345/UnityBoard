import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import './AiHelper.css';
import { apiAiQnA } from '../../services/ai.js';
import { useAiContext } from './AiContext.jsx';
import { useLocation } from 'react-router-dom';

export default function AiHelper() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [aiAvailable, setAiAvailable] = useState(true);
  const messagesEndRef = useRef(null);
  const { ctx, isInProject, projectContext } = useAiContext();
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const lastRequestTime = useRef(0);
  
  async function ask() {
    const q = input.trim();
    if (!q || loading) return;
    
    // Prevent rapid requests (debounce for 1 second)
    const now = Date.now();
    if (now - lastRequestTime.current < 1000) {
      console.log('Request throttled - too many requests');
      return;
    }
    lastRequestTime.current = now;
    
    setMessages(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    
    try {
      const answer = await apiAiQnA(q, ctx || '');
      setMessages(m => [...m, { role: 'assistant', text: answer }]);
      setAiAvailable(true);
    } catch (e) {
      console.error('AI Error:', e);
      setAiAvailable(false);
      let errorMessage = 'Sorry, AI is currently unavailable.';
      
      // Provide helpful suggestions based on the question
      if (q.toLowerCase().includes('task') && isInProject) {
        errorMessage += ' You can create tasks manually in the Tasks section of your project.';
      } else if (q.toLowerCase().includes('team') || q.toLowerCase().includes('member')) {
        errorMessage += ' You can manage team members in the project settings.';
      } else if (isInProject && projectContext) {
        errorMessage += ` I can see you're working on "${projectContext?.name}". Try checking the project dashboard for more information.`;
      }
      
      setMessages(m => [...m, { role: 'assistant', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  }

  const clearChat = () => {
    setMessages([]);
  };

  const getWelcomeMessage = () => {
    if (isInProject && projectContext) {
      return `Hi! I'm here to help with your project "${projectContext.name}". You can ask me about tasks, team collaboration, or anything else related to your project.`;
    }
    return "Hi! I'm your UnityBoard Assistant. I can help you with project management, task planning, and answer questions about your workspace.";
  };

  const getSuggestedQuestions = () => {
    if (isInProject && projectContext) {
      return [
        "How can I organize my tasks better?",
        "What should I work on next?",
        "How can I improve team collaboration?",
        "Help me break down a complex task"
      ];
    }
    return [
      "How do I create a new project?",
      "What are the best project management practices?",
      "How can I invite team members?",
      "Show me UnityBoard features"
    ];
  };

  // Close panel on route change to avoid overlapping with new pages
  useEffect(() => {
    setOpen(false);
  }, [location?.pathname]);

  // Show welcome message when opening for the first time
  const welcomeMessageSet = useRef(false);
  useEffect(() => {
    if (open && messages.length === 0 && !welcomeMessageSet.current) {
      welcomeMessageSet.current = true;
      setMessages([{ role: 'assistant', text: getWelcomeMessage() }]);
    }
    if (!open) {
      welcomeMessageSet.current = false;
    }
  }, [open]);

  const content = (
    <div className={`ai-helper ${open ? 'open' : ''}`} aria-live="polite">
      {open && (
        <div className="panel">
          <div className="header">
            <div className="header-content">
              <div className="header-title">
                <span className="ai-icon">🤖</span>
                UnityBoard Assistant
              </div>
              <div className="header-actions">
                {messages.length > 1 && (
                  <button className="clear-btn" onClick={clearChat} title="Clear chat">
                    🗑️
                  </button>
                )}
                <div className={`status-indicator ${aiAvailable ? 'online' : 'offline'}`} 
                     title={aiAvailable ? 'AI is available' : 'AI is offline'}>
                </div>
              </div>
            </div>
            {isInProject && projectContext && (
              <div className="project-context">
                📁 Working on: <span className="project-name">{projectContext.name}</span>
              </div>
            )}
          </div>
          
          <div className="body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="msg-content">{m.text}</div>
                {m.role === 'assistant' && i === messages.length - 1 && messages.length === 1 && (
                  <div className="suggested-questions">
                    <div className="suggestions-title">Try asking:</div>
                    {getSuggestedQuestions().map((q, idx) => (
                      <button 
                        key={idx} 
                        className="suggestion-btn"
                        onClick={() => setInput(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="msg assistant">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="input-row">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Ask anything…" 
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  ask();
                }
              }}
              disabled={loading}
            />
            <button 
              onClick={ask} 
              disabled={loading || !input.trim()}
              className={loading ? 'loading' : ''}
            >
              {loading ? '⏳' : 'Send'}
            </button>
          </div>
        </div>
      )}
      <button className="fab" onClick={() => setOpen(!open)}>
        {open ? '×' : '🤖'}
      </button>
    </div>
  );

  // Render as overlay via portal to body to avoid affecting page layout
  return createPortal(content, document.body);
}
