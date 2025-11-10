import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUpdateProject, apiListProjectMembers, apiRemoveMember, apiDeleteProject, apiLeaveProject } from '../../../../services/projects.js';
// COMMENTED OUT - Invite feature removed
// import { apiListInvites, apiCreateInvite, apiToggleInvite } from '../../../../services/invites.js';
import { useToast } from '../../../../components/Toast/ToastContext.jsx';

export default function SettingsPanel({ project, setProject, amPrivileged, amOwner, myRole }) {
  const navigate = useNavigate();
  const { notify } = useToast();
  // COMMENTED OUT - Invite feature removed
  // const [invites, setInvites] = useState([]);
  const [settings, setSettings] = useState({ name:'', description:'', visibility: 'private', allowMemberInvites: false, projectPassword: '' });
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Debug role information
  console.log('🔍 SettingsPanel Debug:', {
    project: project?.name,
    myRole,
    amOwner,
    amPrivileged,
    allMembers: project?.members,
    ownerMember: project?.members?.find(m => m.role === 'owner')
  });

  useEffect(() => { 
    if (project) setSettings({ 
      name: project.name || '', 
      description: project.description || '', 
      visibility: project.visibility, 
      allowMemberInvites: project.allowMemberInvites,
      projectPassword: project.projectPassword || ''
    }); 
  }, [project]);

  // COMMENTED OUT - Invite feature removed
  /*
  async function loadInvites() { 
    if (!(amOwner || myRole==='admin')) return; 
    try { 
      const list = await apiListInvites(project._id); 
      setInvites(list); 
      notify('Invites loaded','success'); 
    } catch { 
      notify('Load invites failed','error'); 
    } 
  }
  
  async function makeInvite() { 
    if(!(amOwner || myRole==='admin' || (myRole==='member' && project.allowMemberInvites))){ 
      notify('Insufficient permissions','error'); 
      return; 
    } 
    try { 
      const inv = await apiCreateInvite(project._id, { expiresInDays: 7 }); 
      setInvites([inv, ...invites]); 
      notify('Invite created','success'); 
    } catch { 
      notify('Create invite failed','error'); 
    } 
  }
  */

  async function saveSettings(e) { 
    e.preventDefault(); 
    if (!amOwner) { 
      notify('Owner role required','error'); 
      return; 
    } 
    try { 
      const updated = await apiUpdateProject(project._id, settings); 
      setProject(updated); 
      notify('Settings saved successfully','success'); 
    } catch { 
      notify('Failed to save settings','error'); 
    } 
  }

  async function loadMembers() { 
    try { 
      setLoadingMembers(true); 
      const list = await apiListProjectMembers(project._id); 
      setMembers(list); 
    } catch { 
      notify('Load members failed','error'); 
    } finally { 
      setLoadingMembers(false); 
    } 
  }

  useEffect(() => { 
    if (amOwner && project?._id) loadMembers(); 
  }, [amOwner, project?._id]);

  // Listen for global user updates (when users change their name in settings)
  useEffect(() => {
    const handleUserUpdate = () => {
      if (amOwner && project?._id) {
        loadMembers(); // Refresh member list to get updated names
      }
    };

    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, [amOwner, project?._id]);

  // MEMBER VIEW - Read-only info + Leave button (for non-owners)
  if (!amOwner) {
    return (
      <div className="card p-4">
        <h3 style={{marginTop:0, marginBottom: '20px'}}>📋 Project Information</h3>
        
        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Project Name</label>
          <input 
            value={project?.name || ''} 
            disabled 
            style={{width: '100%', padding: '8px 12px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px'}}
          />
        </div>

        {project?.visibility === 'private' && (
          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Project Password</label>
            <input 
              value={project?.projectPassword || ''} 
              disabled 
              style={{width: '100%', padding: '8px 12px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px'}}
            />
          </div>
        )}

        <hr style={{margin: '20px 0', border: 'none', height: '1px', background: '#e9ecef'}} />
        
        <div>
          <h4 style={{color: '#dc3545', marginBottom: '12px'}}>🚪 Leave Project</h4>
          <p style={{marginBottom: '16px', color: '#6c757d', fontSize: '14px'}}>
            You can leave this project at any time. This action cannot be undone.
          </p>
          <button 
            className="btn"
            style={{backgroundColor: '#dc3545', color: 'white', padding: '10px 20px'}}
            onClick={async ()=>{ 
              if(!confirm('Are you sure you want to leave this project? This action cannot be undone.')) return; 
              try { 
                await apiLeaveProject(project._id); 
                notify('Successfully left project','success'); 
                try { window.dispatchEvent(new Event('projects-changed')); } catch {}; 
                navigate('/dashboard'); 
              } catch { 
                notify('Failed to leave project','error'); 
              } 
            }}
          >
            Leave Project
          </button>
        </div>
      </div>
    );
  }

  // OWNER VIEW - Full management interface
  return (
    <section>
      <h3 style={{marginBottom: '24px'}}>⚙️ Project Settings</h3>
      
      {/* Project Name Section */}
      <div className="card p-4" style={{marginBottom: '20px'}}>
        <h4 style={{marginTop:0, marginBottom: '16px'}}>📋 Project Name</h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            value={settings.name} 
            onChange={e=>setSettings({...settings, name:e.target.value})} 
            placeholder="Enter project name" 
            style={{flex: 1, padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px'}}
          />
          <button 
            onClick={async () => {
              if (!settings.name.trim()) {
                notify('Project name cannot be empty', 'error');
                return;
              }
              try {
                const updated = await apiUpdateProject(project._id, { name: settings.name });
                setProject(updated);
                notify('Project name updated successfully', 'success');
              } catch (error) {
                notify('Failed to update project name', 'error');
              }
            }}
            style={{
              backgroundColor: '#28a745', 
              color: 'white', 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            💾 Save
          </button>
        </div>
      </div>

      {/* Project Password Section - Only for Private Projects */}
      {project?.visibility === 'private' && (
        <div className="card p-4" style={{marginBottom: '20px'}}>
          <h4 style={{marginTop:0, marginBottom: '16px'}}>🔒 Project Password</h4>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            <input 
              type="text" 
              value={settings.projectPassword} 
              onChange={e=>setSettings({...settings, projectPassword:e.target.value})} 
              placeholder="Set password for project access" 
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
            <button 
              type="button" 
              onClick={() => {
                const randomPassword = Math.random().toString(36).substring(2, 12);
                setSettings({...settings, projectPassword: randomPassword});
              }}
              style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Generate
            </button>
            <button 
              onClick={async () => {
                try {
                  const updated = await apiUpdateProject(project._id, { projectPassword: settings.projectPassword });
                  setProject(updated);
                  notify('Project password updated successfully', 'success');
                } catch (error) {
                  notify('Failed to update project password', 'error');
                }
              }}
              style={{
                backgroundColor: '#28a745', 
                color: 'white', 
                padding: '8px 16px', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              💾 Save
            </button>
          </div>
        </div>
      )}

      {/* Members Management */}
      <div className="card p-4" style={{marginBottom: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h4 style={{marginTop:0, marginBottom: 0}}>👥 Team Members ({members.length})</h4>
          <button 
            className="btn btn-sm" 
            onClick={loadMembers}
            disabled={loadingMembers}
          >
            {loadingMembers ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>
        
        {loadingMembers ? (
          <p>Loading members...</p>
        ) : (
          <div>
            {members.map(member => (
              <div key={member.user} style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px', 
                border: '1px solid #e9ecef', 
                borderRadius: '4px', 
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px', 
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 6px rgba(102, 126, 234, 0.3)',
                  flexShrink: 0
                }}>
                  {(member.name || member.email || '?').slice(0, 1).toUpperCase()}
                </div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: '500'}}>{member.name || member.email || member.user}</div>
                  <span className={`badge badge-${member.role==='owner'?'high':member.role==='admin'?'medium':'low'}`}>
                    {member.role}
                  </span>
                </div>
                
                {member.role !== 'owner' && (
                  <button 
                    className="btn btn-sm" 
                    style={{backgroundColor: '#dc3545', color: 'white', padding: '4px 8px', fontSize: '12px'}}
                    onClick={async ()=>{ 
                      if (!confirm(`Remove ${member.name || member.email} from this project?`)) return; 
                      try { 
                        await apiRemoveMember(project._id, member.user); 
                        setMembers(members.filter(x => x.user !== member.user)); 
                        notify('Member removed successfully','success'); 
                      } catch { 
                        notify('Failed to remove member','error'); 
                      } 
                    }}
                    title="Remove member"
                  >
                    🗑️ Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Project Section */}
      <div className="card p-4" style={{ border: '2px solid #dc3545', backgroundColor: '#fff5f5' }}>
        <h4 style={{ marginTop:0, color: '#dc3545' }}>⚠️ Delete Project</h4>
        <p style={{marginBottom: '16px', color: '#721c24'}}>
          Permanently delete this project and all its data. This action cannot be undone.
        </p>
        <button 
          style={{
            backgroundColor: '#dc3545', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'cursor'
          }}
          onClick={async ()=>{
            const projectName = project?.name || 'this project';
            if (!confirm(`⚠️ ARE YOU ABSOLUTELY SURE?\n\nYou are about to permanently delete "${projectName}" and ALL its data.\n\nThis action CANNOT be undone.`)) return;
            
            try { 
              await apiDeleteProject(project._id); 
              notify('Project deleted successfully','success'); 
              try { window.dispatchEvent(new Event('projects-changed')); } catch {}; 
              navigate('/dashboard'); 
            } catch { 
              notify('Failed to delete project','error'); 
            }
          }}
        >
          🗑️ Delete Project
        </button>
      </div>
    </section>
  );
}
