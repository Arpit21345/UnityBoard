import React, { useEffect, useState, useRef } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Topbar from '../../components/layout/Topbar.jsx';
import { apiGetMyProfile, apiUpdateMyProfile, apiChangePassword } from '../../services/users.js';
import { useToast } from '../../components/Toast/ToastContext.jsx';

export default function Profile() {
  const { notify } = useToast();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', avatar: '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const nameRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await apiGetMyProfile();
        setUser(u);
        setForm({ name: u.name || '', avatar: u.avatar || '' });
        setTimeout(()=>nameRef.current?.focus(), 0);
      } catch {
        notify('Failed to load profile', 'error');
      }
    })();
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const u = await apiUpdateMyProfile(form);
      setUser(u);
      notify('Profile updated', 'success');
    } catch (e) {
      notify(e.message || 'Update failed', 'error');
    }
  }

  async function changePwd(e) {
    e.preventDefault();
    if (!pwd.currentPassword || !pwd.newPassword) return;
    try {
      await apiChangePassword(pwd);
      setPwd({ currentPassword: '', newPassword: '' });
      notify('Password updated', 'success');
    } catch (e) {
      notify(e.message || 'Password change failed', 'error');
    }
  }

  return (
    <AppLayout sidebar={<Sidebar />} topbar={<Topbar />}>
      <div className="container">
        <h1>My Profile</h1>
        {!user ? <p>Loading…</p> : (
          <div className="grid cols-2 mt-4">
            <form className="card p-4" onSubmit={saveProfile}>
              <h3>Profile</h3>
              <label>Name
                <input ref={nameRef} className="input" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
              </label>
              <label>Avatar URL
                <input className="input" placeholder="https://…" value={form.avatar} onChange={e=>setForm({...form, avatar: e.target.value})} />
              </label>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                {form.avatar && <img src={form.avatar} alt="avatar" style={{ width:40, height:40, borderRadius:8, objectFit:'cover' }} onError={e=>{ e.currentTarget.style.display='none'; }} />}
                <button className="btn dark" type="submit">Save</button>
              </div>
            </form>

            <form className="card p-4" onSubmit={changePwd}>
              <h3>Change Password</h3>
              <input className="input" type="password" placeholder="Current password" value={pwd.currentPassword} onChange={e=>setPwd({...pwd, currentPassword:e.target.value})} />
              <input className="input" type="password" placeholder="New password" value={pwd.newPassword} onChange={e=>setPwd({...pwd, newPassword:e.target.value})} />
              <button className="btn" type="submit">Update Password</button>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
