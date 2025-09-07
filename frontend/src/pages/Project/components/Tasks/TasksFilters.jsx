import React from 'react';
import MemberPicker from '../../../../components/Members/MemberPicker.jsx';
import LabelFilter from './LabelFilter.jsx';

export default function TasksFilters({
  projectId,
  taskView, setTaskView,
  statusFilter, setStatusFilter,
  assigneeFilter, setAssigneeFilter,
  priorityFilter, setPriorityFilter,
  labelFilter, setLabelFilter,
  taskQuery, setTaskQuery,
  labels,
  onClear,
  onNewTask,
}){
  return (
    <div className="filters-bar card tasks-filters">
      <div>
        <label className="small">View</label>
        <div style={{ display:'flex', gap:6 }}>
          <button type="button" className={taskView==='board'?'task-btn task-btn-primary':'task-btn'} onClick={()=> setTaskView('board')}>Board</button>
          <button type="button" className={taskView==='list'?'task-btn task-btn-primary':'task-btn'} onClick={()=> setTaskView('list')}>List</button>
        </div>
      </div>
      <div>
        <label className="small">Status</label>
        <select value={statusFilter} onChange={e=> setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div style={{ minWidth: 220 }}>
        <label className="small">Search</label>
        <input placeholder="Search title/description" value={taskQuery} onChange={e=> setTaskQuery(e.target.value)} />
      </div>
      <div>
        <label className="small">Assignee</label>
        <MemberPicker projectId={projectId} value={assigneeFilter} onChange={setAssigneeFilter} placeholder="All members" />
      </div>
      <div>
        <label className="small">Priority</label>
        <select value={priorityFilter} onChange={e=> setPriorityFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
  <LabelFilter value={labelFilter} onChange={setLabelFilter} labels={labels} />
      <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'end' }}>
        <button type="button" className="task-btn" onClick={onClear}>Clear Filters</button>
        <button type="button" className="task-btn task-btn-primary" onClick={onNewTask}>New Task</button>
      </div>
    </div>
  );
}
