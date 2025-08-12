import React, { useEffect, useMemo, useState, useCallback } from 'react';
import './Project.css';
import { useParams } from 'react-router-dom';
import { apiGetProject, apiListProjectTasks, apiCreateTask, apiUpdateTask, apiUpdateProject, apiListTaskComments, apiAddTaskComment } from '../../services/projects.js';
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
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [taskView, setTaskView] = useState('board'); // 'board' | 'list'
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const { notify } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [linkForm, setLinkForm] = useState({ title:'', url:'' });
  const [resQuery, setResQuery] = useState('');
  const [taskModal, setTaskModal] = useState({ open:false, task:null });

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
    setNewTask({ title: '', description: '', dueDate: '' });
    setTaskModal({ open:false, task:null });
  } catch (e) {
    notify(taskModal.task ? 'Update task failed' : 'Create task failed', 'error');
  }
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
    return tasks.filter(t => {
      const byStatus = statusFilter === 'all' ? true : t.status === statusFilter;
      const byAssignee = assigneeFilter ? (Array.isArray(t.assignees) && t.assignees.includes(assigneeFilter)) : true;
      return byStatus && byAssignee;
    });
  }, [tasks, statusFilter, assigneeFilter]);

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
    const list = filteredTasks.filter(t => t.status === status);
    return (
      <div className="kanban-col" onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>onDropTo(e, status)}>
        <div className="kanban-col-header">{title} <span className="small">({list.length})</span></div>
        <div className="kanban-col-body">
          {list.map(t => (
            <div key={t._id} className="kanban-card" draggable onDragStart={(e)=>onDragStart(e, t._id)}>
              <div className="kanban-card-title">{t.title}</div>
              {t.dueDate && <div className="kanban-card-meta small">Due {new Date(t.dueDate).toLocaleDateString()}</div>}
              <div className="kanban-card-actions">
                {me && <button className="link" onClick={async ()=>{ try { const updated = await apiUpdateTask(t._id, { assignees: [me._id] }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); notify('Assigned to you','success'); } catch(_) { notify('Assign failed','error'); } }}>Assign me</button>}
                <button className="link" onClick={()=>{ setTaskModal({ open:true, task:t }); setNewTask({ title:t.title||'', description:t.description||'', dueDate:t.dueDate? new Date(t.dueDate).toISOString().slice(0,10):'' }); }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function TasksPanel() {
    return (
      <section>
        <h3>Tasks</h3>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', margin:'8px 0 12px' }}>
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
          <div>
            <label className="small">Assignee</label>
            <MemberPicker projectId={id} value={assigneeFilter} onChange={setAssigneeFilter} placeholder="All members" />
          </div>
          <div style={{ marginLeft:'auto' }}>
            <button type="button" className="btn btn-primary" onClick={()=>{ setTaskModal({ open:true, task:null }); setNewTask({ title:'', description:'', dueDate:'' }); }}>New Task</button>
          </div>
        </div>
        <form onSubmit={addTask} className="task-form">
          <input autoFocus placeholder="Task title" value={newTask.title} onChange={e=>setNewTask({...newTask, title:e.target.value})} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); } }} />
          <input placeholder="Description" value={newTask.description} onChange={e=>setNewTask({...newTask, description:e.target.value})} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); } }} />
          <input type="date" value={newTask.dueDate} onChange={e=>setNewTask({...newTask, dueDate:e.target.value})} />
          <button type="submit">Add</button>
        </form>
        {tasksLoading ? (<p className="small">Loading tasks…</p>) : (taskView === 'list' ? (
        <ul className="list">
          {filteredTasks.length === 0 && <li className="small">No tasks match filters.</li>}
          {filteredTasks.map(t => (
            <li key={t._id} style={{ display:'block' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <span style={{ flex:1, minWidth:200 }}>
                  {t.title}
                  {t.dueDate && <span style={{ marginLeft:8, color:'#6b7280', fontSize:12 }}>(due {new Date(t.dueDate).toLocaleDateString()})</span>}
                </span>
                <select value={t.status} onChange={(e)=>changeTaskStatus(t._id, e.target.value)}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                {me && <button onClick={async ()=>{ try { const updated = await apiUpdateTask(t._id, { assignees: [me._id] }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); notify('Assigned to you','success'); } catch(_) { notify('Assign failed','error'); } }}>Assign me</button>}
                <MemberPicker projectId={id} value={(t.assignees && t.assignees[0]) || ''} onChange={async (uid)=>{ const updated = await apiUpdateTask(t._id, { assignees: uid? [uid] : [] }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }} />
                <input type="date" value={t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : ''} onChange={async (e)=>{ const updated = await apiUpdateTask(t._id, { dueDate: e.target.value }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }} />
                <button onClick={()=>{ setTaskModal({ open:true, task:t }); setNewTask({ title:t.title||'', description:t.description||'', dueDate:t.dueDate? new Date(t.dueDate).toISOString().slice(0,10):'' }); }}>Edit</button>
              </div>
              <TaskComments taskId={t._id} />
            </li>
          ))}
  </ul>
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

  function TaskComments({ taskId }) {
    const [open, setOpen] = useState(false);
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
      <div className="card p-3 mt-2">
        <button className="link" onClick={async ()=>{ const next=!open; setOpen(next); if (next && items.length===0) await load(); }}>{open ? 'Hide' : 'Show'} comments</button>
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
    return (
      <section>
        <h3>Resources</h3>
  <p className="small">Tip: Max upload size is ~10MB per file (server default).</p>
        <div className="res-actions">
          <label className="btn">
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
        <div style={{ display:'flex', gap:8, margin:'8px 0 16px', flexWrap:'wrap' }}>
          <input placeholder="Link title (optional)" value={linkForm.title} onChange={e=>setLinkForm({...linkForm, title:e.target.value})} />
          <input placeholder="https://example.com" value={linkForm.url} onChange={e=>setLinkForm({...linkForm, url:e.target.value})} />
          <button onClick={async ()=>{ try { if(!linkForm.url) return; const r = await apiCreateResourceLink(id, linkForm); setResources([r, ...resources]); setLinkForm({ title:'', url:'' }); notify('Link added','success'); } catch(_) { notify('Link add failed','error'); } }}>Add link</button>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', margin:'8px 0' }}>
          <input placeholder="Search resources" value={resQuery} onChange={e=>setResQuery(e.target.value)} />
        </div>
        {resourcesLoading ? <p className="small">Loading resources…</p> : null}
        <ul className="list">
          {resources.filter(r => {
            const q = resQuery.trim().toLowerCase();
            if (!q) return true;
            const text = `${r.title||''} ${r.name||''} ${r.url||''}`.toLowerCase();
            return text.includes(q);
          }).map(r => (
            <li key={r._id} className="res-item">
              <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                {renderResourcePreview(r)}
                <a href={r.url} target="_blank" rel="noreferrer">{r.title || r.name || r.url}</a>
                {r.provider === 'external' && renderFavicon(r.url)}
                <span className="provider">{r.provider}</span>
              </div>
              <button className="danger" onClick={() => removeResource(r._id)}>Delete</button>
            </li>
          ))}
          {!resourcesLoading && resources.length === 0 && <li className="small">No resources yet.</li>}
        </ul>
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
        </div>
      </Modal>
    </AppLayout>
  );
}
