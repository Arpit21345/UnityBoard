import React, { useState } from 'react';
import './Login.css';
import { apiLogin } from '../../services/auth.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');
    try {
      await apiLogin(form);
      window.location.href = '/dashboard';
    } catch (e) {
      setMsg(e.message || 'Login failed');
    }
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Login</h2>
        <label>
          Email
          <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        </label>
        <label>
          Password
          <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        </label>
        {msg && <div className="error">{msg}</div>}
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
