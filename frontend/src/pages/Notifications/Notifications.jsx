import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import GlobalNavbar from '../../components/layout/GlobalNavbar.jsx';
import { apiListNotifications, apiMarkAllNotificationsRead } from '../../services/notifications.js';
import { SOCKET_ENABLED } from '../../services/api.js';
import { getSocket } from '../../services/socket.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/Toast/ToastContext.jsx';

export default function Notifications(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const { notify } = useToast();

  useEffect(()=>{ (async ()=>{
    try { const List = await apiListNotifications(); setItems(List); }
    catch(e){ setErr(e?.message||'Failed to load notifications'); }
    finally { setLoading(false); }
  })(); }, []);
  useEffect(()=>{
    if(!SOCKET_ENABLED) return;
    let mounted = true;
    (async ()=>{
      try {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const sock = await getSocket(baseUrl);
        sock.on('notification:new', ({ userId, item })=>{
          if(!mounted) return;
          setItems(prev => [item, ...prev]);
        });
      } catch {/* ignore */}
    })();
    return ()=>{ mounted=false; };
  }, []);

  async function markAll(){
    try { await apiMarkAllNotificationsRead(); setItems(items.map(n=>({...n, read:true }))); notify('Marked all read','success'); }
    catch { notify('Failed','error'); }
  }

  return (
    <AppLayout sidebar={<Sidebar />} topbar={<GlobalNavbar />}> 
      <div className="container">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
          <h2 style={{margin:0}}>Notifications</h2>
          {items.length>0 && <button className="btn" onClick={markAll}>Mark all read</button>}
        </div>
        <p className="small" style={{marginTop:4}}>Central notifications view (placeholder).</p>
  {loading && <Spinner />}
        {err && <p className="small" style={{color:'#b91c1c'}}>{err}</p>}
        {!loading && !err && items.length === 0 && (
          <div className="card p-3" style={{marginTop:12}}>
            <p className="small" style={{margin:0}}>No notifications yet.</p>
          </div>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:12}}>
          {items.map(n => (
            <div key={n._id} className="card p-3" style={{opacity:n.read?0.65:1}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                <div style={{fontSize:14}}>{n.message}</div>
                <span className="badge" style={{background:n.read?'#e5e7eb':'#6366f1',color:n.read?'#374151':'#fff'}}>{n.read? 'Read':'New'}</span>
              </div>
              <div className="small" style={{marginTop:6,color:'#6b7280'}}>{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
