import React, { useEffect, useMemo, useState } from 'react';
import Spinner from '../../../components/ui/Spinner.jsx';
import { apiListSnippets, apiCreateSnippet, apiUpdateSnippet, apiDeleteSnippet } from '../../../services/snippets.js';
import { useToast } from '../../../components/Toast/ToastContext.jsx';
import SnippetsFilters from './Snippets/SnippetsFilters.jsx';
import SnippetsList from './Snippets/SnippetsList.jsx';
import SnippetsFormModal from './Snippets/SnippetsFormModal.jsx';
import './Snippets/Snippets.css';

const LANGS = ['plaintext','javascript','typescript','python','java','csharp','cpp','go','rust','sql','bash','json','yaml','html','css'];

export default function SnippetsPanel({ projectId, me }) {
  const { notify } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(localStorage.getItem(`snip.q.${projectId}`) || '');
  const [lang, setLang] = useState(localStorage.getItem(`snip.lang.${projectId}`) || 'all');
  const [tagsFilter, setTagsFilter] = useState(() => { try { return JSON.parse(localStorage.getItem(`snip.tags.${projectId}`) || '[]'); } catch { return []; } });
  const [modal, setModal] = useState({ open:false, item:null });
  const [sortKey, setSortKey] = useState(localStorage.getItem(`snip.sortKey.${projectId}`) || 'updatedAt');
  const [sortDir, setSortDir] = useState(localStorage.getItem(`snip.sortDir.${projectId}`) || 'desc');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => { (async()=>{
    try { const res = await apiListSnippets(projectId); if (res.ok) setItems(res.items||[]); else notify('Failed to load snippets','error'); }
    catch { notify('Failed to load snippets','error'); }
    finally { setLoading(false); }
  })(); }, [projectId]);

  useEffect(() => { localStorage.setItem(`snip.q.${projectId}`, query); }, [projectId, query]);
  useEffect(() => { localStorage.setItem(`snip.lang.${projectId}`, lang); }, [projectId, lang]);
  useEffect(() => { localStorage.setItem(`snip.tags.${projectId}`, JSON.stringify(tagsFilter)); }, [projectId, tagsFilter]);
  useEffect(() => { localStorage.setItem(`snip.sortKey.${projectId}`, sortKey); }, [projectId, sortKey]);
  useEffect(() => { localStorage.setItem(`snip.sortDir.${projectId}`, sortDir); }, [projectId, sortDir]);

  const allTags = useMemo(() => Array.from(new Set(items.flatMap(i => i.tags || []))).slice(0, 50), [items]);
  const hasActiveFilters = useMemo(() => {
    return (query?.trim()?.length || 0) > 0 || lang !== 'all' || (tagsFilter?.length || 0) > 0;
  }, [query, lang, tagsFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i => {
      if (lang !== 'all' && (i.language||'plaintext') !== lang) return false;
      if (tagsFilter.length && !tagsFilter.every(t => (i.tags||[]).includes(t))) return false;
      if (!q) return true;
      return (
        (i.title||'').toLowerCase().includes(q) ||
        (i.notes||'').toLowerCase().includes(q) ||
        (i.code||'').toLowerCase().includes(q)
      );
    });
  }, [items, query, lang, tagsFilter]);

  const itemsSorted = useMemo(() => {
    const arr = [...filtered];
    const key = sortKey;
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a,b) => {
      let va, vb;
      if (key === 'title') { va = (a.title||'').toLowerCase(); vb = (b.title||'').toLowerCase(); }
      else if (key === 'language') { va = (a.language||'').toLowerCase(); vb = (b.language||'').toLowerCase(); }
      else { va = new Date(a.updatedAt||a.createdAt||0).getTime(); vb = new Date(b.updatedAt||b.createdAt||0).getTime(); }
      if (va < vb) return -1 * dir; if (va > vb) return 1 * dir; return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  function openNew(){ setModal({ open:true, item:null }); }
  function openEdit(item){ setModal({ open:true, item }); }
  function parseTags(s){ return (s||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,15); }

  async function save(form){
    const payload = { title: form.title?.trim(), language: form.language||'plaintext', tags: form.tags||[], notes: form.description||form.notes||'', code: form.code||'' };
    if (!payload.title) { notify('Title is required','warning'); return; }
    try {
      if (modal.item){
        const res = await apiUpdateSnippet(modal.item._id, payload);
        if (res.ok) { setItems(items.map(i=>i._id===res.item._id?res.item:i)); notify('Updated','success'); }
        else notify(res.error||'Update failed','error');
      } else {
        const res = await apiCreateSnippet(projectId, payload);
        if (res.ok) { setItems([res.item, ...items]); notify('Created','success'); }
        else notify(res.error||'Create failed','error');
      }
      setModal({ open:false, item:null });
    } catch { notify(modal.item?'Update failed':'Create failed','error'); }
  }

  async function del(item){ if (!confirm('Delete this snippet?')) return; try { const res = await apiDeleteSnippet(item._id); if (res.ok) { setItems(items.filter(i=>i._id!==item._id)); notify('Deleted','success'); } else notify(res.error||'Delete failed','error'); } catch { notify('Delete failed','error'); } }
  async function copyCode(snippet){ try { await navigator.clipboard.writeText(snippet.code||''); notify('Copied code','success'); } catch { notify('Copy failed','error'); } }

  // selection / bulk actions
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const clearSelection = () => setSelectedIds([]);
  const selectAllFiltered = () => setSelectedIds(itemsSorted.map(i=>i._id));
  useEffect(() => { setSelectedIds(prev => prev.filter(id => itemsSorted.some(i => i._id === id))); }, [itemsSorted]);
  async function bulkDelete(){
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} snippet(s)?`)) return;
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map(id => apiDeleteSnippet(id).catch(()=>null)));
      setItems(items.filter(i => !ids.includes(i._id)));
      notify('Deleted selected','success');
    } catch { notify('Bulk delete failed','error'); }
    finally { clearSelection(); }
  }

  async function quickChangeLanguage(item, next){
    if ((item.language||'plaintext') === next) return;
    try { const res = await apiUpdateSnippet(item._id, { language: next }); if (res.ok) setItems(items.map(i=>i._id===res.item._id?res.item:i)); else notify(res.error||'Update failed','error'); }
    catch { notify('Update failed','error'); }
  }

  return (
    <section className="snippets-section">
      <div className="section-header">
        <h3>Smart Snippets</h3>
        <div className="actions"><button className="btn btn-primary" onClick={openNew}>New</button></div>
      </div>

      <SnippetsFilters
        query={query}
        lang={lang}
        langs={LANGS}
        tagsAll={allTags}
        tagsSelected={tagsFilter}
        sortKey={sortKey}
        sortDir={sortDir}
        hasActiveFilters={hasActiveFilters}
        onQueryChange={setQuery}
        onLangChange={setLang}
        onToggleTag={(t)=> setTagsFilter(v => v.includes(t) ? v.filter(x=>x!==t) : [...v, t])}
        onSortKeyChange={setSortKey}
        onSortDirToggle={()=> setSortDir(d=> d==='asc'?'desc':'asc')}
        onClearFilters={()=> { setQuery(''); setLang('all'); setTagsFilter([]); }}
        autoFocus
      />

      {selectedIds.length > 0 && (
        <div className="snippets-bulkbar">
          <span className="small">{selectedIds.length} selected</span>
          <button className="btn" onClick={selectAllFiltered}>Select all (filtered)</button>
          <button className="btn btn-danger" onClick={bulkDelete}>Delete</button>
          <button className="btn" onClick={clearSelection}>Clear</button>
        </div>
      )}

  {loading ? <Spinner size={24} /> : (
        itemsSorted.length ? (
          <SnippetsList
            items={itemsSorted}
            selection={new Set(selectedIds)}
            onToggleSelect={toggleSelect}
            onEdit={openEdit}
            onDelete={del}
            onQuickLanguage={quickChangeLanguage}
            onCopy={copyCode}
          />
        ) : (
          hasActiveFilters ? (
            <div className="card p-3">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                <div>
                  <h4 style={{ margin:'0 0 4px 0' }}>No results</h4>
                  <p className="small" style={{ margin:0 }}>Try adjusting or clearing your filters.</p>
                </div>
                <button className="btn" onClick={()=>{ setQuery(''); setLang('all'); setTagsFilter([]); }}>Clear filters</button>
              </div>
            </div>
          ) : (
            <div className="card p-4" style={{ textAlign:'center' }}>
              <p className="muted" style={{ margin:'0 0 8px 0' }}>No snippets yet.</p>
              <button className="btn btn-primary" onClick={openNew}>Create your first snippet</button>
            </div>
          )
        )
      )}

      <SnippetsFormModal
        open={modal.open}
        initial={modal.item ? { title: modal.item.title||'', description: modal.item.notes||'', language: modal.item.language||'plaintext', code: modal.item.code||'', tags: modal.item.tags||[] } : null}
        onClose={()=> setModal({ open:false, item:null })}
        onSave={save}
      />
    </section>
  );
}
