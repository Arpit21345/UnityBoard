import React, { useEffect, useState, useMemo } from 'react';
import './Dashboard.css';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import GlobalNavbar from '../../components/layout/GlobalNavbar.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { apiMe } from '../../services/auth.js';
import { apiListProjects, apiCreateProject, apiDashboardOverview, apiDashboardActivity, apiArchiveProject } from '../../services/projects.js';
import { apiAcceptInviteCode, apiCreateInvite } from '../../services/invites.js';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projForm, setProjForm] = useState({ name: '', description: '', visibility: 'private', allowMemberInvites: false });
  const [joinCode, setJoinCode] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [inviteTargets, setInviteTargets] = useState({ open:false, projectId:null, latest:null, error:null, loading:false });
  const [myTasks, setMyTasks] = useState([]);
  const [dueSoonCount, setDueSoonCount] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await apiMe();
        setUser(u);
        // legacy list for continuity
        const list = await apiListProjects(); setProjects(list);
        // aggregated overview + activity in parallel
        try {
          const [ov, act] = await Promise.all([
            apiDashboardOverview().catch(()=>({ projects:[], myTasks:[], dueSoonCount:0 })),
            apiDashboardActivity().catch(()=>[])
          ]);
          if(ov.projects) setProjects(ov.projects);
          if(ov.myTasks) setMyTasks(ov.myTasks || []);
          if(typeof ov.dueSoonCount === 'number') setDueSoonCount(ov.dueSoonCount);
          setActivity(act);
        } catch { /* ignore */ }
        finally { setActivityLoading(false); }
      } catch (_) {}
    })();
  }, []);

  async function generateInvite(projectId){
    setInviteTargets(s=>({ ...s, loading:true, projectId }));
    try {
      const inv = await apiCreateInvite(projectId, { expiresInDays:7 });
      setInviteTargets({ open:true, projectId, latest:inv, error:null, loading:false });
    } catch(e){
      setInviteTargets({ open:true, projectId, latest:null, error:'Failed', loading:false });
    }
  }

  const ownedProjects = useMemo(()=>{
    if(!user) return [];
    return projects.filter(p => p.members?.some(m => String(m.user) === String(user._id || user.id) && m.role === 'owner'));
  }, [projects, user]);

  function myRole(project){
    if(!user) return '';
    const m = project.members?.find(m => String(m.user) === String(user._id || user.id));
    return m?.role || '';
  }

  const filteredOwned = ownedProjects.filter(p => !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredAll = projects.filter(p => !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()));

  function timeAgo(ts){
    if(!ts) return '';
    const d = new Date(ts); const diff = (Date.now() - d.getTime())/1000;
    if(diff < 60) return `${Math.floor(diff)}s ago`;
    if(diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if(diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return d.toLocaleDateString();
  }

  function iconFor(type){
    if(!type) return '•';
    if(type.startsWith('project.')) return '📁';
    if(type.startsWith('task.created')) return '🆕';
    if(type.startsWith('task.updated')) return '🛠';
    if(type.startsWith('task.deleted')) return '🗑';
    if(type.startsWith('task.commented')) return '💬';
    if(type.startsWith('invite.')) return '✉️';
    return '•';
  }

  const activityByDay = useMemo(()=>{
    const groups = {};
    activity.forEach(a => {
      const day = new Date(a.createdAt).toDateString();
      (groups[day] = groups[day] || []).push(a);
    });
    return Object.entries(groups).sort((a,b)=> new Date(b[0]) - new Date(a[0]));
  }, [activity]);

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
            <div className="join-inline">
              <form onSubmit={async (e)=>{ e.preventDefault(); if(!joinCode.trim()) return; const proj = await apiAcceptInviteCode(joinCode.trim()); window.location.href = `/project/${proj._id}`; }}>
                <input className="input" placeholder="Invite code" value={joinCode} onChange={e=>setJoinCode(e.target.value)} />
              </form>
            </div>
          </div>
        </div>

        <div className="kpi-row">
          <div className="kpi-card"><span className="kpi-label">Active Projects</span><span className="kpi-value">{projects.length}</span></div>
            <div className="kpi-card"><span className="kpi-label">Owned</span><span className="kpi-value">{ownedProjects.length}</span></div>
            <div className="kpi-card"><span className="kpi-label">My Tasks</span><span className="kpi-value">{myTasks.length}</span></div>
            <div className="kpi-card"><span className="kpi-label">Due Soon</span><span className="kpi-value">{dueSoonCount === null ? '—' : dueSoonCount}</span></div>
        </div>

        <div className="dash-filters">
          <input className="input" placeholder="Search projects..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        {showCreate && (
          <form className="create-form card" style={{padding:16,marginTop:12}} onSubmit={async (e)=>{ e.preventDefault(); if(!projForm.name) return; const p = await apiCreateProject(projForm); setProjects([p, ...projects]); setProjForm({ name:'', description:'', visibility:'private', allowMemberInvites:false }); setShowCreate(false); }}>
            <h4 style={{marginTop:0}}>Create Project</h4>
            <div className="cf-grid">
              <label>Name
                <input className="input" placeholder="Project name" value={projForm.name} onChange={e=>setProjForm({...projForm, name:e.target.value})} />
              </label>
              <label>Description
                <input className="input" placeholder="Description" value={projForm.description} onChange={e=>setProjForm({...projForm, description:e.target.value})} />
              </label>
            </div>
            <div className="cf-row">
              <label>Visibility
                <select className="input" value={projForm.visibility} onChange={e=>setProjForm({...projForm, visibility:e.target.value})}>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <label className="checkbox-inline">
                <input type="checkbox" checked={projForm.allowMemberInvites} onChange={e=>setProjForm({...projForm, allowMemberInvites:e.target.checked})} /> Allow member invites
              </label>
              <button className="btn dark" type="submit">Create</button>
            </div>
          </form>
        )}

        <section className="mt-4">
          <h3 style={{marginTop:0}}>Owned Projects</h3>
          {filteredOwned.length === 0 && <p className="small">No owned projects yet.</p>}
          <div className="project-grid">
            {filteredOwned.map(p => (
              <div key={p._id} className="project-card" >
                <div className="pc-head">
                  <button className="pc-name-btn" onClick={()=>window.location.href=`/project/${p._id}`}>{p.name}</button>
                  <span className={`role-badge role-${myRole(p)}`}>{myRole(p)}</span>
                </div>
                <div className="pc-meta">
                  <span className="vis-tag">{p.visibility}</span>
                  <span className="pc-members">{p.members?.length || 0} members</span>
                </div>
                <div className="pc-actions">
                  <button className="mini-btn" title="Open" onClick={()=>window.location.href=`/project/${p._id}`}>Open</button>
                  <button className="mini-btn" title="Generate invite" onClick={()=>generateInvite(p._id)}>Invite</button>
                  {myRole(p)==='owner' && (p.status!=='archived') && <button className="mini-btn" title="Archive" onClick={async (e)=>{ e.stopPropagation(); try { const upd = await apiArchiveProject(p._id); setProjects(projects.map(x=>x._id===p._id? upd : x)); } catch { alert('Archive failed'); } }}>Archive</button>}
                </div>
                {inviteTargets.open && inviteTargets.projectId === p._id && (
                  <div className="invite-box">
                    {inviteTargets.loading && <div className="small">Generating…</div>}
                    {inviteTargets.error && <div className="small danger-text">{inviteTargets.error}</div>}
                    {inviteTargets.latest && (
                      <div className="small" style={{display:'flex',flexDirection:'column',gap:4}}>
                        <div>Code: <code>{inviteTargets.latest.code}</code></div>
                        <div style={{display:'flex',gap:6}}>
                          <button className="mini-btn" onClick={async ()=>{ try { await navigator.clipboard.writeText(inviteTargets.latest.code); } catch {} }}>Copy Code</button>
                          <button className="mini-btn" onClick={async ()=>{ try { await navigator.clipboard.writeText(`${window.location.origin}/invite/${inviteTargets.latest.token}`); } catch {} }}>Copy Link</button>
                          <button className="mini-btn" onClick={()=>setInviteTargets({open:false,projectId:null,latest:null,error:null,loading:false})}>Close</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                <li key={t._id} onClick={()=>window.location.href=`/project/${t.project}?task=${t._id}`}> 
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
          <h3 style={{marginTop:0}}>Recent Activity</h3>
          {activityLoading && <Spinner />}
          {!activityLoading && activity.length === 0 && <p className="small">No recent activity.</p>}
          {!activityLoading && activity.length > 0 && (
            <div className="activity-feed">
              {activityByDay.map(([day, items]) => (
                <div key={day} className="af-day">
                  <div className="af-day-label">{day}</div>
                  <ul className="af-list">
                    {items.map(it => (
                      <li key={it._id || (it.project+it.refId+it.type+it.createdAt)} className="af-item">
                        <span className="af-ico" title={it.type}>{iconFor(it.type)}</span>
                        <span className="af-msg">{it.message || it.type}</span>
                        <span className="af-time">{timeAgo(it.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-4">
          <h3 style={{marginTop:0}}>All Projects</h3>
          {filteredAll.length === 0 && <p className="small">No projects.</p>}
          <div className="project-grid">
            {filteredAll.map(p => (
              <div key={p._id} className="project-card" onClick={()=>window.location.href=`/project/${p._id}`}>
                <div className="pc-head">
                  <span className="pc-name">{p.name}</span>
                  <span className={`role-badge role-${myRole(p)}`}>{myRole(p)}</span>
                </div>
                <div className="pc-meta">
                  <span className="vis-tag">{p.visibility}</span>
                  <span className="pc-members">{p.members?.length || 0} members</span>
                </div>
                {myRole(p)==='owner' && p.status!=='archived' && (
                  <div style={{marginTop:8,display:'flex',gap:6}}>
                    <button className="mini-btn" onClick={async (e)=>{ e.stopPropagation(); try { const upd = await apiArchiveProject(p._id); setProjects(projects.map(x=>x._id===p._id? upd : x)); } catch { alert('Archive failed'); } }}>Archive</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
