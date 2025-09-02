import React, { useEffect, useMemo, useState } from 'react';
import { apiListLearning, apiCreateLearning, apiUpdateLearning, apiDeleteLearning } from '../../../services/learning.js';
import { useToast } from '../../../components/Toast/ToastContext.jsx';
import LearningFilters from './Learning/LearningFilters.jsx';
import LearningList from './Learning/LearningList.jsx';
import LearningFormModal from './Learning/LearningFormModal.jsx';
import './Learning/Learning.css';

export default function LearningPanel({ projectId, me }) {
  const { notify } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(localStorage.getItem(`learn.q.${projectId}`) || '');
  const [status, setStatus] = useState(localStorage.getItem(`learn.status.${projectId}`) || 'all');
  const [tagsFilter, setTagsFilter] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`learn.tags.${projectId}`) || '[]'); } catch { return []; }
  });
  const [modal, setModal] = useState({ open:false, item:null });
  const [form, setForm] = useState({ title:'', description:'', status:'todo', dueDate:'', tagsDraft:'', materialsDraft:'' });
  const [sortKey, setSortKey] = useState(localStorage.getItem(`learn.sortKey.${projectId}`) || 'updatedAt');
  const [sortDir, setSortDir] = useState(localStorage.getItem(`learn.sortDir.${projectId}`) || 'desc');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiListLearning(projectId);
        if (res.ok) setItems(res.items || []);
        else notify('Failed to load learning items', 'error');
      } catch {
        notify('Failed to load learning items', 'error');
      } finally { setLoading(false); }
    })();
  }, [projectId]);

  useEffect(() => { localStorage.setItem(`learn.q.${projectId}`, query); }, [projectId, query]);
  useEffect(() => { localStorage.setItem(`learn.status.${projectId}`, status); }, [projectId, status]);
  useEffect(() => { localStorage.setItem(`learn.tags.${projectId}`, JSON.stringify(tagsFilter)); }, [projectId, tagsFilter]);
  useEffect(() => { localStorage.setItem(`learn.sortKey.${projectId}`, sortKey); }, [projectId, sortKey]);
  useEffect(() => { localStorage.setItem(`learn.sortDir.${projectId}`, sortDir); }, [projectId, sortDir]);

  const allTags = useMemo(() => Array.from(new Set(items.flatMap(i => i.tags || []))).slice(0, 50), [items]);
  const hasActiveFilters = useMemo(() => {
    return (query?.trim()?.length || 0) > 0 || status !== 'all' || (tagsFilter?.length || 0) > 0;
  }, [query, status, tagsFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i => {
      if (status !== 'all' && i.status !== status) return false;
      if (tagsFilter.length && !tagsFilter.every(t => (i.tags||[]).includes(t))) return false;
      if (!q) return true;
      return (
        (i.title||'').toLowerCase().includes(q) ||
        (i.description||'').toLowerCase().includes(q) ||
        (i.materials||[]).some(m => (m||'').toLowerCase().includes(q))
      );
    });
  }, [items, query, status, tagsFilter]);

  const itemsSorted = useMemo(() => {
    const arr = [...filtered];
    const key = sortKey;
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a,b) => {
      let va, vb;
      if (key === 'title') { va = (a.title||'').toLowerCase(); vb = (b.title||'').toLowerCase(); }
      else if (key === 'dueDate') { va = a.dueDate ? new Date(a.dueDate).getTime() : 0; vb = b.dueDate ? new Date(b.dueDate).getTime() : 0; }
      else { va = new Date(a.updatedAt||a.createdAt||0).getTime(); vb = new Date(b.updatedAt||b.createdAt||0).getTime(); }
      if (va < vb) return -1 * dir; if (va > vb) return 1 * dir; return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  function openNew() {
    setForm({ title:'', description:'', status:'todo', dueDate:'', tagsDraft:'', materialsDraft:'' });
    setModal({ open:true, item:null });
  }
  function openEdit(item) {
    setForm({
      title: item.title||'',
      description: item.description||'',
      status: item.status||'todo',
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0,10) : '',
      tagsDraft: (item.tags||[]).join(', '),
      materialsDraft: (item.materials||[]).join(', ')
    });
    setModal({ open:true, item });
  }
  function parseCsv(str) {
    return (str||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0, 10);
  }
  async function save(e){
    e?.preventDefault?.();
    const payload = {
      title: form.title?.trim(),
      description: form.description||'',
      status: form.status||'todo',
      dueDate: form.dueDate || undefined,
      tags: parseCsv(form.tagsDraft),
      materials: parseCsv(form.materialsDraft).map(m => {
        if (/^https?:\/\//i.test(m)) return m;
        if (/^[a-z]+:/.test(m)) return m; // other schemes
        return m.includes('.') ? `https://${m}` : m;
      })
    };
    if (!payload.title) { notify('Title is required', 'warning'); return; }
    try {
      if (modal.item) {
        const res = await apiUpdateLearning(modal.item._id, payload);
        if (res.ok) {
          setItems(items.map(i => i._id === res.item._id ? res.item : i));
          notify('Updated', 'success');
        } else notify(res.error || 'Update failed', 'error');
      } else {
        const res = await apiCreateLearning(projectId, payload);
        if (res.ok) {
          setItems([res.item, ...items]);
          notify('Created', 'success');
        } else notify(res.error || 'Create failed', 'error');
      }
      setModal({ open:false, item:null });
    } catch {
      notify(modal.item ? 'Update failed' : 'Create failed', 'error');
    }
  }
  async function del(item){
    if (!confirm('Delete this learning item?')) return;
    try {
      const res = await apiDeleteLearning(item._id);
      if (res.ok) { setItems(items.filter(i => i._id !== item._id)); notify('Deleted', 'success'); }
      else notify(res.error || 'Delete failed', 'error');
    } catch { notify('Delete failed', 'error'); }
  }

  // Bulk actions
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const clearSelection = () => setSelectedIds([]);
  const selectAllFiltered = () => setSelectedIds(itemsSorted.map(i=>i._id));
  async function bulkUpdateStatus(nextStatus){
    if (!selectedIds.length) return;
    try {
      const updates = await Promise.all(selectedIds.map(id => apiUpdateLearning(id, { status: nextStatus }).then(r => r.ok ? r.item : null).catch(() => null)));
      const map = new Map(updates.filter(Boolean).map(i => [i._id, i]));
      setItems(items.map(x => map.get(x._id) || x));
      notify(`Updated ${map.size} item(s)`, 'success');
    } catch (e) { notify(e?.message || 'Bulk update failed', 'error'); }
    finally { clearSelection(); }
  }
  // Keep selection in sync with visible/known items
  useEffect(() => {
    setSelectedIds(prev => prev.filter(id => itemsSorted.some(i => i._id === id)));
  }, [itemsSorted]);

  async function quickChangeStatus(item, nextStatus){
    if (item.status === nextStatus) return;
    try {
      const res = await apiUpdateLearning(item._id, { status: nextStatus });
      if (res.ok) {
        setItems(items.map(i => i._id === res.item._id ? res.item : i));
      } else notify(res.error || 'Update failed', 'error');
    } catch { notify('Update failed', 'error'); }
  }

  function clearAllFilters(){
    setQuery('');
    setStatus('all');
    setTagsFilter([]);
  }

  return (
    <section className="learning-section">
      <div className="section-header">
        <h3>Learning Tracker</h3>
        <div className="actions"><button className="btn btn-primary" onClick={openNew}>New</button></div>
      </div>

      <LearningFilters
        query={query}
        status={status}
        tagsAll={allTags}
        tagsSelected={tagsFilter}
        sortKey={sortKey}
        sortDir={sortDir}
        hasActiveFilters={hasActiveFilters}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        onToggleTag={(t)=> setTagsFilter(v => v.includes(t) ? v.filter(x=>x!==t) : [...v, t])}
        onSortKeyChange={setSortKey}
        onSortDirToggle={()=> setSortDir(d => d==='asc' ? 'desc' : 'asc')}
        onClearFilters={clearAllFilters}
  autoFocus
      />

      {selectedIds.length > 0 && (
        <div className="learning-bulkbar card p-2">
          <span className="small">{selectedIds.length} selected</span>
          <button className="btn" onClick={selectAllFiltered}>Select all (filtered)</button>
          <button className="btn" onClick={()=>bulkUpdateStatus('todo')}>Set Todo</button>
          <button className="btn" onClick={()=>bulkUpdateStatus('in-progress')}>Set In progress</button>
          <button className="btn" onClick={()=>bulkUpdateStatus('done')}>Set Done</button>
          <button className="btn btn-ghost" onClick={async ()=>{
            if (!confirm(`Delete ${selectedIds.length} item(s)?`)) return;
            const ids = [...selectedIds];
            try {
              await Promise.all(ids.map(id => apiDeleteLearning(id).catch(()=>null)));
              setItems(items.filter(i => !ids.includes(i._id)));
              notify('Deleted selected', 'success');
            } catch { notify('Bulk delete failed', 'error'); }
            finally { clearSelection(); }
          }}>Delete</button>
          <button className="btn" onClick={clearSelection}>Clear</button>
        </div>
      )}

      {loading ? <p>Loading…</p> : (
        itemsSorted.length === 0 ? (
          hasActiveFilters ? (
            <div className="card">
              <div className="learning-no-results p-4">
                <div className="learning-no-results-content">
                  <h4>No results found</h4>
                  <p>Try adjusting or clearing your search filters.</p>
                </div>
                <button className="btn" onClick={clearAllFilters}>Clear Filters</button>
              </div>
            </div>
          ) : (
            <div className="card learning-empty-state">
              <h4>Start Your Learning Journey</h4>
              <p>No learning items yet. Create your first item to begin tracking your learning goals and resources.</p>
              <button className="btn btn-primary" onClick={openNew}>Create First Item</button>
            </div>
          )
        ) : (
          <LearningList
            items={itemsSorted}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onEdit={openEdit}
            onDelete={del}
            onChangeStatus={quickChangeStatus}
          />
        )
      )}

      <LearningFormModal
        open={modal.open}
        item={modal.item}
        form={form}
        setForm={setForm}
        onClose={()=> setModal({ open:false, item:null })}
        onSave={save}
      />
    </section>
  );
}
