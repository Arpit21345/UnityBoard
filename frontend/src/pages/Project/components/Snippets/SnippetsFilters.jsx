import React from 'react';

export default function SnippetsFilters({ query, lang, langs = [], tagsAll, tagsSelected, sortKey, sortDir, hasActiveFilters, onQueryChange, onLangChange, onToggleTag, onSortKeyChange, onSortDirToggle, onClearFilters, autoFocus }){
  return (
    <div className="snippets-toolbar">
      <input placeholder="Search snippets..." value={query} onChange={e=>onQueryChange(e.target.value)} autoFocus={!!autoFocus} />
      <select value={lang} onChange={e=>onLangChange(e.target.value)}>
        <option value="all">All languages</option>
        {langs.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <div className="snippets-tags">
        {tagsAll.map((t, i) => (
          <button 
            key={t} 
            className={`tag ${tagsSelected.includes(t)?'tag-active':'tag-auto-'+(1 + (i % 8))}`} 
            onClick={()=> onToggleTag(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="snippets-sort">
        <label className="small">Sort</label>
        <select value={sortKey} onChange={e=>onSortKeyChange(e.target.value)}>
          <option value="updatedAt">Updated</option>
          <option value="title">Title</option>
          <option value="language">Language</option>
        </select>
        <button className="btn" onClick={onSortDirToggle}>{sortDir==='asc'?'Asc':'Desc'}</button>
        {hasActiveFilters && <button className="btn btn-ghost" onClick={onClearFilters}>Clear</button>}
      </div>
    </div>
  );
}
