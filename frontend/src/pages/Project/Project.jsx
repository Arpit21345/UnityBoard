import React, { useEffect, useMemo, useState } from 'react';
import './Project.css';
import { useParams } from 'react-router-dom';
import { apiGetProject, apiListProjectTasks, apiCreateTask, apiUpdateTask, apiUpdateProject, apiListTaskComments, apiAddTaskComment } from '../../services/projects.js';
import { apiListInvites, apiCreateInvite, apiToggleInvite } from '../../services/invites.js';
import { apiMe } from '../../services/auth.js';
import { apiListResources, apiUploadResourceFile, apiDeleteResource } from '../../services/resources.js';
import { useAiContext } from '../../components/AiHelper/AiContext.jsx';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Topbar from '../../components/layout/Topbar.jsx';
import ProjectSidebar from '../../components/layout/ProjectSidebar.jsx';
import MemberPicker from '../../components/Members/MemberPicker.jsx';

export default function Project() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const { setCtx } = useAiContext();
  const [me, setMe] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [resources, setResources] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    (async () => {
      try {
        const user = await apiMe();
        setMe(user);
  const p = await apiGetProject(id);
        setProject(p);
        const t = await apiListProjectTasks(id);
        setTasks(t);
  const r = await apiListResources(id);
  setResources(r);
      } catch (_) {}
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
  const t = await apiCreateTask(id, payload);
    setTasks([t, ...tasks]);
  setNewTask({ title: '', description: '', dueDate: '' });
  }

  async function changeTaskStatus(taskId, status) {
    const updated = await apiUpdateTask(taskId, { status });
    setTasks(tasks.map(t => t._id === taskId ? updated : t));
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const uploaded = [];
    for (const file of files) {
      const res = await apiUploadResourceFile(id, file);
      uploaded.push(res);
    }
    setResources([...uploaded, ...resources]);
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
    await apiDeleteResource(id, resourceId);
    setResources(resources.filter(r => r._id !== resourceId));
  }

  const amPrivileged = project && me && project.members?.some(m => m.user === me._id && (m.role === 'owner' || m.role === 'admin'));
  const [invites, setInvites] = useState([]);
  const [settings, setSettings] = useState({ visibility: 'private', allowMemberInvites: false });

  useEffect(() => {
    if (project) setSettings({ visibility: project.visibility, allowMemberInvites: project.allowMemberInvites });
  }, [project]);

  async function loadInvites() {
    if (!amPrivileged) return;
    const list = await apiListInvites(id);
    setInvites(list);
  }

  async function saveSettings(e) {
    e.preventDefault();
    const updated = await apiUpdateProject(id, settings);
    setProject(updated);
  }

  async function makeInvite() {
    const inv = await apiCreateInvite(id, { expiresInDays: 7 });
    setInvites([inv, ...invites]);
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

  function TasksPanel() {
    return (
      <section>
        <h3>Tasks</h3>
        <form onSubmit={addTask} className="task-form">
          <input placeholder="Task title" value={newTask.title} onChange={e=>setNewTask({...newTask, title:e.target.value})} />
          <input placeholder="Description" value={newTask.description} onChange={e=>setNewTask({...newTask, description:e.target.value})} />
          <input type="date" value={newTask.dueDate} onChange={e=>setNewTask({...newTask, dueDate:e.target.value})} />
          <button type="submit">Add</button>
        </form>
        <ul className="list">
          {tasks.map(t => (
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
                {me && <button onClick={async ()=>{ const updated = await apiUpdateTask(t._id, { assignees: [me._id] }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }}>Assign me</button>}
                <MemberPicker projectId={id} value={(t.assignees && t.assignees[0]) || ''} onChange={async (uid)=>{ const updated = await apiUpdateTask(t._id, { assignees: uid? [uid] : [] }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }} />
                <input type="date" value={t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : ''} onChange={async (e)=>{ const updated = await apiUpdateTask(t._id, { dueDate: e.target.value }); setTasks(tasks.map(x=>x._id===t._id? updated : x)); }} />
              </div>
              <TaskComments taskId={t._id} />
            </li>
          ))}
        </ul>
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
        <div className="res-actions">
          <label className="btn">
            Select files
            <input type="file" multiple onChange={onFileInput} style={{ display:'none' }} />
          </label>
          <div
            className={`dropzone ${dragOver ? 'over' : ''}`}
            onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }}
            onDragLeave={()=>setDragOver(false)}
            onDrop={onDrop}
          >
            Drag & drop files here
          </div>
        </div>
        <ul className="list">
          {resources.map(r => (
            <li key={r._id} className="res-item">
              <a href={r.url} target="_blank" rel="noreferrer">{r.title || r.name || r.url}</a>
              <span className="provider">{r.provider}</span>
              <button className="danger" onClick={() => removeResource(r._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    );
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
                <button onClick={async()=>{ try{ await navigator.clipboard.writeText(inv.code); } catch(_){} }}>Copy code</button>
                <a href={`${window.location.origin}/invite/${inv.token}`} target="_blank" rel="noreferrer">Link</a>
                <button onClick={async()=>{ try{ await navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`); } catch(_){} }}>Copy link</button>
                <span>Uses: {inv.usedCount}{inv.usageLimit?`/${inv.usageLimit}`:''}</span>
                <button onClick={async ()=>{ const toggled = await apiToggleInvite(inv._id, !inv.enabled); setInvites(invites.map(i=>i._id===inv._id? toggled : i));}}>
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
    </AppLayout>
  );
}
