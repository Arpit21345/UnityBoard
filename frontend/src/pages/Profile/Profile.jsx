import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import GlobalNavbar from '../../components/layout/GlobalNavbar.jsx';
import { apiMe } from '../../services/auth.js';
import { apiUpdateMe } from '../../services/users.js';
import Spinner from '../../components/ui/Spinner.jsx';

export default function Profile(){
	const [me,setMe] = useState(null);
	const [err,setErr] = useState('');
	const [saving,setSaving] = useState(false);
	const [editingName,setEditingName] = useState('');
	useEffect(()=>{ (async ()=>{ try { const u = await apiMe(); setMe(u); setEditingName(u?.name||''); } catch(e){ setErr('Failed to load profile'); } })(); }, []);

	async function handleSave(){
		try {
			setSaving(true);
			const updated = await apiUpdateMe({ name: editingName });
			setMe(m=>({...m, name: updated.name }));
			window.dispatchEvent(new CustomEvent('user-updated', { detail:{ user: updated } }));
		} catch(e){
			setErr(e.message||'Failed to save');
		} finally { setSaving(false); }
	}
	return (
		<AppLayout sidebar={<Sidebar />} topbar={<GlobalNavbar />}> 
			<div className="container">
				<h2 style={{marginTop:0}}>Profile</h2>
				{err && <p className="small" style={{color:'#b91c1c'}}>{err}</p>}
				{!err && !me && <Spinner />}
				{me && (
					<div className="card p-3" style={{marginTop:12}}>
						<div style={{display:'flex',alignItems:'center',gap:12}}>
							<div style={{width:48,height:48,borderRadius:12,background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:600}}>{(me.name||'?').slice(0,1).toUpperCase()}</div>
							<div>
								<div style={{fontWeight:600}}>{me.name||'Unnamed User'}</div>
								<div className="small" style={{color:'#6b7280'}}>{me.email}</div>
							</div>
						</div>
						<div style={{marginTop:16}}>
							<h4 style={{margin:'0 0 6px 0'}}>Account</h4>
							<ul className="small" style={{paddingLeft:18,margin:0,display:'flex',flexDirection:'column',gap:4}}>
								<li>User ID: <code>{me._id || me.id}</code></li>
								<li>Theme: <code>{localStorage.getItem('theme')||'light'}</code></li>
							</ul>
							<div style={{marginTop:12,maxWidth:380}}>
								<label className="small" style={{display:'block',marginBottom:4}}>Display Name</label>
								<input value={editingName} onChange={e=>setEditingName(e.target.value)} style={{width:'100%'}} />
								<div style={{marginTop:6,display:'flex',gap:8}}>
									<button className="btn btn-primary" disabled={saving || !editingName.trim() || editingName===me.name} onClick={handleSave}>{saving? 'Saving...' : 'Save'}</button>
									{saving && <Spinner size={18} />}
								</div>
								<p className="small" style={{margin:'4px 0 0 0',color:'#6b7280'}}>Change your display name used across the app.</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</AppLayout>
	);
}
