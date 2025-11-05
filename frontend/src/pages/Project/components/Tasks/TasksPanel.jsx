import React, { useMemo, useState, useCallback } from 'react';
import Spinner from '../../../../components/ui/Spinner.jsx';
import MemberPicker from '../../../../components/Members/MemberPicker.jsx';
import { useToast } from '../../../../components/Toast/ToastContext.jsx';
import { apiUpdateTask, apiDeleteTask } from '../../../../services/projects.js';
import PriorityBadge from './PriorityBadge.jsx';
import LabelsEditor from './LabelsEditor.jsx';
import TaskComments from './TaskComments.jsx';
import TasksFilters from './TasksFilters.jsx';
import TasksBoard from './TasksBoard.jsx';
import TasksList from './TasksList.jsx';
import './Tasks.css';

export default function TasksPanel({ projectId, me, members, tasks, setTasks, tasksLoading, onOpenTaskModal }) {
  const { notify } = useToast();
  const [taskView, setTaskView] = useState(()=>{
    try { const v = localStorage.getItem(`proj:${projectId}:tasks:view`); return (v==='list'||v==='board')? v : 'board'; } catch { return 'board'; }
  });
  const [statusFilter, setStatusFilter] = useState(()=>{ try { return localStorage.getItem(`proj:${projectId}:tasks:status`) || 'all'; } catch { return 'all'; }});
  const [assigneeFilter, setAssigneeFilter] = useState(()=>{ try { return localStorage.getItem(`proj:${projectId}:tasks:assignee`) || ''; } catch { return ''; }});
  const [priorityFilter, setPriorityFilter] = useState(()=>{ try { return localStorage.getItem(`proj:${projectId}:tasks:priority`) || 'all'; } catch { return 'all'; }});
  const [labelFilter, setLabelFilter] = useState(()=>{ try { return localStorage.getItem(`proj:${projectId}:tasks:label`) || 'all'; } catch { return 'all'; }});
  const [taskQuery, setTaskQuery] = useState(()=>{ try { return localStorage.getItem(`proj:${projectId}:tasks:q`) || ''; } catch { return ''; }});

  // persist
  function persist(name, value) { try { localStorage.setItem(`proj:${projectId}:tasks:${name}`, value); } catch {} }

  const filteredTasks = useMemo(() => {
    const q = taskQuery.trim().toLowerCase();
    return (tasks||[]).filter(t => {
      const byStatus = statusFilter === 'all' ? true : t.status === statusFilter;
      const byAssignee = assigneeFilter ? (Array.isArray(t.assignees) && t.assignees.includes(assigneeFilter)) : true;
      const p = (t.priority || 'medium');
      const byPriority = priorityFilter === 'all' ? true : p === priorityFilter;
      const byQuery = q ? ((t.title||'').toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q)) : true;
      const labels = Array.isArray(t.labels) ? t.labels : [];
      const byLabel = labelFilter === 'all' ? true : labels.includes(labelFilter);
      return byStatus && byAssignee && byPriority && byQuery && byLabel;
    });
  }, [tasks, statusFilter, assigneeFilter, priorityFilter, taskQuery, labelFilter]);

  const [editingTaskId, setEditingTaskId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  function startRenameTask(t) { setEditingTaskId(t._id); setEditTitle(t.title || ''); }
  function cancelRename() { setEditingTaskId(''); setEditTitle(''); }
  async function saveRename(taskId) {
    const next = (editTitle || '').trim();
    if (!next) { notify('Title required', 'error'); return; }
    try { const updated = await apiUpdateTask(taskId, { title: next }); setTasks(tasks.map(x=>x._id===taskId? updated : x)); notify('Task renamed','success'); cancelRename(); }
    catch { notify('Rename failed','error'); }
  }

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const toggleSelect = (taskId)=> setSelectedTaskIds(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  const clearSelection = ()=> setSelectedTaskIds([]);
  const selectAllFiltered = ()=> setSelectedTaskIds(filteredTasks.map(t=>t._id));
  async function bulkUpdateStatus(status) {
    if (!selectedTaskIds.length) return;
    try {
      const updates = await Promise.all(selectedTaskIds.map(id => apiUpdateTask(id, { status }).catch(() => null)));
      const updatedMap = new Map(updates.filter(Boolean).map(t => [t._id, t]));
      setTasks(tasks.map(t => updatedMap.get(t._id) || t));
      notify(`Updated ${updatedMap.size} task(s)`, 'success');
    } catch { notify('Bulk update failed','error'); }
    finally { clearSelection(); }
  }

  const onDragStart = useCallback((e, taskId) => { e.dataTransfer.setData('text/plain', taskId); }, []);
  const onDropTo = useCallback(async (e, status) => { e.preventDefault(); const taskId = e.dataTransfer.getData('text/plain'); if (!taskId) return; try { const updated = await apiUpdateTask(taskId, { status }); setTasks(tasks.map(t=>t._id===taskId? updated : t)); } catch { notify('Update status failed','error'); } }, [setTasks]);

  const labels = useMemo(() => Array.from(new Set((tasks||[]).flatMap(t => Array.isArray(t.labels) ? t.labels : []))), [tasks]);

  return (
    <section className={`tasks-panel`}>
      <TasksFilters
        projectId={projectId}
        taskView={taskView} setTaskView={(v)=>{ setTaskView(v); persist('view', v); }}
        statusFilter={statusFilter} setStatusFilter={(v)=>{ setStatusFilter(v); persist('status', v); }}
        assigneeFilter={assigneeFilter} setAssigneeFilter={(v)=>{ setAssigneeFilter(v||''); persist('assignee', v||''); }}
        priorityFilter={priorityFilter} setPriorityFilter={(v)=>{ setPriorityFilter(v); persist('priority', v); }}
        labelFilter={labelFilter} setLabelFilter={(v)=>{ setLabelFilter(v); persist('label', v); }}
        taskQuery={taskQuery} setTaskQuery={(v)=>{ setTaskQuery(v); persist('q', v); }}
        labels={labels}
        onClear={()=>{ setStatusFilter('all'); setAssigneeFilter(''); setPriorityFilter('all'); setTaskQuery(''); setLabelFilter('all'); persist('status','all'); persist('assignee',''); persist('priority','all'); persist('q',''); persist('label','all'); }}
        onNewTask={()=> onOpenTaskModal(null)}
      />

  {tasksLoading ? (<Spinner size={22} />) : (taskView === 'list' ? (
        <TasksList
          projectId={projectId}
          items={filteredTasks}
          me={me}
          members={members}
          selectedTaskIds={selectedTaskIds}
          toggleSelect={toggleSelect}
          clearSelection={clearSelection}
          selectAllFiltered={selectAllFiltered}
          onBulkUpdateStatus={bulkUpdateStatus}
          editingTaskId={editingTaskId}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          onStartRename={startRenameTask}
          onSaveRename={saveRename}
          onCancelRename={cancelRename}
          onUpdateTask={async (id, patch)=>{
            if (patch.__delete) { if(!confirm('Delete task?')) return; try{ await apiDeleteTask(id); setTasks(tasks.filter(x=>x._id!==id)); notify('Task deleted','success'); } catch(_) { notify('Delete failed','error'); } return; }
            try { const updated = await apiUpdateTask(id, patch); setTasks(tasks.map(x=>x._id===id? updated : x)); }
            catch { notify('Update failed','error'); }
          }}
          onOpenTaskModal={onOpenTaskModal}
        />
      ) : (
        <TasksBoard
          items={filteredTasks}
          me={me}
          members={members}
          onDragStart={onDragStart}
          onDropTo={onDropTo}
          onStartRename={startRenameTask}
          editingTaskId={editingTaskId}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          onSaveRename={saveRename}
          onCancelRename={cancelRename}
          onUpdateTask={async (id, patch)=>{
            if (patch.__delete) { if(!confirm('Delete task?')) return; try{ await apiDeleteTask(id); setTasks(tasks.filter(x=>x._id!==id)); notify('Task deleted','success'); } catch(_) { notify('Delete failed','error'); } return; }
            try { const updated = await apiUpdateTask(id, patch); setTasks(tasks.map(x=>x._id===id? updated : x)); }
            catch { notify('Update failed','error'); }
          }}
          onOpenTaskModal={onOpenTaskModal}
        />
      ))}
    </section>
  );
}
