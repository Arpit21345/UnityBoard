import React, { useMemo } from 'react';

const DIFFS = ['', 'easy', 'medium', 'hard', 'expert'];
const LANGS = ['plaintext','javascript','typescript','python','java','csharp','cpp','go','rust','sql','bash','json','yaml','html','css'];

export default function SolutionsFilters({
  items,
  query, setQuery,
  difficulty, setDifficulty,
  lang, setLang,
  tagsFilter, setTagsFilter,
  onNew
}) {
  const allTags = useMemo(() => Array.from(new Set(items.flatMap(i => i.tags || []))).slice(0, 50), [items]);
  return (
    <>
      <div className="section-header">
        <h3>Solution Database</h3>
        <div className="actions"><button className="btn btn-primary" onClick={onNew}>New</button></div>
      </div>
      <div className="solutions-toolbar">
        <input placeholder="Search" value={query} onChange={e=>setQuery(e.target.value)} style={{ minWidth: 220 }} />
        <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
          {DIFFS.map(d => <option key={d} value={d}>{d ? `difficulty: ${d}` : 'any difficulty'}</option>)}
        </select>
        <select value={lang} onChange={e=>setLang(e.target.value)}>
          <option value="all">All languages</option>
          {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <div className="tags-pool">
          {allTags.map(t => (
            <button key={t} className={`chip ${tagsFilter.includes(t)?'chip-active':''}`} onClick={()=> setTagsFilter(v => v.includes(t) ? v.filter(x=>x!==t) : [...v, t])}>{t}</button>
          ))}
        </div>
      </div>
    </>
  );
}
