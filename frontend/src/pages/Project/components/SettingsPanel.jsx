import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUpdateProject, apiListProjectMembers, apiUpdateMemberRole, apiRemoveMember, apiDeleteProject, apiLeaveProject } from '../../../services/projects.js';
import { apiListInvites, apiCreateInvite, apiToggleInvite } from '../../../services/invites.js';
import { useToast } from '../../../components/Toast/ToastContext.jsx';

// amPrivileged previously meant owner OR admin for some actions.
// Now: owner = full edit, admin = read-only (can still generate invites per policy), member limited to invite creation when allowMemberInvites.
export default function SettingsPanel({ project, setProject, amPrivileged, amOwner, myRole }) {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [invites, setInvites] = useState([]);
  const [settings, setSettings] = useState({ name:'', description:'', visibility: 'private', allowMemberInvites: false, projectPassword: '' });
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  useEffect(() => { 
    if (project) setSettings({ 
      name: project.name || '', 
      description: project.description || '', 
      visibility: project.visibility, 
      allowMemberInvites: project.allowMemberInvites,
      projectPassword: project.projectPassword || ''
    }); 
  }, [project]);

  async function loadInvites() { if (!(amOwner || myRole==='admin')) return; try { const list = await apiListInvites(project._id); setInvites(list); notify('Invites loaded','success'); } catch { notify('Load invites failed','error'); } }
  async function saveSettings(e) { e.preventDefault(); if (!amOwner) { notify('Owner role required','error'); return; } try { const updated = await apiUpdateProject(project._id, settings); setProject(updated); notify('Settings saved','success'); } catch { notify('Save failed','error'); } }
  async function makeInvite() { if(!(amOwner || myRole==='admin' || (myRole==='member' && project.allowMemberInvites))){ notify('Insufficient permissions','error'); return; } try { const inv = await apiCreateInvite(project._id, { expiresInDays: 7 }); setInvites([inv, ...invites]); notify('Invite created','success'); } catch { notify('Create invite failed','error'); } }
  async function loadMembers() { try { setLoadingMembers(true); const list = await apiListProjectMembers(project._id); setMembers(list); } catch { notify('Load members failed','error'); } finally { setLoadingMembers(false); } }
  useEffect(() => { if (amOwner && project?._id) loadMembers(); }, [amOwner, project?._id]);

  const canSeeSettings = amOwner || myRole==='admin';
  if (!canSeeSettings) return (
    <div className="card p-3">
      <h4 style={{marginTop:0}}>Restricted</h4>
      <p className="small">Only the project owner (and admin read-only) can view settings. You can still collaborate elsewhere.</p>
      {project?.allowMemberInvites && (
        <div style={{marginTop:12}}>
          <p className="small">Invites allowed for members. Generate one:</p>
          <button onClick={makeInvite}>Generate Invite</button>
        </div>
      )}
      {myRole !== 'owner' && (
        <div style={{marginTop:16}}>
          <button className="btn danger" onClick={async ()=>{ if(!confirm('Leave this project?')) return; try { await apiLeaveProject(project._id); notify('Left project','success'); try { window.dispatchEvent(new Event('projects-changed')); } catch {}; navigate('/dashboard'); } catch { notify('Leave failed','error'); } }}>Leave Project</button>
        </div>
      )}
    </div>
  );
  return (
    <section>
      <h3>Project Settings</h3>
      <form onSubmit={saveSettings} className="task-form">
        <label>Name
          <input value={settings.name} disabled={!amOwner} onChange={e=>setSettings({...settings, name:e.target.value})} placeholder="Project name" />
          <p className="small" style={{ marginTop: '4px', color: '#6b7280' }}>
            Must be unique (like GitHub repositories). Case-sensitive.
          </p>
        </label>
        <label>Description
          <input value={settings.description} disabled={!amOwner} onChange={e=>setSettings({...settings, description:e.target.value})} placeholder="Short description" />
        </label>
        <label>Visibility
          <select value={settings.visibility} disabled={!amOwner} onChange={e=>setSettings({...settings, visibility:e.target.value})}>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </label>
        {settings.visibility === 'private' && (
          <label>Project Password
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={settings.projectPassword} 
                disabled={!amOwner} 
                onChange={e=>setSettings({...settings, projectPassword:e.target.value})} 
                placeholder="Set password for private project access" 
                style={{ flex: 1 }}
              />
              {amOwner && (
                <button 
                  type="button" 
                  onClick={() => {
                    const randomPassword = Math.random().toString(36).substring(2, 10);
                    setSettings({...settings, projectPassword: randomPassword});
                  }}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  Generate
                </button>
              )}
              {settings.projectPassword && (
                <button 
                  type="button" 
                  onClick={async() => { 
                    try { 
                      await navigator.clipboard.writeText(settings.projectPassword); 
                      notify('Password copied!', 'success'); 
                    } catch(_) { 
                      notify('Copy failed', 'error'); 
                    } 
                  }}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  Copy
                </button>
              )}
            </div>
            <p className="small" style={{ marginTop: '4px', color: '#6b7280' }}>
              Share this password with users to allow them to join your private project
            </p>
          </label>
        )}
        <label style={{ display:'flex', gap:6, alignItems:'center' }}>
          <input type="checkbox" checked={settings.allowMemberInvites} disabled={!amOwner} onChange={e=>setSettings({...settings, allowMemberInvites:e.target.checked})} />
          Allow members to invite
        </label>
        {amOwner && <button type="submit">Save</button>}
        {!amOwner && <p className="small" style={{marginTop:4}}>Read-only (admin)</p>}
      </form>

      {/* Simple Password Sharing for Private Projects */}
      {settings.visibility === 'private' && settings.projectPassword && (
        <div className="card p-3" style={{ marginTop:16 }}>
          <h4 style={{ marginTop:0 }}>� Private Project Access</h4>
          <p className="small">Share these details with users to join your private project:</p>
          <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Project Name:</strong> <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '3px' }}>{project?.name}</code>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Password:</strong> <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '3px' }}>{settings.projectPassword}</code>
            </div>
            <button 
              onClick={async() => { 
                try { 
                  await navigator.clipboard.writeText(`Project: ${project?.name}\nPassword: ${settings.projectPassword}`); 
                  notify('Project details copied!', 'success'); 
                } catch(_) { 
                  notify('Copy failed', 'error'); 
                } 
              }}
              className="btn btn-sm"
              style={{ marginTop: '8px' }}
            >
              📋 Copy Details
            </button>
          </div>
        </div>
      )}

  {/* Members management - owners only */}
      <div className="card p-3" style={{ marginTop:16 }}>
        <h4 style={{ marginTop:0 }}>Members</h4>
    {!amOwner && <p className="small">Only the project owner can change roles or remove members.</p>}
        {loadingMembers ? <p className="small">Loading members…</p> : (
          <ul className="list">
            {members.map(m => (
              <li key={m.user} style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <img src={m.avatar || ''} alt="" width={24} height={24} style={{ borderRadius:12, background:'#eee' }} onError={(e)=>{ e.currentTarget.style.visibility='hidden'; }} />
                <span>{m.name || m.email || m.user}</span>
                <span className={`badge badge-${m.role==='owner'?'high':m.role==='admin'?'medium':'low'}`}>{m.role}</span>
        {amOwner && m.role !== 'owner' && (
                  <>
                    <label className="small">Role</label>
                    <select value={m.role} onChange={async (e)=>{ try { const updated = await apiUpdateMemberRole(project._id, m.user, e.target.value); setMembers(updated); notify('Role updated','success'); } catch { notify('Role update failed','error'); } }}>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="link danger" onClick={async ()=>{ if (!confirm('Remove this member?')) return; try { await apiRemoveMember(project._id, m.user); setMembers(members.filter(x => x.user !== m.user)); notify('Member removed','success'); } catch { notify('Remove failed','error'); } }}>Remove</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginTop:12 }}>
        <h4>Invites</h4>
        <div style={{ display:'flex', gap:8 }}>
      <button onClick={makeInvite} disabled={!(amOwner || myRole==='admin' || (myRole==='member' && project.allowMemberInvites))} title={amOwner?'' :'Invite permissions depend on role & project policy'}>Generate Invite</button>
      <button onClick={loadInvites} disabled={!(amOwner || myRole==='admin')}>Refresh</button>
        </div>
        <ul className="list">
          {invites.map(inv => (
            <li key={inv._id} style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <span>Code: <code>{inv.code}</code></span>
              <button onClick={async()=>{ try{ await navigator.clipboard.writeText(inv.code); notify('Code copied', 'success'); } catch(_) { notify('Copy failed','error'); } }}>Copy code</button>
              <a href={`${window.location.origin}/invite/${inv.token}`} target="_blank" rel="noreferrer">Link</a>
              <button onClick={async()=>{ try{ await navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`); notify('Link copied', 'success'); } catch(_) { notify('Copy failed','error'); } }}>Copy link</button>
              <span>Uses: {inv.usedCount}{inv.usageLimit?`/${inv.usageLimit}`:''}</span>
      {(amOwner || myRole==='admin') && (
        <button disabled={!(amOwner || myRole==='admin')} onClick={async ()=>{ try { const toggled = await apiToggleInvite(inv._id, !inv.enabled); setInvites(invites.map(i=>i._id===inv._id? toggled : i)); notify(toggled.enabled? 'Invite enabled' : 'Invite disabled', 'success'); } catch(_) { notify('Toggle failed','error'); } }}>
          {inv.enabled ? 'Disable' : 'Enable'}
        </button>
      )}
            </li>
          ))}
        </ul>
      </div>
      {/* Danger zone - owner only */}
      <div className="card p-3" style={{ marginTop:16 }}>
        <h4 style={{ marginTop:0 }}>Danger Zone</h4>
        <p className="small">Deleting a project permanently removes tasks, resources, snippets, solutions, discussions, and invites. This action cannot be undone.</p>
        <button className="btn btn-danger" disabled={!amOwner} title={amOwner?'' :'Only owners can delete projects'} onClick={async ()=>{
          if (!amOwner) { notify('Owner role required','error'); return; }
          if (!confirm('Delete this project and all its data? This cannot be undone.')) return;
          try { await apiDeleteProject(project._id); notify('Project deleted','success'); try { window.dispatchEvent(new Event('projects-changed')); } catch {}; navigate('/dashboard'); }
          catch { notify('Delete failed','error'); }
        }}>Delete Project</button>
        {!amOwner && (
          <div style={{marginTop:12}}>
            <button className="btn" onClick={async ()=>{ if(!confirm('Leave this project?')) return; try { await apiLeaveProject(project._id); notify('Left project','success'); try { window.dispatchEvent(new Event('projects-changed')); } catch {}; navigate('/dashboard'); } catch { notify('Leave failed','error'); } }}>Leave Project</button>
          </div>
        )}
      </div>
    </section>
  );
}
