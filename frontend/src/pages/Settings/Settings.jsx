import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import GlobalNavbar from '../../components/layout/GlobalNavbar.jsx';
import { apiMe } from '../../services/auth.js';
import { apiUpdateMe } from '../../services/users.js';
import Spinner from '../../components/ui/Spinner.jsx';

export default function UserSettings(){
  const [me,setMe] = useState(null);
  const [name,setName] = useState('');
  const [saving,setSaving] = useState(false);
  const [err,setErr] = useState('');
  const [theme,setTheme] = useState(()=> localStorage.getItem('theme')||'light');
  useEffect(()=>{ (async ()=>{ try { const u = await apiMe(); setMe(u); setName(u?.name||''); } catch { setErr('Failed to load'); } })(); }, []);

  function toggleTheme(){ setTheme(t=>{ const nxt = t==='light'?'dark':'light'; document.documentElement.dataset.theme = nxt; localStorage.setItem('theme', nxt); return nxt; }); }
  async function saveName(){ try { setSaving(true); const u = await apiUpdateMe({ name }); setMe(m=>({...m,name:u.name})); window.dispatchEvent(new CustomEvent('user-updated',{ detail:{ user:u }})); } catch(e){ setErr(e.message||'Save failed'); } finally { setSaving(false); } }
  return (
    <AppLayout sidebar={<Sidebar />} topbar={<GlobalNavbar />}> 
      <div className="container">
        <h2 style={{marginTop:0}}>Settings</h2>
        {err && <p className="small" style={{color:'#b91c1c'}}>{err}</p>}
        {!me && !err && <Spinner />}
        {me && (
          <div className="card p-3" style={{marginTop:12,display:'flex',flexDirection:'column',gap:16,maxWidth:520}}>
            <div>
              <h4 style={{margin:'0 0 6px 0'}}>Appearance</h4>
              <button className="btn" onClick={toggleTheme}>Toggle Theme (currently {theme})</button>
            </div>
            <div>
              <h4 style={{margin:'0 0 6px 0'}}>Profile</h4>
              <label className="small" style={{display:'block',marginBottom:4}}>Display Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} style={{maxWidth:320}} />
              <div style={{marginTop:8,display:'flex',gap:8}}>
                <button className="btn btn-primary" disabled={saving || !name.trim() || name===me.name} onClick={saveName}>{saving? 'Saving...' : 'Save'}</button>
                {saving && <Spinner size={18} />}
              </div>
            </div>
            <div>
              <h4 style={{margin:'0 0 6px 0'}}>Notifications</h4>
              <p className="small" style={{margin:0,color:'#6b7280'}}>Granular notification preferences coming soon.</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
