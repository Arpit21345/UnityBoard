import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiMe } from '../../services/auth.js';
import { apiListNotifications } from '../../services/notifications.js';
import { SOCKET_ENABLED } from '../../services/api.js';
import { getSocket } from '../../services/socket.js';

// Simplified global navbar (no search). Brand + controls cluster.
export default function GlobalNavbar({ compact=false }) {
  const [me, setMe] = useState(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { (async ()=>{ try { const u = await apiMe(); setMe(u); } catch {} })(); }, []);
  useEffect(() => { (async ()=>{ try { const data = await apiListNotifications(); const count = data.filter(n=>!n.read).length; setUnread(count); } catch {} })(); }, []);
  useEffect(()=>{
    if(!SOCKET_ENABLED) return;
    let active = true;
    (async ()=>{
      try {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const sock = await getSocket(baseUrl);
        const handler = (payload)=>{ if(!active) return; if(payload?.userId && me && (payload.userId===me._id || payload.userId===me.id)) { setUnread(c=>c+1); } };
        sock.on('notification:new', handler);
      } catch {/* ignore */}
    })();
    return ()=>{ active=false; };
  }, [me]);
  useEffect(()=>{
    function onUserUpdated(e){ const u = e.detail?.user; if(u) setMe(m=>({...m, ...u })); }
    window.addEventListener('user-updated', onUserUpdated);
    return ()=>window.removeEventListener('user-updated', onUserUpdated);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => {
    function outside(e){ if(open && navRef.current && !navRef.current.contains(e.target)) setOpen(false); }
    window.addEventListener('click', outside); return ()=>window.removeEventListener('click', outside);
  }, [open]);

  function handleLogout(){ localStorage.removeItem('token'); navigate('/login'); }

  return (
    <nav className={"global-navbar" + (compact? ' compact':'' )} ref={navRef}>
      <div style={{flex:1}} />
      <div className="gn-right" style={{gap:12}}>
  <button className="icon-btn" aria-label="Toggle theme" title="Toggle theme" onClick={()=>setTheme(t=>t==='light'?'dark':'light')}>{theme==='light'?'🌙':'☀️'}</button>
  <Link to="/notifications" className="icon-btn notifications-btn" title="Notifications" aria-label={unread?`${unread} unread notifications`:'Notifications'}>
          <span style={{position:'relative',display:'inline-block'}}>
            🔔
            {unread>0 && <span className="badge-dot" aria-hidden="true"></span>}
          </span>
        </Link>
        <div className="gn-profile">
          <button className="gn-avatar-btn" aria-label="User menu" onClick={()=>setOpen(o=>!o)}>
            <div className="gn-avatar" aria-label="profile avatar">{(me?.name||'?').slice(0,1).toUpperCase()}</div>
          </button>
          {open && (
            <div className="gn-menu">
              <div className="gn-user-block">
                <div className="gn-user-name">{me?.name||'User'}</div>
                <div className="gn-user-email">{me?.email||''}</div>
              </div>
              <Link to="/dashboard" onClick={()=>setOpen(false)}>Home Dashboard</Link>
              <Link to="/profile" onClick={()=>setOpen(false)}>Profile</Link>
              <Link to="/past-projects" onClick={()=>setOpen(false)}>Past Projects</Link>
              <Link to="/settings" onClick={()=>setOpen(false)}>Settings</Link>
              <Link to="/logout" onClick={()=>setOpen(false)}>Logout</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
