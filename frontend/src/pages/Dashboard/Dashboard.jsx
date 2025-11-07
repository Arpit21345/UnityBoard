import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import GlobalNavbar from '../../components/layout/GlobalNavbar.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ProjectSearch from '../../components/ProjectSearch/ProjectSearch.jsx';
import { apiMe } from '../../services/auth.js';
import { apiListProjects, apiCreateProject, apiDashboardOverview } from '../../services/projects.js';
import { useToast } from '../../components/Toast/ToastContext.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projForm, setProjForm] = useState({ name: '', description: '', visibility: 'private', projectPassword: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [myTasks, setMyTasks] = useState([]);
  const [dueSoonCount, setDueSoonCount] = useState(null);

  const { notify } = useToast();

  const refreshAll = useCallback(async () => {
    try {
      const u = await apiMe();
      setUser(u);
      const list = await apiListProjects(); setProjects(list);
      try {
        const ov = await apiDashboardOverview().catch(()=>({ projects:[], myTasks:[], dueSoonCount:0 }));
        if(ov.projects) setProjects(ov.projects);
        if(ov.myTasks) setMyTasks(ov.myTasks || []);
        if(typeof ov.dueSoonCount === 'number') setDueSoonCount(ov.dueSoonCount);
      } catch { /* ignore */ }
    } catch { /* ignore */ }
  }, []);

  useEffect(()=>{ refreshAll(); }, [refreshAll]);
  useEffect(()=>{ function onProjectsChanged(){ refreshAll(); } window.addEventListener('projects-changed', onProjectsChanged); return ()=>window.removeEventListener('projects-changed', onProjectsChanged); }, [refreshAll]);

  const ownedProjects = useMemo(()=>{
    if(!user) return [];
    return projects.filter(p => p.members?.some(m => String(m.user) === String(user._id || user.id) && m.role === 'owner'));
  }, [projects, user]);

  function myRole(project){
    if(!user) return '';
    const m = project.members?.find(m => String(m.user) === String(user._id || user.id));
    return m?.role || '';
  }

  const filteredOwned = ownedProjects;
  const filteredAll = projects;

  function timeAgo(ts){
    if(!ts) return '';
    const d = new Date(ts); const diff = (Date.now() - d.getTime())/1000;
    if(diff < 60) return `${Math.floor(diff)}s ago`;
    if(diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if(diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return d.toLocaleDateString();
  }



  return (
  <AppLayout sidebar={<Sidebar />} topbar={<GlobalNavbar />}> 
      <div className="container">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Welcome back{user ? `, ${user.name}` : ''}!</h1>
            <p className="small" style={{marginTop:4}}>Quick overview of your workspaces.</p>
          </div>
          <div className="dash-actions">
            <button className="btn primary" onClick={()=>setShowCreate(s=>!s)}>{showCreate? 'Close' : '+ New Project'}</button>
          </div>
        </div>

        <div className="kpi-row">
          <div className="kpi-card"><span className="kpi-label">Active Projects</span><span className="kpi-value">{projects.length}</span></div>
            <div className="kpi-card"><span className="kpi-label">Owned</span><span className="kpi-value">{ownedProjects.length}</span></div>
            <div className="kpi-card"><span className="kpi-label">My Tasks</span><span className="kpi-value">{myTasks.length}</span></div>
            <div className="kpi-card"><span className="kpi-label">Due Soon</span><span className="kpi-value">{dueSoonCount === null ? '—' : dueSoonCount}</span></div>
        </div>

        {showCreate && (
          <form className="create-form card" style={{padding:16,marginTop:12}} onSubmit={async (e)=>{ e.preventDefault(); if(!projForm.name) return; try { const p = await apiCreateProject(projForm); setProjects([p, ...projects]); setProjForm({ name:'', description:'', visibility:'private', allowMemberInvites:false, projectPassword:'' }); setShowCreate(false); notify('Project created','success'); try { window.dispatchEvent(new Event('projects-changed')); } catch {} } catch (err) { const msg = err.response?.data?.error || 'Failed to create project'; notify(msg,'error'); } }}>
            <h4 style={{marginTop:0}}>Create Project</h4>
            <div className="cf-grid">
              <label>Name (must be unique)
                <input className="input" placeholder="e.g. TeamDashboard" value={projForm.name} onChange={e=>setProjForm({...projForm, name:e.target.value})} />
                <small style={{color:'#888',marginTop:4,display:'block'}}>Choose a unique name like GitHub repositories. Case-sensitive.</small>
              </label>
              <label>Description
                <input className="input" placeholder="Optional description" value={projForm.description} onChange={e=>setProjForm({...projForm, description:e.target.value})} />
              </label>
            </div>
            <div className="cf-row">
              <label>Visibility
                <select className="input" value={projForm.visibility} onChange={e=>setProjForm({...projForm, visibility:e.target.value})}>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
              {projForm.visibility === 'private' && (
                <label>Password
                  <input 
                    className="input" 
                    type="text" 
                    placeholder="Set password for private project" 
                    value={projForm.projectPassword} 
                    onChange={e=>setProjForm({...projForm, projectPassword:e.target.value})} 
                  />
                  <small style={{color:'#888',marginTop:4,display:'block'}}>Share this with users who need access</small>
                </label>
              )}
              <button className="btn dark" type="submit">Create</button>
            </div>
          </form>
        )}

        <section className="mt-4">
          <h3 style={{marginTop:0}}>Owned Projects</h3>
          {filteredOwned.length === 0 && <p className="small">No owned projects yet.</p>}
          <div className="project-grid">
            {filteredOwned.map(p => (
              <div key={p._id} className="project-card" onClick={()=>navigate(`/project/${p._id}`)} style={{cursor: 'pointer'}}>
                <div className="pc-head">
                  <span className="pc-name">{p.name}</span>
                  <span className={`role-badge role-${myRole(p)}`}>{myRole(p)}</span>
                </div>
                <div className="pc-meta">
                  <span className="vis-tag">{p.visibility}</span>
                  <span className="pc-members">{p.members?.length || 0} members</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4">
          <h3 style={{marginTop:0}}>My Tasks</h3>
          {myTasks.length === 0 && <p className="small">No open tasks assigned to you.</p>}
          {myTasks.length > 0 && (
            <ul className="mytasks-list">
              {myTasks.map(t => (
                <li key={t._id} onClick={()=>navigate(`/project/${t.project}?task=${t._id}`)}> 
                  <span className="mt-title">{t.title}</span>
                  {t.dueDate && <span className="mt-due">{new Date(t.dueDate).toLocaleDateString()}</span>}
                  <span className={`mt-status status-${t.status}`}>{t.status}</span>
                  <span className={`mt-priority pri-${t.priority}`}>{t.priority}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-4">
          <h3 style={{marginTop:0}}>All Projects</h3>
          {filteredAll.length === 0 && <p className="small">No projects.</p>}
          <div className="project-grid">
            {filteredAll.map(p => (
              <div key={p._id} className="project-card" onClick={()=>navigate(`/project/${p._id}`)}> 
                <div className="pc-head">
                  <span className="pc-name">{p.name}</span>
                  <span className={`role-badge role-${myRole(p)}`}>{myRole(p)}</span>
                </div>
                <div className="pc-meta">
                  <span className="vis-tag">{p.visibility}</span>
                  <span className="pc-members">{p.members?.length || 0} members</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Project Search Section */}
        <ProjectSearch />
      </div>
    </AppLayout>
  );
}
