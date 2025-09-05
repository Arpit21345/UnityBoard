import React, { useEffect, useMemo, useState } from 'react';
import { apiListSolutions, apiCreateSolution, apiUpdateSolution, apiDeleteSolution } from '../../../../services/solutions.js';
import { useToast } from '../../../../components/Toast/ToastContext.jsx';
import SolutionsFilters from './SolutionsFilters.jsx';
import SolutionsTable from './SolutionsTable.jsx';
import SolutionsModal from './SolutionsModal.jsx';
import './Solutions.css';
import SolutionViewer from './SolutionViewer.jsx';

export default function SolutionsPanel({ projectId }) {
  const { notify } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(localStorage.getItem(`sol.q.${projectId}`) || '');
  const [difficulty, setDifficulty] = useState(localStorage.getItem(`sol.diff.${projectId}`) || '');
  const [lang, setLang] = useState(localStorage.getItem(`sol.lang.${projectId}`) || 'all');
  const [tagsFilter, setTagsFilter] = useState(() => { try { return JSON.parse(localStorage.getItem(`sol.tags.${projectId}`) || '[]'); } catch { return []; } });
  const [modal, setModal] = useState({ open:false, item:null });
  const [form, setForm] = useState({ title:'', problemUrl:'', category:'', difficulty:'', approach:'', code:'', language:'plaintext', tagsDraft:'', timeComplexity:'', spaceComplexity:'', referencesDraft:'', relatedDraft:'' });
  const [active, setActive] = useState(null);
  const [sortKey, setSortKey] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveError, setSaveError] = useState('');

  const friendlyError = (status, fallback) => {
    if (status === 0) return 'Network error. Is the API running and VITE_API_URL/proxy set?';
    if (status === 401) return 'Login expired or missing. Please sign in again.';
    if (status === 403) return 'Forbidden. You are not a member of this project.';
    if (status === 404) return 'Project not found.';
    return fallback || 'Request failed';
  };

  useEffect(() => { (async()=>{ try { const res = await apiListSolutions(projectId); if (res.ok) setItems(res.items||[]); else notify('Failed to load solutions','error'); } catch { notify('Failed to load solutions','error'); } finally { setLoading(false); } })(); }, [projectId]);

  useEffect(() => { localStorage.setItem(`sol.q.${projectId}`, query); }, [projectId, query]);
  useEffect(() => { localStorage.setItem(`sol.diff.${projectId}`, difficulty); }, [projectId, difficulty]);
  useEffect(() => { localStorage.setItem(`sol.lang.${projectId}`, lang); }, [projectId, lang]);
  useEffect(() => { localStorage.setItem(`sol.tags.${projectId}`, JSON.stringify(tagsFilter)); }, [projectId, tagsFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = items.filter(i => {
      if (difficulty && (i.difficulty||'') !== difficulty) return false;
      if (lang !== 'all' && (i.language||'plaintext') !== lang) return false;
      if (tagsFilter.length && !tagsFilter.every(t => (i.tags||[]).includes(t))) return false;
      if (!q) return true;
      return (
        (i.title||'').toLowerCase().includes(q) ||
        (i.category||'').toLowerCase().includes(q) ||
        (i.approach||'').toLowerCase().includes(q)
      );
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    const cmp = (a, b) => {
      const k = sortKey;
      if (k === 'title' || k === 'category' || k === 'difficulty' || k === 'language') {
        const av = (a[k]||'').toString().toLowerCase();
        const bv = (b[k]||'').toString().toLowerCase();
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      }
      if (k === 'updatedAt') {
        const av = new Date(a.updatedAt||0).getTime();
        const bv = new Date(b.updatedAt||0).getTime();
        return (av - bv) * dir;
      }
      return 0;
    };
    return [...base].sort(cmp);
  }, [items, query, difficulty, lang, tagsFilter, sortKey, sortDir]);

  function openNew(){
    // Pre-fill with current filters so the created item is visible in the list
    const initial = {
      title:'',
      problemUrl:'',
      category:'',
      difficulty: (difficulty || ''),
      approach:'',
      code:'',
      language: (lang && lang !== 'all' ? lang : 'plaintext'),
      tagsDraft: (Array.isArray(tagsFilter) && tagsFilter.length ? tagsFilter.join(', ') : ''),
      timeComplexity:'',
      spaceComplexity:'',
      referencesDraft:'',
      relatedDraft:''
    };
    setForm(initial);
    setModal({ open:true, item:null });
  }
  function openEdit(item){ setForm({ title:item.title||'', problemUrl:item.problemUrl||'', category:item.category||'', difficulty:item.difficulty||'', approach:item.approach||'', code:item.code||'', language:item.language||'plaintext', tagsDraft:(item.tags||[]).join(', '), timeComplexity:item.timeComplexity||'', spaceComplexity:item.spaceComplexity||'', referencesDraft:(item.references||[]).join('\n'), relatedDraft:(item.related||[]).join('\n') }); setModal({ open:true, item }); }
  function parseTags(s){
    if (!s) return [];
    // split by comma or whitespace; keep commas primary
    return s.split(',').map(x=>x.trim()).filter(Boolean).slice(0,15);
  }

  function parseLines(s){ return (s||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,20); }
  async function save(){
  if (saveBusy) return;
  setSaveError('');
  setSaveBusy(true);
    // normalize URL if present
    const normalizedUrl = (() => {
      const u = (form.problemUrl||'').trim();
      if (!u) return '';
      if (/^https?:\/\//i.test(u)) return u;
      return `https://${u}`;
    })();
  const payload = { title:form.title?.trim(), problemUrl:normalizedUrl, category:form.category||'', difficulty:form.difficulty||'', approach:form.approach||'', code:form.code||'', language:(form.language||'plaintext'), tags:parseTags(form.tagsDraft), timeComplexity: form.timeComplexity||'', spaceComplexity: form.spaceComplexity||'', references: parseLines(form.referencesDraft), related: parseLines(form.relatedDraft) };
  if (!payload.title) { notify('Title is required','warning'); return; }
  if (payload.difficulty && !['easy','medium','hard','expert'].includes(payload.difficulty)) { notify('Invalid difficulty','warning'); return; }
    try {
      if (modal.item) {
        const res = await apiUpdateSolution(modal.item._id, payload);
  if (res.ok) { setItems(items.map(i=>i._id===res.item._id?res.item:i)); notify('Updated','success'); setModal({ open:false, item:null }); }
  else { const msg = friendlyError(res.status, res.error||'Update failed'); setSaveError(msg); notify(msg,'error'); return; }
      } else {
        const res = await apiCreateSolution(projectId, payload);
        if (res.ok) {
          setItems([res.item, ...items]);
          // If the new item is hidden by current filters, inform the user
          const hiddenByFilters = (
            (difficulty && (res.item.difficulty||'') !== difficulty) ||
            (lang !== 'all' && (res.item.language||'plaintext') !== lang) ||
            (Array.isArray(tagsFilter) && tagsFilter.length && !tagsFilter.every(t => (res.item.tags||[]).includes(t))) ||
            (query.trim() && !(
              (res.item.title||'').toLowerCase().includes(query.trim().toLowerCase()) ||
              (res.item.category||'').toLowerCase().includes(query.trim().toLowerCase()) ||
              (res.item.approach||'').toLowerCase().includes(query.trim().toLowerCase())
            ))
          );
          if (hiddenByFilters) {
            notify('Created. Item is hidden by active filters. Clear filters to see it.','warning');
          } else {
            notify('Created','success');
          }
      setModal({ open:false, item:null });
        } else {
          const msg = friendlyError(res.status, res.error || `Create failed${res.status ? ` (HTTP ${res.status})` : ''}`);
      setSaveError(msg);
      notify(msg,'error');
          return; // keep modal open
        }
      }
    } catch (e) { const msg = 'Network error while saving'; setSaveError(msg); notify(msg,'error'); return; }
    finally { setSaveBusy(false); }
  }

  async function del(item){ if (!confirm('Delete this solution?')) return; try { const res = await apiDeleteSolution(item._id); if (res.ok) { setItems(items.filter(i=>i._id!==item._id)); notify('Deleted','success'); } else notify(res.error||'Delete failed','error'); } catch { notify('Delete failed','error'); } }

  return (
    <section className="solutions-panel">
      <SolutionsFilters
        items={items}
        query={query} setQuery={setQuery}
        difficulty={difficulty} setDifficulty={setDifficulty}
        lang={lang} setLang={setLang}
        tagsFilter={tagsFilter} setTagsFilter={setTagsFilter}
        onNew={openNew}
      />

      {loading ? <p>Loading…</p> : (
        <div className="solutions-container">
          <SolutionsTable 
            items={filtered} 
            onEdit={openEdit} 
            onDelete={del} 
            onSelect={setActive}
            sortKey={sortKey} 
            sortDir={sortDir}
            onSortChange={(key)=>{
              setSortKey(prev => prev === key ? prev : key);
              setSortDir(prev => (sortKey === key ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
            }}
            renderViewer={(item) => <SolutionViewer item={item} />}
          />
        </div>
      )}

  <SolutionsModal open={modal.open} item={modal.item} form={form} setForm={setForm} onClose={()=>{ if (!saveBusy) setModal({ open:false, item:null }); }} onSave={save} busy={saveBusy} errorText={saveError} />
    </section>
  );
}
