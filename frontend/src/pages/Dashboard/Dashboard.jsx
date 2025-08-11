import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Topbar from '../../components/layout/Topbar.jsx';
import { apiMe } from '../../services/auth.js';
import { apiListProjects, apiCreateProject } from '../../services/projects.js';
import { apiAcceptInviteCode } from '../../services/invites.js';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projForm, setProjForm] = useState({ name: '', description: '', visibility: 'private', allowMemberInvites: false });
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const u = await apiMe();
        setUser(u);
        const list = await apiListProjects();
        setProjects(list);
      } catch (_) {}
    })();
  }, []);

  return (
    <AppLayout sidebar={<Sidebar />} topbar={<Topbar />}>
      <div className="container">
        <h1>Welcome back{user ? `, ${user.name}` : ''}!</h1>
        <div className="kpi">
          <div className="card"><div className="small">Active Projects</div><div style={{fontSize:'28px',fontWeight:700}}>{projects.length}</div></div>
          <div className="card"><div className="small">Completed Projects</div><div style={{fontSize:'28px',fontWeight:700}}>0</div></div>
          <div className="card"><div className="small">Team Members</div><div style={{fontSize:'28px',fontWeight:700}}>—</div></div>
          <div className="card"><div className="small">Avg. Completion</div><div style={{fontSize:'28px',fontWeight:700}}>—</div></div>
        </div>

        <section className="mt-4">
          <div className="flex" style={{justifyContent:'space-between',alignItems:'center'}}>
            <h3>Your Projects</h3>
            <button className="btn primary">+ New Project</button>
          </div>
          <form className="create-form" onSubmit={async (e)=>{ e.preventDefault(); if(!projForm.name) return; const p = await apiCreateProject(projForm); setProjects([p, ...projects]); setProjForm({ name:'', description:'', visibility:'private', allowMemberInvites:false }); }}>
            <input className="input" placeholder="Project name" value={projForm.name} onChange={e=>setProjForm({...projForm, name:e.target.value})} />
            <input className="input" placeholder="Description" value={projForm.description} onChange={e=>setProjForm({...projForm, description:e.target.value})} />
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <label>Visibility
                <select className="input" value={projForm.visibility} onChange={e=>setProjForm({...projForm, visibility:e.target.value})}>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <label style={{ display:'flex', gap:6, alignItems:'center' }}>
                <input type="checkbox" checked={projForm.allowMemberInvites} onChange={e=>setProjForm({...projForm, allowMemberInvites:e.target.checked})} />
                Allow members to invite
              </label>
            </div>
            <button className="btn dark" type="submit">Create</button>
          </form>

          <div className="grid cols-2 mt-4">
            <div className="card p-4">
              <h4>Join a project by code</h4>
              <form onSubmit={async (e)=>{ e.preventDefault(); if(!joinCode.trim()) return; const proj = await apiAcceptInviteCode(joinCode.trim()); window.location.href = `/project/${proj._id}`; }}>
                <div className="flex gap-3" style={{alignItems:'center'}}>
                  <input className="input" placeholder="Invite code" value={joinCode} onChange={e=>setJoinCode(e.target.value)} />
                  <button className="btn" type="submit">Join</button>
                </div>
              </form>
            </div>

            <div className="card p-4">
              <h4>Tips</h4>
              <p className="small">Use the AI assistant (bottom-right) to generate tasks and summaries.</p>
            </div>
          </div>

          <ul className="list mt-4">
            {projects.map(p => (
              <li key={p._id}><a href={`/project/${p._id}`}>{p.name}</a></li>
            ))}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
