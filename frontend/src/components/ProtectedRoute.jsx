import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Central guard. If token missing OR flagged invalid (401 from any API), redirect.
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [valid, setValid] = useState(() => !!(typeof window !== 'undefined' && localStorage.getItem('token')));
  useEffect(() => {
    function flag(e){ if(e.detail === 'auth-expired'){ setValid(false); } }
    window.addEventListener('auth-event', flag);
    return () => window.removeEventListener('auth-event', flag);
  }, []);
  if(!valid) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
