import React, { useState } from 'react';
import './Register.css';
import { apiRegister } from '../../services/auth.js';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setMsg('');
    try {
      await apiRegister(form);
      const redirect = localStorage.getItem('postLoginRedirect');
      if(redirect){
        localStorage.removeItem('postLoginRedirect');
        window.location.href = redirect;
      } else {
        window.location.href = '/dashboard';
      }
    } catch (e) {
      setMsg(e.message || 'Registration failed');
    }
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Create account</h2>
        <label>Name<input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /></label>
        <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} /></label>
        <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} /></label>
        {msg && <div className="error">{msg}</div>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
