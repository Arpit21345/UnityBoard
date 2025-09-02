import React, { useEffect, useRef, useState } from 'react';

export default function SnippetsFormModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(() => initial || { title: '', description: '', language: '', code: '', tags: [] });
  const firstRef = useRef(null);

  useEffect(() => { if (open) { setForm(initial || { title: '', description: '', language: '', code: '', tags: [] }); setTimeout(()=> firstRef.current?.focus(), 0); } }, [open, initial]);

  const update = (patch) => setForm(f => ({ ...f, ...patch }));
  const submit = () => onSave(form);
  const onKeyDown = (e) => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); submit(); } };

  if (!open) return null;
  return (
    <div className="modal-backdrop" onKeyDown={onKeyDown}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{initial? 'Edit Snippet' : 'New Snippet'}</h3>
        </div>
        <div className="modal-body snippet-form">
          <div className="form-row">
            <label>Title</label>
            <input ref={firstRef} value={form.title} onChange={e=> update({ title: e.target.value })} placeholder="Snippet title" />
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea value={form.description} onChange={e=> update({ description: e.target.value })} rows={3} placeholder="What does it do?" />
          </div>
          <div className="form-row two">
            <div>
              <label>Language</label>
              <select value={form.language} onChange={e=> update({ language: e.target.value })}>
                <option value="">Unknown</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="cpp">C++</option>
                <option value="rust">Rust</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
                <option value="shell">Shell</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
            <div>
              <label>Tags (comma separated)</label>
              <input value={(form.tags||[]).join(', ')} onChange={e=> update({ tags: e.target.value.split(',').map(s=> s.trim()).filter(Boolean) })} placeholder="e.g., api, auth, ui" />
            </div>
          </div>
          <div className="form-row">
            <label>Code</label>
            <textarea value={form.code} onChange={e=> update({ code: e.target.value })} rows={10} placeholder="Paste code here" />
            <div className="hint">Tip: Press Ctrl+Enter to save</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={submit}>Save</button>
        </div>
      </div>
    </div>
  );
}
