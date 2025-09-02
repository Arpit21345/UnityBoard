import React from 'react';
import MemberPicker from '../../../../components/Members/MemberPicker.jsx';
import PriorityBadge from '../PriorityBadge.jsx';
import TaskComments from '../TaskComments.jsx';

export default function TasksList({
  projectId,
  items,
  me,
  selectedTaskIds,
  toggleSelect,
  clearSelection,
  selectAllFiltered,
  onBulkUpdateStatus,
  editingTaskId,
  editTitle,
  setEditTitle,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onUpdateTask,
  onOpenTaskModal,
}){
  return (
    <>
      {selectedTaskIds.length > 0 && (
        <div className="bulk-actions">
          <span className="small">{selectedTaskIds.length} selected</span>
          <button className="task-btn" onClick={selectAllFiltered}>Select all</button>
          <button className="task-btn" onClick={()=>onBulkUpdateStatus('todo')}>Set Todo</button>
          <button className="task-btn" onClick={()=>onBulkUpdateStatus('in-progress')}>Set In Progress</button>
          <button className="task-btn" onClick={()=>onBulkUpdateStatus('done')}>Set Done</button>
          <button className="task-btn" onClick={clearSelection}>Clear</button>
        </div>
      )}
      <div className="tasks-list">
        {items.length === 0 && <div className="empty-state">No tasks match your current filters.</div>}
        {items.map(t => (
          <div key={t._id} className="task-item">
            <div className={`task-row task-row-${t.status || 'todo'}`}>
              <input type="checkbox" checked={selectedTaskIds.includes(t._id)} onChange={()=>toggleSelect(t._id)} />
              <div className="task-content">
                {editingTaskId === t._id ? (
                  <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)} onBlur={()=>onSaveRename(t._id)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); onSaveRename(t._id); } if(e.key==='Escape'){ e.preventDefault(); onCancelRename(); } }} />
                ) : (
                  <>
                    <div className="task-title">
                      <span>{t.title}</span>
                      <PriorityBadge value={t.priority} />
                    </div>
                    <div className="task-meta">
                      {t.dueDate && <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>}
                      {Array.isArray(t.labels) && t.labels.length > 0 && (
                        <div className="task-labels">
                          {t.labels.map((l,idx)=>(<span key={idx} className="chip">{l}</span>))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <select value={t.status} onChange={(e)=>onUpdateTask(t._id, { status: e.target.value })}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <select value={t.priority || 'medium'} onChange={(e)=> onUpdateTask(t._id, { priority: e.target.value })}>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              {me && <button className="task-btn" onClick={()=> onUpdateTask(t._id, { assignees: [me._id] })}>Assign me</button>}
              <MemberPicker projectId={projectId} value={(t.assignees && t.assignees[0]) || ''} onChange={(uid)=> onUpdateTask(t._id, { assignees: uid? [uid] : [] })} />
              <input type="date" value={t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : ''} onChange={(e)=> onUpdateTask(t._id, { dueDate: e.target.value })} />
              <button className="task-btn" onClick={()=>onStartRename(t)}>Rename</button>
              <button className="task-btn" onClick={()=> onOpenTaskModal(t)}>Edit</button>
              <button className="task-btn task-btn-danger" onClick={()=> onUpdateTask(t._id, { __delete: true })}>Delete</button>
            </div>
            <TaskComments taskId={t._id} />
          </div>
        ))}
      </div>
    </>
  );
}
