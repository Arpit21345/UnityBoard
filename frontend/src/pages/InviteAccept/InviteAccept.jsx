import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiMe } from '../../services/auth.js';
const API = import.meta.env.VITE_API_URL || '';

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  useEffect(() => {
    (async () => {
      const t = localStorage.getItem('token');
      if (!t) { navigate('/login'); return; }
      try {
        await apiMe();
        const res = await fetch(`${API}/api/invites/accept/${token}`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Join failed');
        navigate(`/project/${data.project._id}`);
      } catch (e) {
        setStatus(e.message || 'Failed to accept invite');
      }
    })();
  }, [token, navigate]);
  return <main className="container"><h1>Joining project…</h1>{status && <p style={{ color:'crimson' }}>{status}</p>}</main>;
}
