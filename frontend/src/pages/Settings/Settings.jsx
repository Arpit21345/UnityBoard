import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Sidebar from '../../components/layout/Sidebar.jsx';
import GlobalNavbar from '../../components/layout/GlobalNavbar.jsx';
import { apiMe } from '../../services/auth.js';
import { apiUpdateMe } from '../../services/users.js';
import Spinner from '../../components/ui/Spinner.jsx';
import './Settings.css';

export default function UserSettings(){
  const [me, setMe] = useState(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [err, setErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    (async () => {
      try {
        const u = await apiMe();
        setMe(u);
        setName(u?.name || '');
      } catch {
        setErr('Failed to load user data');
      }
    })();
  }, []);

  function toggleTheme() {
    setTheme(t => {
      const nxt = t === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = nxt;
      localStorage.setItem('theme', nxt);
      return nxt;
    });
    setSuccessMsg('Theme updated successfully');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  async function saveName() {
    if (!name.trim() || name === me.name) return;
    
    try {
      setSaving(true);
      setErr('');
      const u = await apiUpdateMe({ name });
      setMe(m => ({ ...m, name: u.name }));
      window.dispatchEvent(new CustomEvent('user-updated', { detail: { user: u } }));
      setSuccessMsg('Display name updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setErr(e.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErr('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErr('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setErr('New password must be at least 6 characters');
      return;
    }

    try {
      setChangingPassword(true);
      setErr('');
      
      // This API call would need to be implemented in the backend
      await apiUpdateMe({ 
        currentPassword, 
        newPassword 
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('Password changed successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setErr(e.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirmText !== 'DELETE') {
      setErr('Please type DELETE to confirm account deletion');
      return;
    }

    try {
      setErr('');
      // This would need to be implemented in the backend
      // await apiDeleteAccount();
      
      // For now, just show a message
      alert('Account deletion is not implemented yet. This would permanently delete your account.');
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    } catch (e) {
      setErr(e.message || 'Failed to delete account');
    }
  }

  return (
    <AppLayout sidebar={<Sidebar />} topbar={<GlobalNavbar />}> 
      <div className="container">
        <div className="settings-page">
          <div className="settings-header">
            <h1>Settings</h1>
            <p>Manage your account preferences and security settings</p>
          </div>

          {err && <div className="error-message">{err}</div>}
          {successMsg && <div className="success-message">{successMsg}</div>}
          
          {!me && !err && <Spinner />}
          
          {me && (
            <div className="settings-sections">
              {/* Profile Section */}
              <div className="settings-section">
                <div className="section-header">
                  <h3>Profile Information</h3>
                  <p>Update your display name and profile details</p>
                </div>
                <div className="section-content">
                  <div className="input-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={me.email} 
                      disabled 
                      className="disabled-input"
                    />
                    <span className="input-help">Email cannot be changed</span>
                  </div>
                  <div className="input-group">
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div className="section-actions">
                    <button 
                      className="btn btn-primary" 
                      disabled={saving || !name.trim() || name === me.name} 
                      onClick={saveName}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Appearance Section */}
              <div className="settings-section">
                <div className="section-header">
                  <h3>Appearance</h3>
                  <p>Customize your visual experience</p>
                </div>
                <div className="section-content">
                  <div className="theme-toggle">
                    <div className="theme-info">
                      <span className="theme-label">Theme</span>
                      <span className="theme-current">Currently: {theme === 'light' ? 'Light' : 'Dark'}</span>
                    </div>
                    <button className="btn theme-btn" onClick={toggleTheme}>
                      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="settings-section">
                <div className="section-header">
                  <h3>Security</h3>
                  <p>Manage your password and account security</p>
                </div>
                <div className="section-content">
                  <div className="input-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword} 
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="input-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="input-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="section-actions">
                    <button 
                      className="btn btn-primary" 
                      disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword} 
                      onClick={changePassword}
                    >
                      {changingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="settings-section danger-section">
                <div className="section-header">
                  <h3>Danger Zone</h3>
                  <p>Irreversible and destructive actions</p>
                </div>
                <div className="section-content">
                  {!showDeleteConfirm ? (
                    <div className="danger-action">
                      <div className="danger-info">
                        <span className="danger-title">Delete Account</span>
                        <span className="danger-description">
                          Permanently delete your account and all associated data
                        </span>
                      </div>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Account
                      </button>
                    </div>
                  ) : (
                    <div className="delete-confirm">
                      <div className="confirm-warning">
                        <strong>⚠️ This action cannot be undone!</strong>
                        <p>This will permanently delete your account, all your projects, and remove you from all shared projects.</p>
                      </div>
                      <div className="input-group">
                        <label>Type <strong>DELETE</strong> to confirm:</label>
                        <input 
                          type="text" 
                          value={deleteConfirmText} 
                          onChange={e => setDeleteConfirmText(e.target.value)}
                          placeholder="Type DELETE here"
                        />
                      </div>
                      <div className="confirm-actions">
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-danger" 
                          disabled={deleteConfirmText !== 'DELETE'} 
                          onClick={deleteAccount}
                        >
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
