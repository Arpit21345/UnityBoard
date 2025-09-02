import React, { useMemo } from 'react';

export default function DashboardPanel({ project, tasks }) {
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
