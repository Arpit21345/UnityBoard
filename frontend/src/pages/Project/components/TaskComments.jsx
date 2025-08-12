import React, { useState } from 'react';
import { apiListTaskComments, apiAddTaskComment } from '../../../services/projects.js';
import { useToast } from '../../../components/Toast/ToastContext.jsx';

export default function TaskComments({ taskId, embedded = false }) {
  const [open, setOpen] = useState(embedded ? true : false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const { notify } = useToast();

  async function load() {
    setLoading(true);
    try {
      const list = await apiListTaskComments(taskId);
      setItems(list);
    } catch (_) { notify('Load comments failed','error'); }
    setLoading(false);
  }

  async function add() {
    if (!text.trim()) return;
    const c = await apiAddTaskComment(taskId, text.trim());
    setItems([...items, c]);
    setText('');
  }

  return (
    <div className={embedded ? '' : 'card p-3 mt-2'}>
      {!embedded && (
        <button className="link" onClick={async ()=>{ const next=!open; setOpen(next); if (next && items.length===0) await load(); }}>{open ? 'Hide' : 'Show'} comments</button>
      )}
      {open && (
        <div>
          {loading ? <p className="small">Loading…</p> : (
            <ul className="list" style={{ marginTop:8 }}>
              {items.map((c, idx) => (
                <li key={idx} className="small">{new Date(c.createdAt).toLocaleString()} — {c.text}</li>
              ))}
              {items.length === 0 && <li className="small">No comments yet.</li>}
            </ul>
          )}
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <input placeholder="Add a comment" value={text} onChange={e=>setText(e.target.value)} />
            <button onClick={add}>Post</button>
          </div>
        </div>
      )}
    </div>
  );
}
