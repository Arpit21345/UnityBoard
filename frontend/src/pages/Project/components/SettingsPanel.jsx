import React, { useEffect, useState } from 'react';
import { apiUpdateProject } from '../../../services/projects.js';
import { apiDeleteProject } from '../../../services/projects.js';
import { apiListInvites, apiCreateInvite, apiToggleInvite } from '../../../services/invites.js';
import { useToast } from '../../../components/Toast/ToastContext.jsx';

export default function SettingsPanel({ project, setProject, amPrivileged }) {
  const { notify } = useToast();
  const [invites, setInvites] = useState([]);
  const [settings, setSettings] = useState({ visibility: 'private', allowMemberInvites: false, chatSingleRoom: false });
  useEffect(() => { if (project) setSettings({ visibility: project.visibility, allowMemberInvites: project.allowMemberInvites, chatSingleRoom: !!project.chatSingleRoom }); }, [project]);
  const [archiving, setArchiving] = useState(false);
  async function archiveToggle() {
    try {
      setArchiving(true);
      const updated = await apiUpdateProject(project._id, { status: project.status === 'archived' ? 'active' : 'archived' });
      setProject(updated);
      notify(updated.status === 'archived' ? 'Project archived' : 'Project restored', 'success');
    } catch { notify('Action failed','error'); } finally { setArchiving(false); }
  }

  async function loadInvites() { if (!amPrivileged) return; try { const list = await apiListInvites(project._id); setInvites(list); notify('Invites loaded','success'); } catch { notify('Load invites failed','error'); } }
  async function saveSettings(e) { e.preventDefault(); try { const updated = await apiUpdateProject(project._id, settings); setProject(updated); notify('Settings saved','success'); } catch { notify('Save failed','error'); } }
  async function makeInvite() { try { const inv = await apiCreateInvite(project._id, { expiresInDays: 7 }); setInvites([inv, ...invites]); notify('Invite created','success'); } catch { notify('Create invite failed','error'); } }

  if (!amPrivileged) return <p className="small">Only owners/admins can manage settings.</p>;
  return (
    <section>
      <h3>Project Settings</h3>
      <form onSubmit={saveSettings} className="task-form">
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
        <label style={{ display:'flex', gap:6, alignItems:'center' }}>
          <input type="checkbox" checked={settings.chatSingleRoom} onChange={e=>setSettings({...settings, chatSingleRoom:e.target.checked})} />
          Single-room discussion (no multiple threads)
        </label>
        <div style={{ marginTop:8 }}>
          <button type="button" onClick={archiveToggle} disabled={archiving}>
            {project?.status === 'archived' ? 'Restore Project' : 'Archive Project'}
          </button>
        </div>
        <button type="submit">Save</button>
      </form>
      <div className="card p-3" style={{ marginTop:12 }}>
        <h4>Danger zone</h4>
        <button className="btn" onClick={async()=>{ if (!confirm('Delete this project? This cannot be undone.')) return; try { await apiDeleteProject(project._id); window.location.href = '/dashboard'; } catch(e) { notify(e.message||'Delete failed','error'); } }}>Delete Project</button>
      </div>
      <div style={{ marginTop:12 }}>
        <h4>Invites</h4>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={makeInvite}>Generate Invite</button>
          <button onClick={loadInvites}>Refresh</button>
        </div>
        <ul className="list">
          {invites.map(inv => (
            <li key={inv._id} style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <span>Code: <code>{inv.code}</code></span>
              <button onClick={async()=>{ try{ await navigator.clipboard.writeText(inv.code); notify('Code copied', 'success'); } catch(_) { notify('Copy failed','error'); } }}>Copy code</button>
              <a href={`${window.location.origin}/invite/${inv.token}`} target="_blank" rel="noreferrer">Link</a>
              <button onClick={async()=>{ try{ await navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`); notify('Link copied', 'success'); } catch(_) { notify('Copy failed','error'); } }}>Copy link</button>
              <span>Uses: {inv.usedCount}{inv.usageLimit?`/${inv.usageLimit}`:''}</span>
              <button onClick={async ()=>{ try { const toggled = await apiToggleInvite(inv._id, !inv.enabled); setInvites(invites.map(i=>i._id===inv._id? toggled : i)); notify(toggled.enabled? 'Invite enabled' : 'Invite disabled', 'success'); } catch(_) { notify('Toggle failed','error'); } }}>
                {inv.enabled ? 'Disable' : 'Enable'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
