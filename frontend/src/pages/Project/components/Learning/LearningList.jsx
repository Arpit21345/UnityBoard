import React from 'react';

export default function LearningList({ items, selectedIds, onToggleSelect, onEdit, onDelete, onChangeStatus }){
  if (items.length === 0) return <p className="muted">No learning items match your filters.</p>;
  return (
    <div className="card-list">
      {items.map(item => (
        <div key={item._id} className="card learning-card">
          <div className="learning-card-content">
            <div className="learning-card-main">
              <div className="learning-title-row">
                <input type="checkbox" checked={selectedIds.includes(item._id)} onChange={()=>onToggleSelect(item._id)} />
                <strong>{item.title}</strong>
                <span className={`badge badge-${item.status.replace('in-','in-')}`}>{item.status}</span>
                {item.dueDate && <span className="badge">Due {new Date(item.dueDate).toLocaleDateString()}</span>}
              </div>
              {item.description && <p className="learning-description">{item.description}</p>}
              {(item.tags||[]).length>0 && (
                <div className="learning-tags">
                  {item.tags.map((t,idx)=>(<span key={idx} className="chip small">{t}</span>))}
                </div>
              )}
              {(item.materials||[]).length>0 && (
                <div className="learning-materials">
                  <span className="learning-materials-label">Materials: </span>
                  {item.materials.map((m,idx)=>(
                    <a key={idx} href={m} target="_blank" rel="noreferrer">{m}</a>
                  ))}
                </div>
              )}
            </div>
            <div className="learning-actions">
              {onChangeStatus && (
                <select value={item.status} onChange={e=>onChangeStatus(item, e.target.value)}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              )}
              <button className="btn" onClick={()=>onEdit(item)}>Edit</button>
              <button className="btn btn-ghost" onClick={()=>onDelete(item)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
