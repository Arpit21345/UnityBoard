import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Topbar from '../../components/layout/Topbar.jsx';
import { apiListProjects } from '../../services/projects.js';

export default function PastProjects(){
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [q, setQ] = useState('');
	const [err, setErr] = useState('');

	useEffect(() => { (async ()=>{
		try {
			const list = await apiListProjects();
			setProjects(Array.isArray(list)? list : []);
		} catch (e) { setErr(e?.message || 'Failed to load projects'); }
		finally { setLoading(false); }
	})(); }, []);

	const archived = useMemo(() => {
		const qv = q.trim().toLowerCase();
		return (projects||[]).filter(p => {
			const status = (p.status || p.state || '').toLowerCase();
			const isPast = status === 'archived' || status === 'completed' || status === 'done' || p.archived === true;
			if (!isPast) return false;
			if (!qv) return true;
			return (
				(p.name||'').toLowerCase().includes(qv) ||
				(p.description||'').toLowerCase().includes(qv)
			);
		});
	}, [projects, q]);

	return (
		<AppLayout sidebar={<Sidebar />} topbar={<Topbar />}>
			<div className="container">
				<div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
					<h2 style={{ margin: 0 }}>Past Projects</h2>
					<input className="input" placeholder="Search past projects" value={q} onChange={e=>setQ(e.target.value)} style={{ minWidth: 260 }} />
				</div>

				{loading ? (
					<p className="small" style={{ marginTop: 12 }}>Loading…</p>
				) : err ? (
					<div className="card p-3" style={{ marginTop: 12 }}>
						<h4 style={{ margin: '0 0 6px 0' }}>Couldn’t load</h4>
						<p className="small" style={{ margin: 0 }}>{err}</p>
					</div>
				) : archived.length === 0 ? (
					<div className="card p-4" style={{ marginTop: 12 }}>
						<h4 style={{ marginTop: 0 }}>No past projects</h4>
						<p className="small" style={{ margin: 0 }}>Projects marked archived/completed will appear here.</p>
					</div>
				) : (
					<div className="grid cols-3 mt-4">
						{archived.map(p => (
							<div className="card p-3" key={p._id}>
								<div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
									<h4 style={{ margin:'0 0 4px 0' }}>{p.name}</h4>
									<span className="badge">{(p.status||'archived')}</span>
								</div>
								{p.description && <p className="small" style={{ margin:'0 0 8px 0', color:'#6b7280' }}>{p.description}</p>}
								{(p.ownerName||p.ownerEmail) && (
									<div className="small" style={{ color:'#6b7280' }}>Owner: {p.ownerName || p.ownerEmail}</div>
								)}
								<div style={{ marginTop: 10 }}>
									<a className="btn" href={`/project/${p._id}`}>Open</a>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</AppLayout>
	);
}
