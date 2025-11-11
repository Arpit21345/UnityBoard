import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiListNotifications } from '../../services/notifications.js';
import { SOCKET_ENABLED } from '../../services/api.js';
import { getSocket } from '../../services/socket.js';
import { useUser } from '../../context/UserContext.jsx';
import Avatar from '../ui/Avatar.jsx';

// Simplified global navbar (no search). Brand + controls cluster.
export default function GlobalNavbar({ compact=false }) {
  const { user: me, refreshUser } = useUser();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [contextProject, setContextProject] = useState(null); // { name, visibility, role }
  // Theme toggle restored (light default)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const navRef = useRef(null);
  const navigate = useNavigate();



  // Lightweight retry if token exists but user not yet loaded (network race)
  useEffect(()=>{
    if(me) return; // already have user
    const token = localStorage.getItem('token');
    if(!token) return; // no auth context
    let attempts = 0;
    const id = setInterval(()=>{
      attempts += 1;
      if(me || attempts>2){ clearInterval(id); return; }
      refreshUser();
    }, 500);
    return ()=>clearInterval(id);
  }, [me, refreshUser]);
  // Load initial unread count and request notification permission
  useEffect(() => { 
    if(!me) return; 
    (async ()=>{ 
      try { 
        const data = await apiListNotifications(); 
        const count = data.filter(n=>!n.read).length; 
        setUnread(count); 
        
        // Request notification permission if not already granted
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      } catch {} 
    })(); 
  }, [me]);

  // Socket listener for real-time notifications
  useEffect(()=>{
    if(!SOCKET_ENABLED || !me) return;
    
    let active = true;
    let socket = null;
    
    const setupSocket = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        socket = await getSocket(baseUrl);
        
        const handler = (payload)=>{ 
          if(!active) return; 
          const myId = me?.id || me?._id;
          console.log('Socket notification received:', payload, 'My ID:', myId);
          
          if(payload?.userId && myId && String(payload.userId) === String(myId)) { 
            setUnread(c => {
              console.log('Incrementing unread count from', c, 'to', c + 1);
              return c + 1;
            });
            
            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('UnityBoard', {
                body: payload.item?.message || 'New notification',
                icon: '/favicon.ico'
              });
            }
          } 
        };
        
        // Remove any existing listeners first
        socket.off('notification:new');
        socket.on('notification:new', handler);
        
        console.log('Socket connected for notifications');
        
        return () => {
          if (socket) {
            socket.off('notification:new', handler);
          }
        };
      } catch (error) {
        console.error('Failed to setup socket:', error);
      }
    };
    
    setupSocket();
    
    return () => { 
      active = false;
    };
  }, [me]);

  // Listen for notifications being marked as read
  useEffect(() => {
    const handleNotificationsRead = () => {
      setUnread(0);
    };
    
    const handleNotificationsChanged = (e) => {
      if (e.detail?.unreadCount !== undefined) {
        setUnread(e.detail.unreadCount);
      }
    };
    
    window.addEventListener('notifications-all-read', handleNotificationsRead);
    window.addEventListener('notifications-changed', handleNotificationsChanged);
    
    return () => {
      window.removeEventListener('notifications-all-read', handleNotificationsRead);
      window.removeEventListener('notifications-changed', handleNotificationsChanged);
    };
  }, []);
  useEffect(()=>{
    function onUserUpdated(e){ const u = e.detail?.user; if(u) refreshUser(); }
    function onProjectContext(e){ const p = e.detail?.project; if(p) setContextProject({ name:p.name, visibility:p.visibility, role:p._myRole || p.role }); }
    window.addEventListener('user-updated', onUserUpdated);
    window.addEventListener('project-context', onProjectContext);
    return ()=>{ window.removeEventListener('user-updated', onUserUpdated); window.removeEventListener('project-context', onProjectContext); };
  }, []);
  // Apply theme dataset so CSS selectors remain consistent
  useEffect(()=>{ document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => {
    function outside(e){ if(open && navRef.current && !navRef.current.contains(e.target)) setOpen(false); }
    window.addEventListener('click', outside); return ()=>window.removeEventListener('click', outside);
  }, [open]);

  function handleLogout(){ localStorage.removeItem('token'); navigate('/'); }
  const toggleTheme = useCallback(()=>{ setTheme(t=> t==='light' ? 'dark' : 'light'); }, []);

  const tokenPresent = typeof window !== 'undefined' ? !!localStorage.getItem('token') : false;
  const isAuthed = tokenPresent && !!me; // only show authed controls when both token and user loaded

  return (
    <nav className={"global-navbar" + (compact? ' compact':'' )} ref={navRef}>
      <div className="gn-left">
        <Link to="/" className="brand" aria-label="UnityBoard home">
          <img src="/logo.png" alt="UnityBoard logo" className="brand-logo" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
          <span>UnityBoard</span>
        </Link>
      </div>
      <div className="gn-right" style={{gap:12}}>
        {/* Day/Night toggle (2nd element after brand cluster) */}
        <button className="icon-btn" aria-label="Toggle theme" onClick={toggleTheme} style={{fontSize:14}}>{theme==='light'?'🌞':'🌙'}</button>
        {!isAuthed && (
          <>
            {/* 3rd: Sign in, 4th: Get started */}
            <Link to="/login" className="nav-auth-link">Sign in</Link>
            <Link to="/register" className="nav-auth-btn">Get started</Link>
          </>
        )}
        {isAuthed && (
          <>
            <Link 
              to="/notifications" 
              className={`icon-btn notifications-btn ${unread > 0 ? 'has-unread' : ''}`} 
              title={unread > 0 ? `${unread} unread notifications` : 'Notifications'} 
              aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
            >
              🔔
              {unread > 0 && <span className="unread-count">{unread > 99 ? '99+' : unread}</span>}
            </Link>
            <div className="gn-profile">
              <button className="gn-avatar-btn" aria-label="User menu" onClick={()=>setOpen(o=>!o)}>
                <Avatar user={me} size="medium" />
              </button>
              {open && (
                <div className="gn-menu">
                  <div className="gn-user-block">
                    <div className="gn-user-name">{me?.name||'User'}</div>
                    <div className="gn-user-email">{me?.email||''}</div>
                    {contextProject && (
                      <div className="gn-project-context" title="Current project context">
                        <span className="gn-proj-name">{contextProject.name}</span>
                        <span className={`gn-proj-vis vis-${contextProject.visibility}`}>{contextProject.visibility}</span>
                        {contextProject.role && <span className={`gn-proj-role role-${contextProject.role}`}>{contextProject.role}</span>}
                      </div>
                    )}
                  </div>
                  <Link to="/dashboard" onClick={()=>setOpen(false)}>Home Dashboard</Link>
                  <Link to="/profile" onClick={()=>setOpen(false)}>Profile</Link>
                  <Link to="/notifications" onClick={()=>setOpen(false)}>Notifications</Link>
                  <Link to="/settings" onClick={()=>setOpen(false)}>Settings</Link>
                  <button className="link-btn" onClick={()=>{ setOpen(false); handleLogout(); }}>Logout</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
