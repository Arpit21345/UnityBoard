import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Topbar from '../../components/layout/Topbar.jsx';
import { apiListProjects, apiUnarchiveProject } from '../../services/projects.js';
import { useToast } from '../../components/Toast/ToastContext.jsx';

export default function PastProjects() {
  const { notify } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async()=>{ try { const list = await apiListProjects('archived'); setProjects(list); } catch { notify('Failed to load','error'); } finally { setLoading(false); } })(); }, []);
  return (
    <AppLayout sidebar={<Sidebar />} topbar={<Topbar />}>
      <div className="container">
        <h1>Past Projects</h1>
        {loading ? <p>Loading…</p> : (
          <ul className="list mt-4">
            {projects.map(p => (
              <li key={p._id} style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ flex:1 }}><a href={`/project/${p._id}`}>{p.name}</a></span>
                <button onClick={async()=>{ try { await apiUnarchiveProject(p._id); setProjects(projects.filter(x=>x._id!==p._id)); notify('Restored','success'); } catch { notify('Failed','error'); } }}>Restore</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
