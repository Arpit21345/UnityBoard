import React, { useEffect, useMemo, useState } from 'react';
import { apiGetProjectStats } from '../../../services/projects.js';
import { useToast } from '../../../components/Toast/ToastContext.jsx';

export default function DashboardPanel({ project, tasks }) {
  const { notify } = useToast();
  const [stats, setStats] = useState(null);
  useEffect(() => { (async()=>{ try { const s = await apiGetProjectStats(project._id); setStats(s); } catch { /* optional */ } })(); }, [project?._id]);
  const kpis = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const inprog = tasks.filter(t => t.status === 'in-progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    return { total, done, inprog, todo };
  }, [tasks]);

  return (
    <div className="grid cols-2">
      <div>
        <div className="kpi">
          <div className="card p-4"><div className="small">Total Tasks</div><div style={{fontSize:'26px',fontWeight:700}}>{kpis.total}</div></div>
          <div className="card p-4"><div className="small">Completed</div><div style={{fontSize:'26px',fontWeight:700}}>{kpis.done}</div></div>
          <div className="card p-4"><div className="small">In Progress</div><div style={{fontSize:'26px',fontWeight:700}}>{kpis.inprog}</div></div>
          <div className="card p-4"><div className="small">Pending</div><div style={{fontSize:'26px',fontWeight:700}}>{kpis.todo}</div></div>
        </div>
        {stats ? (
          <div className="kpi mt-4">
            <div className="card p-4"><div className="small">Resources</div><div style={{fontSize:'22px',fontWeight:700}}>{stats.resources}</div></div>
            <div className="card p-4"><div className="small">Threads</div><div style={{fontSize:'22px',fontWeight:700}}>{stats.threads}</div></div>
            <div className="card p-4"><div className="small">Messages</div><div style={{fontSize:'22px',fontWeight:700}}>{stats.messages}</div></div>
            <div className="card p-4"><div className="small">Snippets</div><div style={{fontSize:'22px',fontWeight:700}}>{stats.snippets}</div></div>
            <div className="card p-4"><div className="small">Solutions</div><div style={{fontSize:'22px',fontWeight:700}}>{stats.solutions}</div></div>
            <div className="card p-4"><div className="small">Learning</div><div style={{fontSize:'22px',fontWeight:700}}>{stats.learning}</div></div>
          </div>
        ) : (
          <div className="kpi mt-4">
            <div className="card p-4"><div className="small">Resources</div><div className="muted">…</div></div>
            <div className="card p-4"><div className="small">Threads</div><div className="muted">…</div></div>
            <div className="card p-4"><div className="small">Messages</div><div className="muted">…</div></div>
            <div className="card p-4"><div className="small">Snippets</div><div className="muted">…</div></div>
            <div className="card p-4"><div className="small">Solutions</div><div className="muted">…</div></div>
            <div className="card p-4"><div className="small">Learning</div><div className="muted">…</div></div>
          </div>
        )}
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
