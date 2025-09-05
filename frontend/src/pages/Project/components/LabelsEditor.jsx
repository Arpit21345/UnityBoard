import React, { useState } from 'react';
import './LabelsEditor.css';

export default function LabelsEditor({ task, onChange, collapsedByDefault = false }) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(!collapsedByDefault);
  const labels = Array.isArray(task.labels) ? task.labels : [];
  function add() {
    const v = (draft || '').trim();
    if (!v) return;
    if (labels.includes(v)) { setDraft(''); return; }
    const next = [...labels, v].slice(0, 5);
    onChange(next);
    setDraft('');
  }
  function remove(idx) {
    const next = labels.filter((_,i)=>i!==idx);
    onChange(next);
  }
  return (
    <div className="labels-editor">
      <div className="labels-chips">
        {labels.map((l,idx)=>(
          <span key={idx} className="chip" title={l}>{l}<button className="chip-x" onClick={()=>remove(idx)} aria-label={`Remove ${l}`}>×</button></span>
        ))}
      </div>
      {collapsedByDefault && (
        <button type="button" className="link" onClick={()=>setOpen(v=>!v)}>{open ? 'Hide' : 'Add label'}</button>
      )}
      {open && (
        <div className="labels-add">
          <input placeholder="Add label" value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); add(); } }} />
          <button type="button" className="btn" onClick={add}>Add</button>
        </div>
      )}
    </div>
  );
}
