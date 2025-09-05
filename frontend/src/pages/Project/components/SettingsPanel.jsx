import React, { useEffect, useState } from 'react';
import { apiUpdateProject, apiListProjectMembers, apiUpdateMemberRole, apiRemoveMember, apiDeleteProject } from '../../../services/projects.js';
import { apiListInvites, apiCreateInvite, apiToggleInvite } from '../../../services/invites.js';
import { useToast } from '../../../components/Toast/ToastContext.jsx';

export default function SettingsPanel({ project, setProject, amPrivileged, amOwner }) {
  const { notify } = useToast();
  const [invites, setInvites] = useState([]);
  const [settings, setSettings] = useState({ name:'', description:'', visibility: 'private', allowMemberInvites: false });
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  useEffect(() => { if (project) setSettings({ name: project.name || '', description: project.description || '', visibility: project.visibility, allowMemberInvites: project.allowMemberInvites }); }, [project]);

  async function loadInvites() { if (!amOwner) return; try { const list = await apiListInvites(project._id); setInvites(list); notify('Invites loaded','success'); } catch { notify('Load invites failed','error'); } }
  async function saveSettings(e) { e.preventDefault(); try { const updated = await apiUpdateProject(project._id, settings); setProject(updated); notify('Settings saved','success'); } catch { notify('Save failed','error'); } }
  async function makeInvite() { try { const inv = await apiCreateInvite(project._id, { expiresInDays: 7 }); setInvites([inv, ...invites]); notify('Invite created','success'); } catch { notify('Create invite failed','error'); } }
  async function loadMembers() { try { setLoadingMembers(true); const list = await apiListProjectMembers(project._id); setMembers(list); } catch { notify('Load members failed','error'); } finally { setLoadingMembers(false); } }
  useEffect(() => { if (amOwner && project?._id) loadMembers(); }, [amOwner, project?._id]);

  if (!amOwner) return (
    <div className="card p-3">
      <h4 style={{marginTop:0}}>Oops, wrong door</h4>
      <p className="small">Project settings are only visible to the project owner.</p>
    </div>
  );
  return (
    <section>
      <h3>Project Settings</h3>
      <form onSubmit={saveSettings} className="task-form">
        <label>Name
          <input value={settings.name} onChange={e=>setSettings({...settings, name:e.target.value})} placeholder="Project name" />
        </label>
        <label>Description
          <input value={settings.description} onChange={e=>setSettings({...settings, description:e.target.value})} placeholder="Short description" />
        </label>
        <label>Visibility
          <select value={settings.visibility} onChange={e=>setSettings({...settings, visibility:e.target.value})}>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </label>
        <label style={{ display:'flex', gap:6, alignItems:'center' }}>
          <input type="checkbox" checked={settings.allowMemberInvites} onChange={e=>setSettings({...settings, allowMemberInvites:e.target.checked})} />
          Allow members to invite
        </label>
        <button type="submit">Save</button>
      </form>
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
      <button onClick={makeInvite} disabled={!amOwner} title={amOwner?'' :'Only owners can generate invites'}>Generate Invite</button>
      <button onClick={loadInvites} disabled={!amOwner}>Refresh</button>
        </div>
        <ul className="list">
          {invites.map(inv => (
            <li key={inv._id} style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <span>Code: <code>{inv.code}</code></span>
              <button onClick={async()=>{ try{ await navigator.clipboard.writeText(inv.code); notify('Code copied', 'success'); } catch(_) { notify('Copy failed','error'); } }}>Copy code</button>
              <a href={`${window.location.origin}/invite/${inv.token}`} target="_blank" rel="noreferrer">Link</a>
              <button onClick={async()=>{ try{ await navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`); notify('Link copied', 'success'); } catch(_) { notify('Copy failed','error'); } }}>Copy link</button>
              <span>Uses: {inv.usedCount}{inv.usageLimit?`/${inv.usageLimit}`:''}</span>
      <button disabled={!amOwner} onClick={async ()=>{ try { const toggled = await apiToggleInvite(inv._id, !inv.enabled); setInvites(invites.map(i=>i._id===inv._id? toggled : i)); notify(toggled.enabled? 'Invite enabled' : 'Invite disabled', 'success'); } catch(_) { notify('Toggle failed','error'); } }}>
                {inv.enabled ? 'Disable' : 'Enable'}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Danger zone - owner only */}
      <div className="card p-3" style={{ marginTop:16 }}>
        <h4 style={{ marginTop:0 }}>Danger Zone</h4>
        <p className="small">Deleting a project permanently removes tasks, resources, snippets, solutions, discussions, and invites. This action cannot be undone.</p>
        <button className="btn btn-danger" disabled={!amOwner} title={amOwner?'' :'Only owners can delete projects'} onClick={async ()=>{
          if (!amOwner) return;
          if (!confirm('Delete this project and all its data? This cannot be undone.')) return;
          try { await apiDeleteProject(project._id); notify('Project deleted','success'); window.location.href = '/dashboard'; }
          catch { notify('Delete failed','error'); }
        }}>Delete Project</button>
      </div>
    </section>
  );
}
