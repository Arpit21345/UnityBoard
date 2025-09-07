import React, { useMemo } from 'react';
import './DashboardPanel.css';

export default function DashboardPanel({ project, tasks = [] }) {
  const now = Date.now();
  const in7 = now + 7 * 24 * 60 * 60 * 1000;

  const metrics = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const completion = total ? Math.round((done / total) * 100) : 0;
    const byPriority = tasks.reduce((acc, t) => { const p = t.priority || 'medium'; acc[p] = (acc[p]||0)+1; return acc; }, {});
    const overdue = tasks.filter(t => t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() < now);
    const dueSoon = tasks.filter(t => t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() >= now && new Date(t.dueDate).getTime() <= in7);
    const unassigned = tasks.filter(t => (!t.assignees || t.assignees.length === 0) && t.status !== 'done');
    // member load
    const memberLoad = (project?.members||[]).map(m => {
      const uid = m.user;
      const assigned = tasks.filter(t => Array.isArray(t.assignees) && t.assignees.includes(uid));
      const open = assigned.filter(t => t.status !== 'done').length;
      const closed = assigned.filter(t => t.status === 'done').length;
      return { user: uid, role: m.role, open, closed, total: assigned.length };
    }).sort((a,b)=> b.open - a.open);
    return { total, done, inProgress, todo, completion, byPriority, overdue, dueSoon, unassigned, memberLoad };
  }, [tasks, project, now, in7]);

  const priorityOrder = ['urgent','high','medium','low'];

  function displayUser(id) {
    const member = (project?.members||[]).find(m => m.user === id);
    if (!member) return id?.slice(0,6) || '—';
    // If backend later augments with userName/email attach, we can prefer that.
    return member.name || member.username || member.email || (member.user?.slice(0,6) || '—');
  }

  return (
    <div className="project-dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-left">
          <div className="kpi-grid">
            <div className="kpi-card card p-4"><div className="small">Total</div><div className="kpi-val">{metrics.total}</div></div>
            <div className="kpi-card card p-4"><div className="small">Done</div><div className="kpi-val text-done">{metrics.done}</div></div>
            <div className="kpi-card card p-4"><div className="small">In Progress</div><div className="kpi-val text-inprog">{metrics.inProgress}</div></div>
            <div className="kpi-card card p-4"><div className="small">Todo</div><div className="kpi-val text-todo">{metrics.todo}</div></div>
            <div className="kpi-card card p-4 span-2">
              <div className="small">Completion</div>
              <div className="progress-wrapper">
                <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={metrics.completion}>
                  <div className="progress-fill" style={{ width: metrics.completion + '%' }} />
                </div>
                <div className="progress-label">{metrics.completion}%</div>
              </div>
            </div>
          </div>

          <div className="card p-4 mt-4">
            <h3 className="section-title">Priority Distribution</h3>
            <div className="priority-bars">
              {priorityOrder.map(p => {
                const count = metrics.byPriority[p] || 0;
                const pct = metrics.total ? Math.round((count / metrics.total) * 100) : 0;
                return (
                  <div key={p} className={`priority-row prio-${p}`}>
                    <span className="prio-label">{p.charAt(0).toUpperCase()+p.slice(1)}</span>
                    <div className="prio-bar"><div style={{ width: pct + '%' }} /></div>
                    <span className="prio-count small">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-cards mt-4">
            <div className="card p-4 flex-card">
              <h3 className="section-title">Due Soon (7d)</h3>
              {metrics.dueSoon.length === 0 ? <p className="small muted">None</p> : (
                <ul className="mini-list">
                  {metrics.dueSoon.sort((a,b)=> new Date(a.dueDate)-new Date(b.dueDate)).slice(0,6).map(t => (
                    <li key={t._id}>
                      <span className="truncate" title={t.title}>{t.title}</span>
                      <span className="mini-date">{new Date(t.dueDate).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card p-4 flex-card">
              <h3 className="section-title">Overdue</h3>
              {metrics.overdue.length === 0 ? <p className="small muted">None</p> : (
                <ul className="mini-list">
                  {metrics.overdue.sort((a,b)=> new Date(a.dueDate)-new Date(b.dueDate)).slice(0,6).map(t => (
                    <li key={t._id}>
                      <span className="truncate" title={t.title}>{t.title}</span>
                      <span className="mini-date overdue">{new Date(t.dueDate).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card p-4 flex-card">
              <h3 className="section-title">Unassigned</h3>
              {metrics.unassigned.length === 0 ? <p className="small muted">None</p> : (
                <ul className="mini-list">
                  {metrics.unassigned.slice(0,6).map(t => (
                    <li key={t._id}>
                      <span className="truncate" title={t.title}>{t.title}</span>
                      {t.priority && <span className={`badge badge-${t.priority}`}>{t.priority}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card p-4 mt-4">
            <h3 className="section-title">Recent Tasks</h3>
            {tasks.length === 0 ? <p className="small muted">No tasks yet.</p> : (
              <ul className="mini-list">
                {tasks.slice(0,8).map(t => (
                  <li key={t._id}>
                    <span className="truncate" title={t.title}>{t.title}</span>
                    <span className={`status-pill status-${t.status||'todo'}`}>{t.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="dashboard-right">
          <div className="card p-4">
            <h3 className="section-title">Team Load</h3>
            {metrics.memberLoad.length === 0 ? <p className="small muted">No members.</p> : (
              <table className="mini-table">
                <thead>
                  <tr><th>Member</th><th className="ta-right">Open</th><th className="ta-right">Done</th><th className="ta-right">Total</th></tr>
                </thead>
                <tbody>
                  {metrics.memberLoad.slice(0,10).map(m => (
                    <tr key={m.user}>
                      <td><span className="truncate" title={displayUser(m.user)}>{displayUser(m.user)}</span> <span className="role-badge small">{m.role}</span></td>
                      <td className="ta-right">{m.open}</td>
                      <td className="ta-right">{m.closed}</td>
                      <td className="ta-right">{m.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="card p-4 mt-4">
            <h3 className="section-title">Summary</h3>
            <p className="small" style={{ lineHeight:1.5 }}>
              {metrics.done}/{metrics.total} tasks complete ({metrics.completion}%). {metrics.overdue.length} overdue, {metrics.unassigned.length} unassigned.
            </p>
            <p className="small muted" style={{marginTop:8}}>Focus on clearing overdue & assigning unowned tasks to maintain flow.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
