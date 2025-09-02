import React, { useCallback, useState } from 'react';
import PriorityBadge from '../PriorityBadge.jsx';
import LabelsEditor from '../LabelsEditor.jsx';

export default function TasksBoard({
  items,
  me,
  onDragStart,
  onDropTo,
  onStartRename,
  editingTaskId,
  editTitle,
  setEditTitle,
  onSaveRename,
  onCancelRename,
  onUpdateTask,
  onOpenTaskModal,
}){
  const changeTaskStatus = async (taskId, status) => {
    await onUpdateTask(taskId, { status });
  };

  const Column = ({ title, status }) => {
    const [over, setOver] = useState(false);
    const list = items.filter(t => t.status === status);
    return (
      <div className={`kanban-col ${over ? 'drop-target' : ''}`}
        onDragOver={(e)=>{ e.preventDefault(); setOver(true); }}
        onDragLeave={()=>setOver(false)}
        onDrop={(e)=>{ setOver(false); onDropTo(e, status); }}>
        <div className="kanban-col-header">{title} <span className="small">({list.length})</span></div>
        <div className="kanban-col-body">
          {list.map(t => (
            <div key={t._id} className={`kanban-card status-${t.status || 'todo'}`} draggable={editingTaskId!==t._id} onDragStart={(e)=>onDragStart(e, t._id)}>
              <div className="kanban-card-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className="drag-handle" aria-hidden>⋮⋮</span>
                {editingTaskId === t._id ? (
                  <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)} onBlur={()=>onSaveRename(t._id)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); onSaveRename(t._id); } if(e.key==='Escape'){ e.preventDefault(); onCancelRename(); } }} />
                ) : (
                  t.title
                )}
              </div>
              <div className="kanban-card-meta small" style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <PriorityBadge value={t.priority} />
                {t.dueDate && <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>}
                {Array.isArray(t.labels) && t.labels.length>0 && (
                  <span style={{ display:'inline-flex', gap:6, flexWrap:'wrap' }}>
                    {t.labels.map((l,idx)=>(<span key={idx} className="chip" style={{ transform:'scale(0.95)' }}>{l}</span>))}
                  </span>
                )}
              </div>
              <div className="kanban-card-actions">
                <select value={t.priority || 'medium'} onChange={async (e)=>{ await onUpdateTask(t._id, { priority: e.target.value }); }}>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <LabelsEditor collapsedByDefault task={t} onChange={async (labels)=> onUpdateTask(t._id, { labels })} />
                {me && <button className="link" onClick={async ()=>{ await onUpdateTask(t._id, { assignees: [me._id] }); }}>Assign me</button>}
                <button className="link" onClick={()=>onStartRename(t)}>Rename</button>
                <button className="link" onClick={()=> onOpenTaskModal(t)}>Edit</button>
                <button className="link danger" onClick={async ()=>{ if(!confirm('Delete task?')) return; await onUpdateTask(t._id, { __delete: true }); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const onDropToHandler = useCallback(async (e, status) => { e.preventDefault(); const taskId = e.dataTransfer.getData('text/plain'); if (!taskId) return; await changeTaskStatus(taskId, status); }, []);

  return (
    <div className="kanban">
      {items.length === 0 && <p className="small" style={{padding:'8px 0'}}>No tasks match filters. Try clearing them or add a new task.</p>}
      <Column title="Todo" status="todo" onDropTo={onDropToHandler} />
      <Column title="In Progress" status="in-progress" onDropTo={onDropToHandler} />
      <Column title="Done" status="done" onDropTo={onDropToHandler} />
    </div>
  );
}
