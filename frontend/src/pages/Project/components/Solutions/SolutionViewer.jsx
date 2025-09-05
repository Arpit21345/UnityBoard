import React, { useEffect, useMemo, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import 'highlight.js/styles/github.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);

const tabDefs = [
  { key: 'overview', label: 'Overview' },
  { key: 'code', label: 'Code' },
  { key: 'notes', label: 'Notes' },
];

export default function SolutionViewer({ item }) {
  const [tab, setTab] = useState('overview');
  const [expanded, setExpanded] = useState(false);
  const [wrap, setWrap] = useState(true);
  const codeRef = useRef(null);
  const lang = (item?.language || 'plaintext').toLowerCase();

  useEffect(() => {
    if (tab !== 'code') return;
    if (!codeRef.current) return;
    try {
      hljs.highlightElement(codeRef.current);
    } catch {}
  }, [tab, item?.code, lang]);

  const tags = item?.tags || [];

  const codeClass = useMemo(() => `language-${lang}`, [lang]);

  useEffect(() => {
    if (tab !== 'code') return;
    setExpanded(false);
  }, [tab]);

  return (
    <div className="solution-viewer">
      <div className="viewer-tabs">
        {tabDefs.map(t => (
          <button key={t.key} className={`tab ${tab===t.key?'active':''}`} onClick={()=>setTab(t.key)}>{t.label}</button>
        ))}
      </div>
    <div className="viewer-body">
  {tab==='overview' && (
          <div className="viewer-overview">
            <div className="title-row">
        <h3>{item?.title}</h3>
              {item?.problemUrl && <a className="small" href={item.problemUrl} target="_blank" rel="noreferrer">Open Link</a>}
            </div>
            <div className="meta-row">
              <span className="badge">{item?.category || 'uncategorized'}</span>
              {item?.difficulty && <span className={`badge diff-${(item.difficulty||'').toLowerCase()}`}>{item.difficulty}</span>}
              <span className="badge">{item?.language || 'plaintext'}</span>
            </div>
            {tags.length > 0 && (
              <div className="labels-chips" style={{ marginTop: 8 }}>
                {tags.map(t => <span className="chip" key={t}>{t}</span>)}
              </div>
            )}
            {(item?.timeComplexity || item?.spaceComplexity) && (
              <div className="meta-row" style={{ marginTop: 8 }}>
                {item?.timeComplexity && <span className="badge">Time: {item.timeComplexity}</span>}
                {item?.spaceComplexity && <span className="badge">Space: {item.spaceComplexity}</span>}
              </div>
            )}
            {item?.approach && (
              <div className="card p-3" style={{ marginTop: 12 }}>
                <h5 style={{ marginTop: 0 }}>Approach</h5>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{item.approach}</ReactMarkdown>
              </div>
            )}
            {(item?.references?.length || 0) > 0 && (
              <div className="card p-3" style={{ marginTop: 12 }}>
                <h5 style={{ marginTop: 0 }}>References</h5>
                <ul>
                  {item.references.map((r, idx) => (
                    <li key={idx}><a href={r} target="_blank" rel="noreferrer">{r}</a></li>
                  ))}
                </ul>
              </div>
            )}
            {(item?.related?.length || 0) > 0 && (
              <div className="card p-3" style={{ marginTop: 12 }}>
                <h5 style={{ marginTop: 0 }}>Related Problems</h5>
                <ul>
                  {item.related.map((r, idx) => (
                    <li key={idx}>{/^https?:\/\//i.test(r) ? <a href={r} target="_blank" rel="noreferrer">{r}</a> : r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {tab==='code' && (
          <div className={`viewer-code ${expanded?'expanded':''} ${wrap?'wrap':''}`}>
            <div className="code-actions" style={{ display:'flex', gap:8, justifyContent:'flex-end', marginBottom:8 }}>
              <button className="btn btn-ghost" onClick={()=>{ if (navigator?.clipboard && item?.code) navigator.clipboard.writeText(item.code); }}>Copy</button>
              <button className="btn btn-ghost" onClick={()=> setWrap(v=>!v)}>{wrap ? 'Unwrap' : 'Wrap'}</button>
            </div>
            {item?.code ? (
              <pre>
                <code ref={codeRef} className={codeClass}>{item.code}</code>
              </pre>
            ) : (
              <p className="muted">No code provided.</p>
            )}
          </div>
        )}
        {tab==='notes' && (
          <div className="viewer-notes">
            {(item?.notes || item?.approach) ? (
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{item.notes || item.approach}</ReactMarkdown>
            ) : (
              <p className="muted">No notes yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
