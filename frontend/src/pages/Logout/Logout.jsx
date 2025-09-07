import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout(){
  const navigate = useNavigate();
  useEffect(()=>{
    localStorage.removeItem('token');
    const t = setTimeout(()=> navigate('/login'), 150);
    return ()=> clearTimeout(t);
  }, [navigate]);
  return (
    <div style={{padding:40,textAlign:'center'}}>
      <h3>Logging out…</h3>
    </div>
  );
}
