import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiMe } from '../services/auth.js';

const UserContext = createContext({ user:null, loading:true, refreshUser:()=>{}, setUser:()=>{} });

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const u = await apiMe();
      setUser(u);
    } catch (error) {
      console.error('UserContext load error:', error);
      setUser(null);
      localStorage.removeItem('token'); // Clean up invalid token
      
      // For certain pages (like team chat), ensure user is redirected to login
      const currentPath = window.location.pathname;
      if (currentPath.includes('/project/') && currentPath.includes('discussion')) {
        localStorage.setItem('postLoginRedirect', currentPath);
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Listen for global auth expiry & manual user updates
  useEffect(() => {
    function onAuth(e){ if(e.detail === 'auth-expired'){ setUser(null); } }
    function onUserUpdated(e){ const u = e.detail?.user; if(u) setUser(u); }
    window.addEventListener('auth-event', onAuth);
    window.addEventListener('user-updated', onUserUpdated);
    return () => { window.removeEventListener('auth-event', onAuth); window.removeEventListener('user-updated', onUserUpdated); };
  }, []);

  const value = { user, loading, refreshUser: load, setUser };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(){ return useContext(UserContext); }
