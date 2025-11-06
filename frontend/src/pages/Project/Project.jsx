import React, { useEffect, useState, useRef } from 'react';
import Spinner from '../../components/ui/Spinner.jsx';
import './Project.css';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGetProject, apiListProjectTasks, apiCreateTask, apiUpdateTask } from '../../services/projects.js';
import { apiJoinPublicProject } from '../../services/invites.js';
import { categorizeJoinError } from '../../utils/joinErrors.js';
import { apiMe } from '../../services/auth.js';
import { apiListResources } from '../../services/resources.js';
import { useAiContext } from '../../components/AiHelper/AiContext.jsx';
import AppLayout from '../../components/layout/AppLayout.jsx';
import GlobalNavbar from '../../components/layout/GlobalNavbar.jsx';
import ProjectSidebar from '../../components/layout/ProjectSidebar.jsx';
import MemberPicker from '../../components/Members/MemberPicker.jsx';
import { useToast } from '../../components/Toast/ToastContext.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import LabelsEditor from './components/Tasks/LabelsEditor.jsx';
import TaskComments from './components/Tasks/TaskComments.jsx';
import TasksPanel from './components/Tasks/TasksPanel.jsx';
import ResourcesPanel from './components/Resources/ResourcesPanel.jsx';
import SettingsPanel from './components/Settings/SettingsPanel.jsx';
import DashboardPanel from './components/Dashboard/DashboardPanel.jsx';
import LearningPanel from './components/Learning/LearningPanel.jsx';
import SnippetsPanel from './components/Snippets/SnippetsPanel.jsx';
import SolutionsPanel from './components/Solutions/SolutionsPanel.jsx';
import ChatPanel from './components/Discussion/ChatPanel.jsx';

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const { setCtx } = useAiContext();
  const [me, setMe] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const { notify } = useToast();
  const [taskModal, setTaskModal] = useState({ open:false, task:null });
  const [modalAssignee, setModalAssignee] = useState('');
  const [modalLabels, setModalLabels] = useState([]);
  const [joining, setJoining] = useState(false);
  // task filters and resources interactions are now encapsulated inside their panels

  const firstLoadRef = useRef(true);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if(!firstLoadRef.current && project && project._id === id) return; // prevent redundant
      try {
        setError(null);
        setProject(null);
        setTasksLoading(true); setResourcesLoading(true);
        const user = await apiMe(); if(cancelled) return; setMe(user);
        const p = await apiGetProject(id); if(cancelled) return; setProject(p);
        try {
          // Fix: Use consistent user ID and string comparison
          const userId = user?.id || user?._id;
          const role = p?.members?.find(m => String(m.user) === String(userId))?.role;
          window.dispatchEvent(new CustomEvent('project-context', { detail:{ project:{ name:p.name, visibility:p.visibility, _myRole: role } } }));
        } catch {/* ignore */}
        const [t, r] = await Promise.all([
          apiListProjectTasks(id).catch(() => []),
          apiListResources(id).catch(() => [])
        ]);
        if(cancelled) return;
        setTasks(t); setTasksLoading(false);
        setResources(r); setResourcesLoading(false);
      } catch (e) {
        if(cancelled) return;
        let msg = e?.message || 'Failed to load project data';
        const is403 = /403/i.test(msg) || /Forbidden/i.test(msg);
        const is404 = /404/i.test(msg) || /Not found/i.test(msg);
        if(is403){
          notify('Access denied to project','error');
          // redirect away for private / unauthorized project
          setTimeout(()=> navigate('/dashboard', { replace:true }), 50);
          return; // stop further state changes; no error card flash
        }
        if(is404) msg = 'Project not found (404).';
        setError(msg);
        setTasksLoading(false); setResourcesLoading(false);
      } finally { firstLoadRef.current = false; }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function retryLoad() {
    firstLoadRef.current = true;
    // trigger effect by resetting a dummy state or just re-running logic inline
    try {
      setError(null);
      setProject(null);
      setTasksLoading(true); setResourcesLoading(true);
      const user = await apiMe(); setMe(user);
      const p = await apiGetProject(id); setProject(p);
      try {
        // Fix: Use consistent user ID and string comparison
        const userId = user?.id || user?._id;
        const role = p?.members?.find(m => String(m.user) === String(userId))?.role;
        window.dispatchEvent(new CustomEvent('project-context', { detail:{ project:{ name:p.name, visibility:p.visibility, _myRole: role } } }));
      } catch {/* ignore */}
      const [t, r] = await Promise.all([
        apiListProjectTasks(id).catch(() => []),
        apiListResources(id).catch(() => [])
      ]);
      setTasks(t); setTasksLoading(false);
      setResources(r); setResourcesLoading(false);
    } catch (e) {
      let msg = e?.message || 'Failed to load project data';
      if(/403/i.test(msg) || /Forbidden/i.test(msg)) { notify('Access denied to project','error'); navigate('/dashboard',{replace:true}); return; }
      if(/404/i.test(msg) || /Not found/i.test(msg)) msg = 'Project not found (404).';
      setError(msg);
      setTasksLoading(false); setResourcesLoading(false);
    }
  }

  useEffect(() => {
    if (project) {
      const taskSummary = tasks.slice(0, 10).map(t => `- [${t.status}] ${t.title}`).join('\n');
      const resSummary = resources.slice(0, 10).map(r => `- (${r.provider}) ${r.title || r.name || r.url}`).join('\n');
      setCtx(`Project: ${project.name}\nDescription: ${project.description || ''}\nTasks:\n${taskSummary}\nResources:\n${resSummary}`);
    }
  }, [project, tasks, resources, setCtx]);

  async function addTask(e) {
    e.preventDefault();
    if (!newTask.title) {
      notify('Task title is required', 'error');
      return;
    }
    if (!modalAssignee) {
      notify('Task must be assigned to someone', 'error');
      return;
    }
    const payload = { ...newTask };
    if (!payload.dueDate) delete payload.dueDate;
    if (!payload.priority) payload.priority = 'medium';
    // include modal assignee and labels for both create/edit
    // console.log('Creating task with modalAssignee:', modalAssignee);
    // console.log('Project members:', project?.members);
    payload.assignees = modalAssignee ? [modalAssignee] : [];
    payload.labels = Array.isArray(modalLabels) ? modalLabels : [];
    try {
      if (taskModal.task) {
        const updated = await apiUpdateTask(taskModal.task._id, payload);
        setTasks(tasks.map(x => x._id === updated._id ? updated : x));
        notify('Task updated', 'success');
      } else {
        const t = await apiCreateTask(id, payload);
        setTasks([t, ...tasks]);
        notify('Task created', 'success');
      }
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' });
      setModalAssignee('');
      setModalLabels([]);
      setTaskModal({ open:false, task:null });
    } catch (e) {
      notify(taskModal.task ? 'Update task failed' : 'Create task failed', 'error');
    }
  }
  // Fix: Use consistent user ID (me.id, not me._id) and string comparison for all membership checks
  const userId = me?.id || me?._id;
  const amPrivileged = project && userId && project.members?.some(m => String(m.user) === String(userId) && (m.role === 'owner' || m.role === 'admin'));
  const amOwner = project && userId && project.members?.some(m => String(m.user) === String(userId) && m.role === 'owner');

  const isMember = project && userId && project.members?.some(m => String(m.user) === String(userId));
  const isPublic = project && project.visibility === 'public';

  async function handleJoinPublic(){
    if(joining) return;
    setJoining(true);
    try {
      const joined = await apiJoinPublicProject(project._id);
      notify('Joined project','success');
  try { window.dispatchEvent(new Event('projects-changed')); } catch {}
      // refetch tasks/resources for fresh membership context
      const [t, r] = await Promise.all([
        apiListProjectTasks(project._id).catch(()=>[]),
        apiListResources(project._id).catch(()=>[])
      ]);
      setTasks(t); setResources(r);
      setProject(joined);
      try {
        // Fix: Use consistent user ID and string comparison
        const userId = me?.id || me?._id;
        const role = joined?.members?.find(m => String(m.user) === String(userId))?.role;
        window.dispatchEvent(new CustomEvent('project-context', { detail:{ project:{ name:joined.name, visibility:joined.visibility, _myRole: role } } }));
      } catch {/* ignore */}
    } catch(e){
      const cat = categorizeJoinError(e?.message);
      if(cat.type === 'already-member') {
        notify(cat.message,'info');
        try { window.dispatchEvent(new Event('projects-changed')); } catch {}
        setTimeout(()=> navigate(`/project/${project._id}`), 400);
      } else if(cat.type === 'unauthorized') {
        notify('Session expired. Please login again','error');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        notify(cat.message, cat.level === 'warn' ? 'error' : cat.level);
      }
    } finally {
      setJoining(false);
    }
  }

  return (
    <AppLayout
      sidebar={<ProjectSidebar active={tab} onChange={setTab} title={project?.name} subtitle={project?.description} />}
  topbar={<GlobalNavbar />}
    >
      {!project && !error ? (
        <div style={{padding:'20px 0'}}><Spinner size={28} /></div>
      ) : error ? (
        <div className="card p-3">
          <h4 style={{marginTop:0}}>Couldn’t load project</h4>
          <p className="small" style={{marginTop:4}}>{error}</p>
          <div style={{marginTop:8}}>
            <button className="btn" onClick={retryLoad}>Retry</button>
          </div>
        </div>
      ) : (project && !isMember && isPublic) ? (
        <div className="card p-4" style={{maxWidth:560}}>
          <h2 style={{marginTop:0}}>{project.name}</h2>
          <div style={{display:'flex',gap:8,marginTop:4}}>
            <span className="vis-tag">{project.visibility}</span>
            <span className="small" style={{color:'var(--gray-600)'}}>{project.members?.length || 0} members</span>
          </div>
          <p className="small" style={{marginTop:8}}>{project.description || 'No description provided.'}</p>
          <div style={{marginTop:16,display:'flex',gap:12}}>
            <button className="btn btn-primary" disabled={joining} onClick={handleJoinPublic}>{joining? 'Joining…':'Join Project'}</button>
            <button className="btn" onClick={()=>navigate('/dashboard')}>Back</button>
          </div>
          <p className="small" style={{marginTop:16,color:'var(--gray-600)'}}>This is a public project. Joining will add it to your dashboard.</p>
        </div>
      ) : (
        <div className="container">
          {tab === 'dashboard' && <DashboardPanel project={project} tasks={tasks} />}
          {tab === 'tasks' && (
            <TasksPanel
              projectId={id}
              me={me}
              members={project?.members || []}
              tasks={tasks}
              setTasks={setTasks}
              tasksLoading={tasksLoading}
              onOpenTaskModal={(task)=>{ setTaskModal({ open:true, task }); setNewTask(task? { title:task.title||'', description:task.description||'', dueDate:task.dueDate? new Date(task.dueDate).toISOString().slice(0,10):'', priority: task.priority || 'medium' } : { title:'', description:'', dueDate:'', priority:'medium' }); setModalAssignee(task? ((task.assignees && task.assignees[0]) || '') : ''); setModalLabels(task? (Array.isArray(task.labels)? task.labels : []) : []); }}
            />
          )}
          {tab === 'resources' && (
            <ResourcesPanel
              projectId={id}
              resources={resources}
              setResources={setResources}
              resourcesLoading={resourcesLoading}
            />
          )}
          {tab === 'settings' && (
            <SettingsPanel project={project} setProject={setProject} amPrivileged={amPrivileged} amOwner={amOwner} />
          )}
          {tab === 'learning' && (
            <LearningPanel projectId={id} me={me} />
          )}
          {tab === 'snippets' && (
            <SnippetsPanel projectId={id} me={me} />
          )}
          {tab === 'solutions' && (
            <SolutionsPanel projectId={id} me={me} />
          )}
          {tab === 'discussion' && (
            <ChatPanel projectId={id} me={me} project={project} />
          )}
        </div>
      )}
      <Modal open={taskModal.open} title={taskModal.task? 'Edit Task' : 'New Task'} onClose={()=>setTaskModal({ open:false, task:null })}
        footer={<>
          <button className="btn" onClick={()=>setTaskModal({ open:false, task:null })}>Cancel</button>
          <button className="btn btn-primary" onClick={(e)=>addTask(e)}>Save</button>
        </>}
      >
        <div className="task-form task-modal">
          <div>
            <label className="small">Title</label>
            <input autoFocus placeholder="Task title" value={newTask.title} onChange={e=>setNewTask({...newTask, title:e.target.value})} />
          </div>
          <div>
            <label className="small">Description</label>
            <input placeholder="Description" value={newTask.description} onChange={e=>setNewTask({...newTask, description:e.target.value})} />
          </div>
          <div className="form-row">
            <div>
              <label className="small">Due Date</label>
              <input type="date" value={newTask.dueDate} onChange={e=>setNewTask({...newTask, dueDate:e.target.value})} />
            </div>
            <div>
              <label className="small">Priority</label>
              <select value={newTask.priority} onChange={e=>setNewTask({...newTask, priority:e.target.value})}>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
        <div className="task-form-secondary">
          <div className="task-form-row">
            <div className="assignee-section">
              <label>Assignee <span style={{ color: 'red' }}>*</span></label>
              <MemberPicker projectId={id} value={modalAssignee} onChange={setModalAssignee} placeholder="Select member (required)" />
            </div>
            <div className="labels-section">
              <label>Labels</label>
              <LabelsEditor task={{ labels: modalLabels }} onChange={setModalLabels} />
            </div>
          </div>
        </div>
        {taskModal.task && (
          <div className="card p-3" style={{ marginTop:8 }}>
            <h4 style={{ marginTop:0 }}>Comments</h4>
            <TaskComments taskId={taskModal.task._id} embedded />
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
