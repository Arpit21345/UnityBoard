import React, { useEffect, useState } from 'react';
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
  const { ctx } = useAiContext();
  const location = useLocation();

  async function ask() {
    const q = input.trim();
    if (!q) return;
    setMessages(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
  const answer = await apiAiQnA(q, ctx || '');
      setMessages(m => [...m, { role: 'assistant', text: answer }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: 'Sorry, AI is unavailable.' }]);
    } finally {
      setLoading(false);
    }
  }

  // Close panel on route change to avoid overlapping with new pages
  useEffect(() => {
    setOpen(false);
  }, [location?.pathname]);

  const content = (
    <div className={`ai-helper ${open ? 'open' : ''}`} aria-live="polite">
      {open && (
        <div className="panel">
          <div className="header">UnityBoard Assistant</div>
          <div className="body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>{m.text}</div>
            ))}
            {loading && <div className="msg assistant">Thinking…</div>}
          </div>
          <div className="input-row">
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask anything…" onKeyDown={(e)=>{ if(e.key==='Enter') ask(); }} />
            <button onClick={ask} disabled={loading}>Send</button>
          </div>
        </div>
      )}
      <button className="fab" onClick={()=>setOpen(!open)}>{open ? '×' : 'AI'}</button>
    </div>
  );

  // Render as overlay via portal to body to avoid affecting page layout
  return createPortal(content, document.body);
}
