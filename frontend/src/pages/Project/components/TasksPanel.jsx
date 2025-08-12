import React, { useMemo, useState, useCallback } from 'react';
import MemberPicker from '../../../components/Members/MemberPicker.jsx';
import { useToast } from '../../../components/Toast/ToastContext.jsx';
import { apiUpdateTask, apiDeleteTask } from '../../../services/projects.js';
import PriorityBadge from './PriorityBadge.jsx';
import LabelsEditor from './LabelsEditor.jsx';
import TaskComments from './TaskComments.jsx';

export default function TasksPanel({ projectId, me, tasks, setTasks, tasksLoading, onOpenTaskModal }) {
  const { notify } = useToast();
  const [taskView, setTaskView] = useState(()=>{
    try { const v = localStorage.getItem(`proj:${projectId}:tasks:view`); return (v==='list'||v==='board')? v : 'board'; } catch { return 'board'; }
  });
  const [statusFilter, setStatusFilter] = useState(()=>{ try { return localStorage.getItem(`proj:${projectId}:tasks:status`) || 'all'; } catch { return 'all'; }});
  const [assigneeFilter, setAssigneeFilter] = useState(()=>{ try { return localStorage.getItem(`proj:${projectId}:tasks:assignee`) || ''; } catch { return ''; }});
  const [priorityFilter, setPriorityFilter] = useState(()=>{ try { return localStorage.getItem(`proj:${projectId}:tasks:priority`) || 'all'; } catch { return 'all'; }});
  const [labelFilter, setLabelFilter] = useState(()=>{ try { return localStorage.getItem(`proj:${projectId}:tasks:label`) || 'all'; } catch { return 'all'; }});
  const [taskQuery, setTaskQuery] = useState(()=>{ try { return localStorage.getItem(`proj:${projectId}:tasks:q`) || ''; } catch { return ''; }});
  const [dense, setDense] = useState(()=>{ try { return localStorage.getItem(`proj:${projectId}:tasks:dense`) === '1'; } catch { return false; }});

  // persist
  function persist(name, value) { try { localStorage.setItem(`proj:${projectId}:tasks:${name}`, value); } catch {} }

  const filteredTasks = useMemo(() => {
    const q = taskQuery.trim().toLowerCase();
    return (tasks||[]).filter(t => {
      const byStatus = statusFilter === 'all' ? true : t.status === statusFilter;
      const byAssignee = assigneeFilter ? (Array.isArray(t.assignees) && t.assignees.includes(assigneeFilter)) : true;
      const p = (t.priority || 'medium');
      const byPriority = priorityFilter === 'all' ? true : p === priorityFilter;
      const byQuery = q ? ((t.title||'').toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q)) : true;
      const labels = Array.isArray(t.labels) ? t.labels : [];
      const byLabel = labelFilter === 'all' ? true : labels.includes(labelFilter);
      return byStatus && byAssignee && byPriority && byQuery && byLabel;
    });
  }, [tasks, statusFilter, assigneeFilter, priorityFilter, taskQuery, labelFilter]);

  const [editingTaskId, setEditingTaskId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  function startRenameTask(t) { setEditingTaskId(t._id); setEditTitle(t.title || ''); }
  function cancelRename() { setEditingTaskId(''); setEditTitle(''); }
  async function saveRename(taskId) {
    const next = (editTitle || '').trim();
    if (!next) { notify('Title required', 'error'); return; }
    try { const updated = await apiUpdateTask(taskId, { title: next }); setTasks(tasks.map(x=>x._id===taskId? updated : x)); notify('Task renamed','success'); cancelRename(); }
    catch { notify('Rename failed','error'); }
  }

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const toggleSelect = (taskId)=> setSelectedTaskIds(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  const clearSelection = ()=> setSelectedTaskIds([]);
  const selectAllFiltered = ()=> setSelectedTaskIds(filteredTasks.map(t=>t._id));
  async function bulkUpdateStatus(status) {
    if (!selectedTaskIds.length) return;
    try {
      const updates = await Promise.all(selectedTaskIds.map(id => apiUpdateTask(id, { status }).catch(() => null)));
      const updatedMap = new Map(updates.filter(Boolean).map(t => [t._id, t]));
      setTasks(tasks.map(t => updatedMap.get(t._id) || t));
      notify(`Updated ${updatedMap.size} task(s)`, 'success');
    } catch { notify('Bulk update failed','error'); }
    finally { clearSelection(); }
  }

  async function changeTaskStatus(taskId, status) {
    try { const updated = await apiUpdateTask(taskId, { status }); setTasks(tasks.map(t=>t._id===taskId? updated : t)); }
    catch { notify('Update status failed','error'); }
  }

  const onDragStart = useCallback((e, taskId) => { e.dataTransfer.setData('text/plain', taskId); }, []);
  const onDropTo = useCallback(async (e, status) => { e.preventDefault(); const taskId = e.dataTransfer.getData('text/plain'); if (!taskId) return; await changeTaskStatus(taskId, status); }, [changeTaskStatus]);

  function BoardColumn({ title, status }) {
    const [over, setOver] = useState(false);
    const list = filteredTasks.filter(t => t.status === status);
    return (
      <div className={`kanban-col ${over ? 'drop-target' : ''}`}
           onDragOver={(e)=>{ e.preventDefault(); setOver(true); }}
           onDragLeave={()=>setOver(false)}
           onDrop={(e)=>{ setOver(false); onDropTo(e, status); }}>
        <div className="kanban-col-header">{title} <span className="small">({list.length})</span></div>
        <div className="kanban-col-body">
          {list.map(t => (
            <div key={t._id} className="kanban-card" draggable={editingTaskId!==t._id} onDragStart={(e)=>onDragStart(e, t._id)}>
              <div className="kanban-card-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span className="drag-handle" aria-hidden>⋮⋮</span>
                {editingTaskId === t._id ? (
                  <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)} onBlur={()=>saveRename(t._id)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); saveRename(t._id); } if(e.key==='Escape'){ e.preventDefault(); cancelRename(); } }} />
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
                <select value={t.priority || 'medium'} onChange={async (e)=>{ const updated = await apiUpdateTask(t._id, { priority: e.target.value }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }}>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <LabelsEditor collapsedByDefault task={t} onChange={async (labels)=>{ const updated = await apiUpdateTask(t._id, { labels }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }} />
                {me && <button className="link" onClick={async ()=>{ try { const updated = await apiUpdateTask(t._id, { assignees: [me._id] }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); notify('Assigned to you','success'); } catch(_) { notify('Assign failed','error'); } }}>Assign me</button>}
                <button className="link" onClick={()=>startRenameTask(t)}>Rename</button>
                <button className="link" onClick={()=> onOpenTaskModal(t)}>Edit</button>
                <button className="link danger" onClick={async ()=>{ if(!confirm('Delete task?')) return; try{ await apiDeleteTask(t._id); setTasks(tasks.filter(x=>x._id!==t._id)); notify('Task deleted','success'); } catch(_) { notify('Delete failed','error'); } }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className={`tasks-panel ${dense ? 'dense' : ''}`}>
      <div className="filters-bar card">
        <div>
          <label className="small">View</label>
          <div style={{ display:'flex', gap:6 }}>
            <button type="button" className={taskView==='board'?'btn btn-primary':'btn'} onClick={()=>{ setTaskView('board'); persist('view','board'); }}>Board</button>
            <button type="button" className={taskView==='list'?'btn btn-primary':'btn'} onClick={()=>{ setTaskView('list'); persist('view','list'); }}>List</button>
          </div>
        </div>
        <div>
          <label className="small">Status</label>
          <select value={statusFilter} onChange={e=>{ setStatusFilter(e.target.value); persist('status', e.target.value); }}>
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div style={{ minWidth: 220 }}>
          <label className="small">Search</label>
          <input placeholder="Search title/description" value={taskQuery} onChange={e=>{ setTaskQuery(e.target.value); persist('q', e.target.value); }} />
        </div>
        <div>
          <label className="small">Assignee</label>
          <MemberPicker projectId={projectId} value={assigneeFilter} onChange={(v)=>{ setAssigneeFilter(v); persist('assignee', v||''); }} placeholder="All members" />
        </div>
        <div>
          <label className="small">Priority</label>
          <select value={priorityFilter} onChange={e=>{ setPriorityFilter(e.target.value); persist('priority', e.target.value); }}>
            <option value="all">All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="small">Label</label>
          <select value={labelFilter} onChange={e=>{ setLabelFilter(e.target.value); persist('label', e.target.value); }}>
            <option value="all">All</option>
            {Array.from(new Set((tasks||[]).flatMap(t => Array.isArray(t.labels) ? t.labels : []))).map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'end' }}>
          <div>
            <label className="small">Density</label>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <label className="switch small"><input type="checkbox" checked={dense} onChange={e=>{ setDense(e.target.checked); persist('dense', e.target.checked? '1':'0'); }} /><span>Compact</span></label>
            </div>
          </div>
          <button type="button" className="btn" onClick={()=>{ setStatusFilter('all'); setAssigneeFilter(''); setPriorityFilter('all'); setTaskQuery(''); setLabelFilter('all'); persist('status','all'); persist('assignee',''); persist('priority','all'); persist('q',''); persist('label','all'); }}>Clear Filters</button>
          <button type="button" className="btn btn-primary" onClick={()=> onOpenTaskModal(null)}>New Task</button>
        </div>
      </div>

      {tasksLoading ? (<p className="small">Loading tasks…</p>) : (taskView === 'list' ? (
        <>
          {selectedTaskIds.length > 0 && (
            <div className="card p-2" style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
              <span className="small">{selectedTaskIds.length} selected</span>
              <button className="btn" onClick={selectAllFiltered}>Select all (filtered)</button>
              <button className="btn" onClick={()=>bulkUpdateStatus('todo')}>Set Todo</button>
              <button className="btn" onClick={()=>bulkUpdateStatus('in-progress')}>Set In Progress</button>
              <button className="btn" onClick={()=>bulkUpdateStatus('done')}>Set Done</button>
              <button className="btn" onClick={clearSelection}>Clear</button>
            </div>
          )}
          <ul className="list tasks-list">
            {filteredTasks.length === 0 && <li className="small">No tasks match filters.</li>}
            {filteredTasks.map(t => (
              <li key={t._id} style={{ display:'block' }}>
                <div className="task-row">
                  <input type="checkbox" checked={selectedTaskIds.includes(t._id)} onChange={()=>toggleSelect(t._id)} />
                  <span style={{ flex:1, minWidth:200 }}>
                    {editingTaskId === t._id ? (
                      <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)} onBlur={()=>saveRename(t._id)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); saveRename(t._id); } if(e.key==='Escape'){ e.preventDefault(); cancelRename(); } }} />
                    ) : (
                      <>
                        {t.title} <PriorityBadge value={t.priority} />
                        {t.dueDate && <span style={{ marginLeft:8, color:'#6b7280', fontSize:12 }}>(due {new Date(t.dueDate).toLocaleDateString()})</span>}
                        {Array.isArray(t.labels) && t.labels.length>0 && (
                          <span className="small" style={{ marginLeft:8, display:'inline-flex', gap:6, flexWrap:'wrap' }}>
                            {t.labels.map((l,idx)=>(<span key={idx} className="chip">{l}</span>))}
                          </span>
                        )}
                      </>
                    )}
                  </span>
                  <select value={t.status} onChange={(e)=>changeTaskStatus(t._id, e.target.value)}>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <select value={t.priority || 'medium'} onChange={async (e)=>{ const updated = await apiUpdateTask(t._id, { priority: e.target.value }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }}>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  {me && <button onClick={async ()=>{ try { const updated = await apiUpdateTask(t._id, { assignees: [me._id] }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); notify('Assigned to you','success'); } catch(_) { notify('Assign failed','error'); } }}>Assign me</button>}
                  <MemberPicker projectId={projectId} value={(t.assignees && t.assignees[0]) || ''} onChange={async (uid)=>{ const updated = await apiUpdateTask(t._id, { assignees: uid? [uid] : [] }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }} />
                  <input type="date" value={t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : ''} onChange={async (e)=>{ const updated = await apiUpdateTask(t._id, { dueDate: e.target.value }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }} />
                  <button onClick={()=>startRenameTask(t)}>Rename</button>
                  <button onClick={()=> onOpenTaskModal(t)}>Edit</button>
                  <button className="danger pill" onClick={async ()=>{ if(!confirm('Delete task?')) return; try{ await apiDeleteTask(t._id); setTasks(tasks.filter(x=>x._id!==t._id)); notify('Task deleted','success'); } catch(_) { notify('Delete failed','error'); } }}>Delete</button>
                </div>
                <TaskComments taskId={t._id} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="kanban">
          {filteredTasks.length === 0 && <p className="small" style={{padding:'8px 0'}}>No tasks match filters. Try clearing them or add a new task.</p>}
          <BoardColumn title="Todo" status="todo" />
          <BoardColumn title="In Progress" status="in-progress" />
          <BoardColumn title="Done" status="done" />
        </div>
      ))}
    </section>
  );
}
