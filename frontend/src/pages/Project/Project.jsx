import React, { useEffect, useState } from 'react';
import './Project.css';
import { useParams } from 'react-router-dom';
import { apiGetProject, apiListProjectTasks, apiCreateTask, apiUpdateTask } from '../../services/projects.js';
import { apiMe } from '../../services/auth.js';
import { apiListResources } from '../../services/resources.js';
import { useAiContext } from '../../components/AiHelper/AiContext.jsx';
import AppLayout from '../../components/layout/AppLayout.jsx';
import Topbar from '../../components/layout/Topbar.jsx';
import ProjectSidebar from '../../components/layout/ProjectSidebar.jsx';
import MemberPicker from '../../components/Members/MemberPicker.jsx';
import { useToast } from '../../components/Toast/ToastContext.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import LabelsEditor from './components/LabelsEditor.jsx';
import TaskComments from './components/TaskComments.jsx';
import TasksPanel from './components/TasksPanel.jsx';
import ResourcesPanel from './components/ResourcesPanel.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import DashboardPanel from './components/DashboardPanel.jsx';

export default function Project() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
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
  // task filters and resources interactions are now encapsulated inside their panels

  useEffect(() => {
    (async () => {
      try {
        const user = await apiMe();
        setMe(user);
        const p = await apiGetProject(id);
        setProject(p);
        const [t, r] = await Promise.all([
          apiListProjectTasks(id).catch(() => []),
          apiListResources(id).catch(() => [])
        ]);
        setTasks(t); setTasksLoading(false);
        setResources(r); setResourcesLoading(false);
      } catch (e) {
        notify('Failed to load project data', 'error');
        setTasksLoading(false);
        setResourcesLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (project) {
      const taskSummary = tasks.slice(0, 10).map(t => `- [${t.status}] ${t.title}`).join('\n');
      const resSummary = resources.slice(0, 10).map(r => `- (${r.provider}) ${r.title || r.name || r.url}`).join('\n');
      setCtx(`Project: ${project.name}\nDescription: ${project.description || ''}\nTasks:\n${taskSummary}\nResources:\n${resSummary}`);
    }
  }, [project, tasks, resources, setCtx]);

  async function addTask(e) {
    e.preventDefault();
    if (!newTask.title) return;
    const payload = { ...newTask };
    if (!payload.dueDate) delete payload.dueDate;
    if (!payload.priority) payload.priority = 'medium';
    // include modal assignee and labels for both create/edit
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
  const amPrivileged = project && me && project.members?.some(m => m.user === me._id && (m.role === 'owner' || m.role === 'admin'));

  return (
    <AppLayout
      sidebar={<ProjectSidebar active={tab} onChange={setTab} title={project?.name} subtitle={project?.description} />}
      topbar={<Topbar />}
    >
      {!project ? (
        <p>Loading...</p>
      ) : (
        <div className="container">
          {tab === 'dashboard' && <DashboardPanel project={project} tasks={tasks} />}
          {tab === 'tasks' && (
            <TasksPanel
              projectId={id}
              me={me}
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
            <SettingsPanel project={project} setProject={setProject} amPrivileged={amPrivileged} />
          )}
          {/* TODO: learning, snippets, solutions, discussion tabs */}
        </div>
      )}
      <Modal open={taskModal.open} title={taskModal.task? 'Edit Task' : 'New Task'} onClose={()=>setTaskModal({ open:false, task:null })}
        footer={<>
          <button className="btn" onClick={()=>setTaskModal({ open:false, task:null })}>Cancel</button>
          <button className="btn btn-primary" onClick={(e)=>addTask(e)}>Save</button>
        </>}
      >
        <div className="task-form">
          <input autoFocus placeholder="Task title" value={newTask.title} onChange={e=>setNewTask({...newTask, title:e.target.value})} />
          <input placeholder="Description" value={newTask.description} onChange={e=>setNewTask({...newTask, description:e.target.value})} />
          <input type="date" value={newTask.dueDate} onChange={e=>setNewTask({...newTask, dueDate:e.target.value})} />
          <select value={newTask.priority} onChange={e=>setNewTask({...newTask, priority:e.target.value})}>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="card p-3" style={{ marginTop:8 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
            <div>
              <label className="small">Assignee</label>
              <MemberPicker projectId={id} value={modalAssignee} onChange={setModalAssignee} placeholder="Select member" />
            </div>
            <div style={{ flex:1 }}>
              <label className="small">Labels</label>
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
