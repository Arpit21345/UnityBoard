import React from 'react';

const items = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'tasks', label: 'Task Management' },
  { key: 'learning', label: 'Learning Tracker' },
  { key: 'snippets', label: 'Smart Snippets' },
  { key: 'solutions', label: 'Solution Database' },
  { key: 'resources', label: 'Resource Vault' },
  { key: 'discussion', label: 'Team Chat' },
  { key: 'settings', label: 'Project Settings' },
];

export default function ProjectSidebar({ active, onChange, title, subtitle }) {
  return (
    <div className="side-nav">
      <div style={{marginBottom:12}}>
        <div style={{fontWeight:700}}>{title || 'Project'}</div>
        {subtitle && <div className="small" style={{color:'var(--gray-600)'}}>{subtitle}</div>}
      </div>
      {items.map(it => (
        <button
          key={it.key}
          className={`side-link ${active===it.key?'active':''}`}
          onClick={()=>onChange?.(it.key)}
          style={{width:'100%', textAlign:'left', background:'transparent', border:0, cursor:'pointer'}}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
