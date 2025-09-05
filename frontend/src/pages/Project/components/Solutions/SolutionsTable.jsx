import React, { useState } from 'react';

export default function SolutionsTable({ items, onEdit, onDelete, onSelect, sortKey, sortDir, onSortChange, renderViewer }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleExpand = (item) => {
    if (expandedRow === item._id) {
      setExpandedRow(null); // Close if already open
    } else {
      setExpandedRow(item._id); // Open this row
      if (onSelect) onSelect(item); // Still call onSelect for data loading
    }
  };

  if (!items.length) return <p className="muted">No solutions match your filters.</p>;
  return (
    <div className="solutions-table">
      <div className="solutions-table-head">
        <div onClick={()=>onSortChange && onSortChange('title')} style={{cursor:'pointer'}}>
          Title {sortKey==='title' ? (sortDir==='asc'?'↑':'↓') : ''}
        </div>
        <div onClick={()=>onSortChange && onSortChange('category')} style={{cursor:'pointer'}}>
          Category {sortKey==='category' ? (sortDir==='asc'?'↑':'↓') : ''}
        </div>
        <div onClick={()=>onSortChange && onSortChange('difficulty')} style={{cursor:'pointer'}}>
          Difficulty {sortKey==='difficulty' ? (sortDir==='asc'?'↑':'↓') : ''}
        </div>
        <div onClick={()=>onSortChange && onSortChange('language')} style={{cursor:'pointer'}}>
          Lang {sortKey==='language' ? (sortDir==='asc'?'↑':'↓') : ''}
        </div>
        <div>Tags</div>
  <div>Actions</div>
      </div>
      {items.map(item => (
        <React.Fragment key={item._id}>
          <div className={`solutions-table-row clickable ${expandedRow === item._id ? 'expanded' : ''}`} onClick={() => toggleExpand(item)}>
            <div className="col-title">
              <div className="row-main">
                <span className="solution-title">{item.title}</span>
                {item.problemUrl && <a className="small" href={item.problemUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>link</a>}
                <span className="expand-indicator">›</span>
              </div>
            </div>
            <div className="col-category">{item.category || '-'}</div>
            <div className="col-difficulty">
              {item.difficulty ? (
                <span className={`badge diff-${(item.difficulty||'').toLowerCase()}`}>{item.difficulty}</span>
              ) : '-'}
            </div>
            <div className="col-language">{item.language || 'plaintext'}</div>
            <div className="tags-column col-tags">
              {(item.tags||[]).map(t => <span key={t} className="chip">{t}</span>)}
            </div>
            <div className="col-actions" title={new Date(item.updatedAt||item.createdAt||'').toLocaleString()}>
              <div className="row-actions">
                <button className="btn" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>Edit</button>
                <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); onDelete(item); }}>Delete</button>
              </div>
            </div>
          </div>
          {expandedRow === item._id && (
            <div className="solution-expanded-content active">
              {renderViewer && renderViewer(item)}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
