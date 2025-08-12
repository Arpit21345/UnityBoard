import React, { useEffect, useMemo, useState, useCallback } from 'react';
import './Project.css';
import { useParams } from 'react-router-dom';
import { apiGetProject, apiListProjectTasks, apiCreateTask, apiUpdateTask, apiUpdateProject, apiListTaskComments, apiAddTaskComment, apiDeleteTask } from '../../services/projects.js';
import { apiListInvites, apiCreateInvite, apiToggleInvite } from '../../services/invites.js';
import { apiMe } from '../../services/auth.js';
import { apiListResources, apiUploadResourceFile, apiDeleteResource, apiCreateResourceLink } from '../../services/resources.js';
import { useAiContext } from '../../components/AiHelper/AiContext.jsx';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Topbar from '../../components/layout/Topbar.jsx';
import ProjectSidebar from '../../components/layout/ProjectSidebar.jsx';
import MemberPicker from '../../components/Members/MemberPicker.jsx';
import { useToast } from '../../components/Toast/ToastContext.jsx';
import Modal from '../../components/Modal/Modal.jsx';

export default function Project() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const { setCtx } = useAiContext();
  const [me, setMe] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesProviderFilter, setResourcesProviderFilter] = useState('all');
  const [dragOver, setDragOver] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [taskView, setTaskView] = useState('board'); // 'board' | 'list'
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [taskQuery, setTaskQuery] = useState('');
  const [labelFilter, setLabelFilter] = useState('all');
  const [dense, setDense] = useState(false);
  const { notify } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [linkForm, setLinkForm] = useState({ title:'', url:'' });
  const [resQuery, setResQuery] = useState('');
  const [taskModal, setTaskModal] = useState({ open:false, task:null });
  const [modalAssignee, setModalAssignee] = useState('');
  const [modalLabels, setModalLabels] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Persist task view and filters per project in localStorage
  useEffect(() => {
    const key = (name) => `proj:${id}:tasks:${name}`;
    try {
      const v = localStorage.getItem(key('view'));
      if (v === 'board' || v === 'list') setTaskView(v);
      const s = localStorage.getItem(key('status'));
      if (s) setStatusFilter(s);
      const a = localStorage.getItem(key('assignee'));
      if (a) setAssigneeFilter(a);
  const p = localStorage.getItem(key('priority'));
  if (p) setPriorityFilter(p);
  const q = localStorage.getItem(key('q'));
  if (q) setTaskQuery(q);
  const lf = localStorage.getItem(key('label'));
  if (lf) setLabelFilter(lf);
  const d = localStorage.getItem(key('dense'));
  if (d === '1') setDense(true);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    const key = (name) => `proj:${id}:tasks:${name}`;
    try { localStorage.setItem(key('view'), taskView); } catch {}
  }, [id, taskView]);
  useEffect(() => {
    const key = (name) => `proj:${id}:tasks:${name}`;
    try { localStorage.setItem(key('status'), statusFilter); } catch {}
  }, [id, statusFilter]);
  useEffect(() => {
    const key = (name) => `proj:${id}:tasks:${name}`;
    try { localStorage.setItem(key('assignee'), assigneeFilter); } catch {}
  }, [id, assigneeFilter]);
  useEffect(() => {
    const key = (name) => `proj:${id}:tasks:${name}`;
    try { localStorage.setItem(key('priority'), priorityFilter); } catch {}
  }, [id, priorityFilter]);
  useEffect(() => {
    const key = (name) => `proj:${id}:tasks:${name}`;
    try { localStorage.setItem(key('q'), taskQuery); } catch {}
  }, [id, taskQuery]);
  useEffect(() => {
    const key = (name) => `proj:${id}:tasks:${name}`;
    try { localStorage.setItem(key('label'), labelFilter); } catch {}
  }, [id, labelFilter]);
  useEffect(() => {
    const key = (name) => `proj:${id}:tasks:${name}`;
    try { localStorage.setItem(key('dense'), dense ? '1' : '0'); } catch {}
  }, [id, dense]);

  useEffect(() => {
    (async () => {
      try {
        const user = await apiMe();
        setMe(user);
        const p = await apiGetProject(id);
        setProject(p);
        const [t, r] = await Promise.all([
          apiListProjectTasks(id).catch(() => []),
          apiListResources(id).catch(() => [])
        ]);
        setTasks(t); setTasksLoading(false);
        setResources(r); setResourcesLoading(false);
      } catch (e) {
        notify('Failed to load project data', 'error');
        setTasksLoading(false);
        setResourcesLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (project) {
      const taskSummary = tasks.slice(0, 10).map(t => `- [${t.status}] ${t.title}`).join('\n');
      const resSummary = resources.slice(0, 10).map(r => `- (${r.provider}) ${r.title || r.name || r.url}`).join('\n');
      setCtx(`Project: ${project.name}\nDescription: ${project.description || ''}\nTasks:\n${taskSummary}\nResources:\n${resSummary}`);
    }
  }, [project, tasks, resources, setCtx]);

  async function addTask(e) {
    e.preventDefault();
    if (!newTask.title) return;
    const payload = { ...newTask };
    if (!payload.dueDate) delete payload.dueDate;
    if (!payload.priority) payload.priority = 'medium';
    // include modal assignee and labels for both create/edit
    payload.assignees = modalAssignee ? [modalAssignee] : [];
    payload.labels = Array.isArray(modalLabels) ? modalLabels : [];
    try {
      if (taskModal.task) {
        const updated = await apiUpdateTask(taskModal.task._id, payload);
        setTasks(tasks.map(x => x._id === updated._id ? updated : x));
        notify('Task updated', 'success');
      } else {
        const t = await apiCreateTask(id, payload);
        setTasks([t, ...tasks]);
        notify('Task created', 'success');
      }
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' });
      setModalAssignee('');
      setModalLabels([]);
      setTaskModal({ open:false, task:null });
    } catch (e) {
      notify(taskModal.task ? 'Update task failed' : 'Create task failed', 'error');
    }
  }

  function startRenameTask(t) {
    setEditingTaskId(t._id);
    setEditTitle(t.title || '');
  }

  function cancelRename() {
    setEditingTaskId('');
    setEditTitle('');
  }

  async function saveRename(taskId) {
    const next = (editTitle || '').trim();
    if (!next) { notify('Title required', 'error'); return; }
    try {
      const updated = await apiUpdateTask(taskId, { title: next });
      setTasks(tasks.map(x => x._id === taskId ? updated : x));
      notify('Task renamed', 'success');
      cancelRename();
    } catch (_) { notify('Rename failed', 'error'); }
  }

  function toggleSelect(taskId) {
    setSelectedTaskIds(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  }

  function clearSelection() { setSelectedTaskIds([]); }

  function selectAllFiltered() { setSelectedTaskIds(filteredTasks.map(t => t._id)); }

  async function bulkUpdateStatus(status) {
    if (!selectedTaskIds.length) return;
    try {
      const updates = await Promise.all(selectedTaskIds.map(id => apiUpdateTask(id, { status }).catch(() => null)));
      const updatedMap = new Map(updates.filter(Boolean).map(t => [t._id, t]));
      setTasks(tasks.map(t => updatedMap.get(t._id) || t));
      notify(`Updated ${updatedMap.size} task(s)`, 'success');
    } catch (_) {
      notify('Bulk update failed', 'error');
    } finally {
      clearSelection();
    }
  }

  function LabelsEditor({ task, onChange, collapsedByDefault = false }) {
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

  async function changeTaskStatus(taskId, status) {
    try {
      const updated = await apiUpdateTask(taskId, { status });
      setTasks(tasks.map(t => t._id === taskId ? updated : t));
    } catch (e) { notify('Update status failed', 'error'); }
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const uploaded = [];
    const MAX = 10 * 1024 * 1024; // ~10MB (matches backend default unless configured)
    setUploading(true);
    setUploadProgress(0);
    let done = 0;
    for (const file of files) {
      if (file.size > MAX) { notify(`${file.name}: too large (>10MB)`, 'error'); continue; }
      try {
        // Track per-file progress using a reader to simulate progress updates
        // (Fetch doesn’t expose progress; this is a simple UI approximation)
        const res = await apiUploadResourceFile(id, file);
        uploaded.push(res);
        done += 1; setUploadProgress(Math.round((done / files.length) * 100));
      } catch (e) {
        notify(`Upload failed: ${file.name}`, 'error');
      }
    }
    if (uploaded.length) {
      setResources([...uploaded, ...resources]);
      notify(`Uploaded ${uploaded.length} file(s)`, 'success');
    }
    setUploading(false);
  }

  async function onFileInput(e) {
    await handleFiles(e.target.files);
    e.target.value = '';
  }

  async function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    await handleFiles(e.dataTransfer.files);
  }

  async function removeResource(resourceId) {
    try {
      await apiDeleteResource(id, resourceId);
      setResources(resources.filter(r => r._id !== resourceId));
      notify('Resource deleted', 'success');
    } catch (e) { notify('Delete failed', 'error'); }
  }

  const amPrivileged = project && me && project.members?.some(m => m.user === me._id && (m.role === 'owner' || m.role === 'admin'));
  const [invites, setInvites] = useState([]);
  const [settings, setSettings] = useState({ visibility: 'private', allowMemberInvites: false });

  useEffect(() => {
    if (project) setSettings({ visibility: project.visibility, allowMemberInvites: project.allowMemberInvites });
  }, [project]);

  async function loadInvites() {
    if (!amPrivileged) return;
    try {
      const list = await apiListInvites(id);
      setInvites(list);
      notify('Invites loaded', 'success');
    } catch (_) { notify('Load invites failed', 'error'); }
  }

  async function saveSettings(e) {
    e.preventDefault();
    try {
      const updated = await apiUpdateProject(id, settings);
      setProject(updated);
      notify('Settings saved', 'success');
    } catch (_) { notify('Save failed', 'error'); }
  }

  async function makeInvite() {
    try {
      const inv = await apiCreateInvite(id, { expiresInDays: 7 });
      setInvites([inv, ...invites]);
      notify('Invite created', 'success');
    } catch (_) { notify('Create invite failed', 'error'); }
  }

  const kpis = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const inprog = tasks.filter(t => t.status === 'in-progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    return { total, done, inprog, todo };
  }, [tasks]);

  function DashboardPanel() {
    return (
      <div className="grid cols-2">
        <div>
          <div className="kpi">
            <div className="card p-4"><div className="small">Total Tasks</div><div style={{fontSize:'26px',fontWeight:700}}>{kpis.total}</div></div>
            <div className="card p-4"><div className="small">Completed</div><div style={{fontSize:'26px',fontWeight:700}}>{kpis.done}</div></div>
            <div className="card p-4"><div className="small">In Progress</div><div style={{fontSize:'26px',fontWeight:700}}>{kpis.inprog}</div></div>
            <div className="card p-4"><div className="small">Pending</div><div style={{fontSize:'26px',fontWeight:700}}>{kpis.todo}</div></div>
          </div>
          <div className="card p-4 mt-4">
            <h3>Recent Tasks</h3>
            <ul className="list">
              {tasks.slice(0,5).map(t => (
                <li key={t._id}>{t.title} <span className="small" style={{marginLeft:8}}>({t.status})</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card p-4">
          <h3>Team Members</h3>
          <p className="small">Members: {project?.members?.length ?? 1}</p>
        </div>
      </div>
    );
  }

  const filteredTasks = useMemo(() => {
    const q = taskQuery.trim().toLowerCase();
    return tasks.filter(t => {
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

  function renderPriorityBadge(p) {
    const v = (p || 'medium');
    const label = v.charAt(0).toUpperCase() + v.slice(1);
    return <span className={`badge badge-${v}`}>{label}</span>;
  }

  const onDragStart = useCallback((e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  }, []);

  const onDropTo = useCallback(async (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    await changeTaskStatus(taskId, status);
  }, [changeTaskStatus]);

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
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e=>setEditTitle(e.target.value)}
                    onBlur={()=>saveRename(t._id)}
                    onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); saveRename(t._id); } if(e.key==='Escape'){ e.preventDefault(); cancelRename(); } }}
                  />
                ) : (
                  t.title
                )}
              </div>
              <div className="kanban-card-meta small" style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                {renderPriorityBadge(t.priority)}
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
                <button className="link" onClick={()=>{ setTaskModal({ open:true, task:t }); setNewTask({ title:t.title||'', description:t.description||'', dueDate:t.dueDate? new Date(t.dueDate).toISOString().slice(0,10):'', priority: t.priority || 'medium' }); setModalAssignee((t.assignees && t.assignees[0]) || ''); setModalLabels(Array.isArray(t.labels)? t.labels : []); }}>Edit</button>
                <button className="link danger" onClick={async ()=>{ if(!confirm('Delete task?')) return; try{ await apiDeleteTask(t._id); setTasks(tasks.filter(x=>x._id!==t._id)); notify('Task deleted','success'); } catch(_) { notify('Delete failed','error'); } }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function TasksPanel() {
    return (
      <section className={`tasks-panel ${dense ? 'dense' : ''}`}>
        <div className="filters-bar card">
          <div>
            <label className="small">View</label>
            <div style={{ display:'flex', gap:6 }}>
              <button type="button" className={taskView==='board'?'btn btn-primary':'btn'} onClick={()=>setTaskView('board')}>Board</button>
              <button type="button" className={taskView==='list'?'btn btn-primary':'btn'} onClick={()=>setTaskView('list')}>List</button>
            </div>
          </div>
          <div>
            <label className="small">Status</label>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div style={{ minWidth: 220 }}>
            <label className="small">Search</label>
            <input placeholder="Search title/description" value={taskQuery} onChange={e=>setTaskQuery(e.target.value)} />
          </div>
          <div>
            <label className="small">Assignee</label>
            <MemberPicker projectId={id} value={assigneeFilter} onChange={setAssigneeFilter} placeholder="All members" />
          </div>
          <div>
            <label className="small">Priority</label>
            <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="small">Label</label>
            <select value={labelFilter} onChange={e=>setLabelFilter(e.target.value)}>
              <option value="all">All</option>
              {Array.from(new Set(tasks.flatMap(t => Array.isArray(t.labels) ? t.labels : []))).map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'end' }}>
            <div>
              <label className="small">Density</label>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <label className="switch small"><input type="checkbox" checked={dense} onChange={e=>setDense(e.target.checked)} /><span>Compact</span></label>
              </div>
            </div>
            <button type="button" className="btn" onClick={()=>{ setStatusFilter('all'); setAssigneeFilter(''); setPriorityFilter('all'); setTaskQuery(''); setLabelFilter('all'); }}>Clear Filters</button>
            <button type="button" className="btn btn-primary" onClick={()=>{ setTaskModal({ open:true, task:null }); setNewTask({ title:'', description:'', dueDate:'', priority:'medium' }); setModalAssignee(''); setModalLabels([]); }}>New Task</button>
          </div>
        </div>
        <form onSubmit={addTask} className="task-form">
          <input placeholder="Task title" value={newTask.title} onChange={e=>setNewTask({...newTask, title:e.target.value})} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); } }} />
          <input placeholder="Description" value={newTask.description} onChange={e=>setNewTask({...newTask, description:e.target.value})} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); } }} />
          <input type="date" value={newTask.dueDate} onChange={e=>setNewTask({...newTask, dueDate:e.target.value})} />
          <select value={newTask.priority} onChange={e=>setNewTask({...newTask, priority:e.target.value})}>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button type="submit">Add</button>
        </form>
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
        <ul className="list">
          {filteredTasks.length === 0 && <li className="small">No tasks match filters.</li>}
          {filteredTasks.map(t => (
            <li key={t._id} style={{ display:'block' }}>
              <div className="task-row">
                <input type="checkbox" checked={selectedTaskIds.includes(t._id)} onChange={()=>toggleSelect(t._id)} />
                <span style={{ flex:1, minWidth:200 }}>
                  {editingTaskId === t._id ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={e=>setEditTitle(e.target.value)}
                      onBlur={()=>saveRename(t._id)}
                      onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); saveRename(t._id); } if(e.key==='Escape'){ e.preventDefault(); cancelRename(); } }}
                    />
                  ) : (
                    <>
                      {t.title} {renderPriorityBadge(t.priority)}
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
                <MemberPicker projectId={id} value={(t.assignees && t.assignees[0]) || ''} onChange={async (uid)=>{ const updated = await apiUpdateTask(t._id, { assignees: uid? [uid] : [] }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }} />
                <input type="date" value={t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : ''} onChange={async (e)=>{ const updated = await apiUpdateTask(t._id, { dueDate: e.target.value }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }} />
                <button onClick={()=>startRenameTask(t)}>Rename</button>
                <button onClick={()=>{ setTaskModal({ open:true, task:t }); setNewTask({ title:t.title||'', description:t.description||'', dueDate:t.dueDate? new Date(t.dueDate).toISOString().slice(0,10):'', priority: t.priority || 'medium' }); setModalAssignee((t.assignees && t.assignees[0]) || ''); setModalLabels(Array.isArray(t.labels)? t.labels : []); }}>Edit</button>
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

  function TaskComments({ taskId, embedded = false }) {
    const [open, setOpen] = useState(embedded ? true : false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [text, setText] = useState('');

    async function load() {
      setLoading(true);
      try {
        const list = await apiListTaskComments(taskId);
        setItems(list);
      } catch (_) {}
      setLoading(false);
    }

    async function add() {
      if (!text.trim()) return;
      const c = await apiAddTaskComment(taskId, text.trim());
      setItems([...items, c]);
      setText('');
    }

    return (
      <div className={embedded ? '' : 'card p-3 mt-2'}>
        {!embedded && (
          <button className="link" onClick={async ()=>{ const next=!open; setOpen(next); if (next && items.length===0) await load(); }}>{open ? 'Hide' : 'Show'} comments</button>
        )}
        {open && (
          <div>
            {loading ? <p className="small">Loading…</p> : (
              <ul className="list" style={{ marginTop:8 }}>
                {items.map((c, idx) => (
                  <li key={idx} className="small">{new Date(c.createdAt).toLocaleString()} — {c.text}</li>
                ))}
                {items.length === 0 && <li className="small">No comments yet.</li>}
              </ul>
            )}
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <input placeholder="Add a comment" value={text} onChange={e=>setText(e.target.value)} />
              <button onClick={add}>Post</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function ResourcesPanel() {
    const items = resources
      .filter(r => {
        const q = resQuery.trim().toLowerCase();
        if (!q) return true;
        const text = `${r.title||''} ${r.name||''} ${r.url||''}`.toLowerCase();
        return text.includes(q);
      })
      .filter(r => resourcesProviderFilter==='all' ? true : r.provider === resourcesProviderFilter);

    return (
      <section className="resources-panel">
        <div className="resources-header">
          <h3>Resources</h3>
          <span className="small muted">{resources.length} total</span>
        </div>
        <p className="small">Tip: Max upload size is ~10MB per file (server default).</p>
        <div className="res-actions">
          <label className="btn btn-primary">
            Select files
            <input type="file" multiple onChange={onFileInput} style={{ display:'none' }} />
          </label>
          {uploading && <div className="small" style={{ minWidth:120 }}>Uploading… {uploadProgress}%</div>}
          <div
            className={`dropzone ${dragOver ? 'over' : ''}`}
            onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }}
            onDragLeave={()=>setDragOver(false)}
            onDrop={onDrop}
          >
            Drag & drop files here
          </div>
        </div>
        <div className="resources-toolbar">
          <input placeholder="Search resources" value={resQuery} onChange={e=>setResQuery(e.target.value)} />
          <div style={{ marginLeft:'auto', display:'flex', gap:12, alignItems:'center' }}>
            <label className="small">Provider</label>
            <select value={resourcesProviderFilter} onChange={e=>setResourcesProviderFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="upload">Upload</option>
              <option value="external">External</option>
            </select>
          </div>
        </div>
        <div className="link-adder">
          <input placeholder="Link title (optional)" value={linkForm.title} onChange={e=>setLinkForm({...linkForm, title:e.target.value})} />
          <input placeholder="https://example.com" value={linkForm.url} onChange={e=>setLinkForm({...linkForm, url:e.target.value})} />
          <button className="btn" onClick={async ()=>{ try { if(!linkForm.url) return; let url = linkForm.url.trim(); if (!/^https?:\/\//i.test(url)) url = `https://${url}`; const r = await apiCreateResourceLink(id, { title: linkForm.title, url }); setResources([r, ...resources]); setLinkForm({ title:'', url:'' }); notify('Link added','success'); } catch(_) { notify('Link add failed','error'); } }}>Add link</button>
        </div>
        {resourcesLoading ? <p className="small">Loading resources…</p> : null}
        {!resourcesLoading && items.length === 0 && (
          <p className="small">No resources yet.</p>
        )}
        {items.length > 0 && (
          <div className="res-grid">
            {items.map(r => (
              <div key={r._id} className="res-card">
                <div className="thumb">
                  {renderResourceThumb(r)}
                </div>
                <div className="info">
                  <a className="title" href={r.url} target="_blank" rel="noreferrer">{r.title || r.name || r.url}</a>
                  <div className="meta">
                    <span className={`badge badge-${r.provider==='external'?'medium':'low'}`}>{r.provider}</span>
                    {r.provider === 'external' && renderFavicon(r.url)}
                  </div>
                </div>
                <div className="actions">
                  <button className="link danger" title="Delete" onClick={() => { if (confirm('Delete resource?')) removeResource(r._id); }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderFavicon(linkUrl) {
    try {
      const u = new URL(linkUrl);
      const ico = `${u.origin}/favicon.ico`;
      return <img src={ico} alt="" width={16} height={16} style={{ opacity:0.8 }} onError={(e)=>{ e.currentTarget.style.display='none'; }} />;
    } catch { return null; }
  }

  function renderResourcePreview(r) {
    const isImage = r.mime?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(r.url || '');
    const isPdf = r.mime === 'application/pdf' || /\.pdf$/i.test(r.url || '');
    if (isImage) return <img src={r.url} alt="" width={48} height={48} style={{ objectFit:'cover', borderRadius:6 }} onError={(e)=>{ e.currentTarget.style.display='none'; }} />;
    if (isPdf) return <span className="small" style={{ padding:'4px 6px', border:'1px solid #e5e7eb', borderRadius:4 }}>PDF</span>;
    if (r.provider === 'external') return <span className="small" style={{ padding:'4px 6px', border:'1px solid #e5e7eb', borderRadius:4 }}>Link</span>;
    return null;
  }

  function renderResourceThumb(r) {
    const isImage = r.mime?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(r.url || '');
    const isPdf = r.mime === 'application/pdf' || /\.pdf$/i.test(r.url || '');
    if (isImage) return <img src={r.url} alt="" onError={(e)=>{ e.currentTarget.style.display='none'; }} />;
    if (isPdf) return <div className="filetype">PDF</div>;
    if (r.provider === 'external') return <div className="filetype">LINK</div>;
    return <div className="filetype">FILE</div>;
  }

  function SettingsPanel() {
    if (!amPrivileged) return <p className="small">Only owners/admins can manage settings.</p>;
    return (
      <section>
        <h3>Project Settings</h3>
        <form onSubmit={saveSettings} className="task-form">
          <label>Visibility
            <select value={settings.visibility} onChange={e=>setSettings({...settings, visibility:e.target.value})}>
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </label>
          <label style={{ display:'flex', gap:6, alignItems:'center' }}>
            <input type="checkbox" checked={settings.allowMemberInvites} onChange={e=>setSettings({...settings, allowMemberInvites:e.target.checked})} />
            Allow members to invite
          </label>
          <button type="submit">Save</button>
        </form>
        <div style={{ marginTop:12 }}>
          <h4>Invites</h4>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={makeInvite}>Generate Invite</button>
            <button onClick={loadInvites}>Refresh</button>
          </div>
          <ul className="list">
            {invites.map(inv => (
              <li key={inv._id} style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <span>Code: <code>{inv.code}</code></span>
                <button onClick={async()=>{ try{ await navigator.clipboard.writeText(inv.code); notify('Code copied', 'success'); } catch(_) { notify('Copy failed','error'); } }}>Copy code</button>
                <a href={`${window.location.origin}/invite/${inv.token}`} target="_blank" rel="noreferrer">Link</a>
                <button onClick={async()=>{ try{ await navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`); notify('Link copied', 'success'); } catch(_) { notify('Copy failed','error'); } }}>Copy link</button>
                <span>Uses: {inv.usedCount}{inv.usageLimit?`/${inv.usageLimit}`:''}</span>
                <button onClick={async ()=>{ try { const toggled = await apiToggleInvite(inv._id, !inv.enabled); setInvites(invites.map(i=>i._id===inv._id? toggled : i)); notify(toggled.enabled? 'Invite enabled' : 'Invite disabled', 'success'); } catch(_) { notify('Toggle failed','error'); } }}>
                  {inv.enabled ? 'Disable' : 'Enable'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <AppLayout
      sidebar={<ProjectSidebar active={tab} onChange={setTab} title={project?.name} subtitle={project?.description} />}
      topbar={<Topbar />}
    >
      {!project ? (
        <p>Loading...</p>
      ) : (
        <div className="container">
          {tab === 'dashboard' && <DashboardPanel />}
          {tab === 'tasks' && <TasksPanel />}
          {tab === 'resources' && <ResourcesPanel />}
          {tab === 'settings' && <SettingsPanel />}
          {/* TODO: learning, snippets, solutions, discussion tabs */}
        </div>
      )}
      <Modal open={taskModal.open} title={taskModal.task? 'Edit Task' : 'New Task'} onClose={()=>setTaskModal({ open:false, task:null })}
        footer={<>
          <button className="btn" onClick={()=>setTaskModal({ open:false, task:null })}>Cancel</button>
          <button className="btn btn-primary" onClick={(e)=>addTask(e)}>Save</button>
        </>}
      >
        <div className="task-form">
          <input autoFocus placeholder="Task title" value={newTask.title} onChange={e=>setNewTask({...newTask, title:e.target.value})} />
          <input placeholder="Description" value={newTask.description} onChange={e=>setNewTask({...newTask, description:e.target.value})} />
          <input type="date" value={newTask.dueDate} onChange={e=>setNewTask({...newTask, dueDate:e.target.value})} />
          <select value={newTask.priority} onChange={e=>setNewTask({...newTask, priority:e.target.value})}>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="card p-3" style={{ marginTop:8 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
            <div>
              <label className="small">Assignee</label>
              <MemberPicker projectId={id} value={modalAssignee} onChange={setModalAssignee} placeholder="Select member" />
            </div>
            <div style={{ flex:1 }}>
              <label className="small">Labels</label>
              <LabelsEditor task={{ labels: modalLabels }} onChange={setModalLabels} />
            </div>
          </div>
        </div>
        {taskModal.task && (
          <div className="card p-3" style={{ marginTop:8 }}>
            <h4 style={{ marginTop:0 }}>Comments</h4>
            <TaskComments taskId={taskModal.task._id} embedded />
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
