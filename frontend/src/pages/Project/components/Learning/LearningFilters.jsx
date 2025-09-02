import React from 'react';

export default function LearningFilters({ query, status, tagsAll, tagsSelected, sortKey, sortDir, hasActiveFilters, onQueryChange, onStatusChange, onToggleTag, onSortKeyChange, onSortDirToggle, onClearFilters, autoFocus }){
  return (
    <div className="learning-toolbar">
      <input placeholder="Search learning items..." value={query} onChange={e=>onQueryChange(e.target.value)} autoFocus={!!autoFocus} />
      <select value={status} onChange={e=>onStatusChange(e.target.value)}>
        <option value="all">All Status</option>
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <div>
        {tagsAll.map(t => (
          <button key={t} className={`chip ${tagsSelected.includes(t)?'chip-active':''}`} onClick={()=> onToggleTag(t)}>{t}</button>
        ))}
      </div>
      <div>
        <label>Sort</label>
        <select value={sortKey} onChange={e=>onSortKeyChange(e.target.value)}>
          <option value="updatedAt">Recently Updated</option>
          <option value="dueDate">Due Date</option>
          <option value="title">Title</option>
        </select>
        <button className="btn" onClick={onSortDirToggle}>
          {sortDir==='asc'?'↑ Ascending':'↓ Descending'}
        </button>
        {hasActiveFilters && <button className="btn btn-ghost" onClick={onClearFilters}>Clear Filters</button>}
      </div>
    </div>
  );
}
