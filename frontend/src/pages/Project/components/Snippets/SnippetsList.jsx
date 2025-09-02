import React from 'react';

export default function SnippetsList({ items, selection, onToggleSelect, onEdit, onDelete, onQuickLanguage, onCopy }) {
  if (!items.length) return <div className="snippets-empty">No snippets</div>;
  return (
    <div className="snippets-list">
      {items.map(s => (
        <div key={s._id} className="snippet-card">
          <div className="snippet-card-head">
            <input type="checkbox" checked={selection.has(s._id)} onChange={()=> onToggleSelect(s._id)} />
            <h4 className="snippet-title">{s.title || '(untitled)'}</h4>
            <div className="snippet-lang-container">
              <span className="snippet-lang-label">Language:</span>
              <select value={s.language || ''} onChange={(e)=> onQuickLanguage(s, e.target.value)} className="snippet-lang-select">
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
            <div className="grow" />
            <button className="btn btn-ghost" onClick={()=> onCopy(s)}>
              <span className="btn-icon">📋</span> Copy
            </button>
            <button className="btn btn-ghost" onClick={()=> onEdit(s)}>Edit</button>
            <button className="btn btn-danger" onClick={()=> onDelete(s)}>Delete</button>
          </div>
          {s.description && <div className="snippet-desc">{s.description}</div>}
          {s.tags?.length ? (
            <div className="snippet-tags">
              {s.tags.map((t, i) => (
                <span key={t} className={`tag small tag-auto-${1 + (i % 8)}`}>{t}</span>
              ))}
            </div>
          ) : null}
          {s.code && (
            <div className="snippet-code-container">
              <pre className="snippet-code"><code>{s.code}</code></pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
