import React, { useEffect, useMemo, useState } from 'react';
import Spinner from '../../../components/ui/Spinner.jsx';
import { apiListSolutions, apiCreateSolution, apiUpdateSolution, apiDeleteSolution } from '../../../services/solutions.js';
import { useToast } from '../../../components/Toast/ToastContext.jsx';
import Modal from '../../../components/Modal/Modal.jsx';

const DIFFS = ['','easy','medium','hard','expert'];
const LANGS = ['plaintext','javascript','typescript','python','java','csharp','cpp','go','rust','sql','bash','json','yaml','html','css'];

export default function SolutionsPanel({ projectId, me }) {
  const { notify } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(localStorage.getItem(`sol.q.${projectId}`) || '');
  const [difficulty, setDifficulty] = useState(localStorage.getItem(`sol.diff.${projectId}`) || '');
  const [lang, setLang] = useState(localStorage.getItem(`sol.lang.${projectId}`) || 'all');
  const [tagsFilter, setTagsFilter] = useState(() => { try { return JSON.parse(localStorage.getItem(`sol.tags.${projectId}`) || '[]'); } catch { return []; } });
  const [modal, setModal] = useState({ open:false, item:null });
  const [form, setForm] = useState({ title:'', problemUrl:'', category:'', difficulty:'', approach:'', code:'', language:'plaintext', tagsDraft:'' });

  useEffect(() => { (async()=>{ try { const res = await apiListSolutions(projectId); if (res.ok) setItems(res.items||[]); else notify('Failed to load solutions','error'); } catch { notify('Failed to load solutions','error'); } finally { setLoading(false); } })(); }, [projectId]);

  useEffect(() => { localStorage.setItem(`sol.q.${projectId}`, query); }, [projectId, query]);
  useEffect(() => { localStorage.setItem(`sol.diff.${projectId}`, difficulty); }, [projectId, difficulty]);
  useEffect(() => { localStorage.setItem(`sol.lang.${projectId}`, lang); }, [projectId, lang]);
  useEffect(() => { localStorage.setItem(`sol.tags.${projectId}`, JSON.stringify(tagsFilter)); }, [projectId, tagsFilter]);

  const allTags = useMemo(() => Array.from(new Set(items.flatMap(i => i.tags || []))).slice(0, 50), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i => {
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
  }, [items, query, difficulty, lang, tagsFilter]);

  function openNew(){ setForm({ title:'', problemUrl:'', category:'', difficulty:'', approach:'', code:'', language:'plaintext', tagsDraft:'' }); setModal({ open:true, item:null }); }
  function openEdit(item){ setForm({ title:item.title||'', problemUrl:item.problemUrl||'', category:item.category||'', difficulty:item.difficulty||'', approach:item.approach||'', code:item.code||'', language:item.language||'plaintext', tagsDraft:(item.tags||[]).join(', ') }); setModal({ open:true, item }); }
  function parseTags(s){ return (s||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,15); }

  async function save(){
    const payload = { title:form.title?.trim(), problemUrl:form.problemUrl||'', category:form.category||'', difficulty:form.difficulty||'', approach:form.approach||'', code:form.code||'', language:form.language||'plaintext', tags:parseTags(form.tagsDraft) };
    if (!payload.title) { notify('Title is required','warning'); return; }
    try {
      if (modal.item) {
        const res = await apiUpdateSolution(modal.item._id, payload);
        if (res.ok) { setItems(items.map(i=>i._id===res.item._id?res.item:i)); notify('Updated','success'); }
        else notify(res.error||'Update failed','error');
      } else {
        const res = await apiCreateSolution(projectId, payload);
        if (res.ok) { setItems([res.item, ...items]); notify('Created','success'); }
        else notify(res.error||'Create failed','error');
      }
      setModal({ open:false, item:null });
    } catch { notify(modal.item?'Update failed':'Create failed','error'); }
  }

  async function del(item){ if (!confirm('Delete this solution?')) return; try { const res = await apiDeleteSolution(item._id); if (res.ok) { setItems(items.filter(i=>i._id!==item._id)); notify('Deleted','success'); } else notify(res.error||'Delete failed','error'); } catch { notify('Delete failed','error'); } }

  return (
    <section>
      <div className="section-header">
        <h3>Solution Database</h3>
        <div className="actions"><button className="btn btn-primary" onClick={openNew}>New</button></div>
      </div>

      <div className="filters" style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:12 }}>
        <input placeholder="Search" value={query} onChange={e=>setQuery(e.target.value)} style={{ minWidth:220 }} />
        <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
          {DIFFS.map(d => <option key={d} value={d}>{d?`difficulty: ${d}`:'any difficulty'}</option>)}
        </select>
        <select value={lang} onChange={e=>setLang(e.target.value)}>
          <option value="all">All languages</option>
          {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
          {allTags.map(t => (
            <button key={t} className={`chip ${tagsFilter.includes(t)?'chip-active':''}`} onClick={()=> setTagsFilter(v => v.includes(t) ? v.filter(x=>x!==t) : [...v, t])}>{t}</button>
          ))}
        </div>
      </div>

  {loading ? <Spinner size={24} /> : (
        filtered.length ? (
          <div className="table like-table">
            <div className="thead">
              <div className="tr">
                <div className="th" style={{flex:2}}>Title</div>
                <div className="th">Category</div>
                <div className="th">Difficulty</div>
                <div className="th">Lang</div>
                <div className="th" style={{flex:2}}>Tags</div>
                <div className="th">Actions</div>
              </div>
            </div>
            <div className="tbody">
              {filtered.map(item => (
                <div key={item._id} className="tr">
                  <div className="td" style={{flex:2}}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                      <strong>{item.title}</strong>
                      {item.problemUrl && <a className="small" href={item.problemUrl} target="_blank" rel="noreferrer">link</a>}
                    </div>
                  </div>
                  <div className="td">{item.category||'-'}</div>
                  <div className="td">{item.difficulty||'-'}</div>
                  <div className="td">{item.language||'plaintext'}</div>
                  <div className="td" style={{flex:2}}>
                    <span className="small" style={{ opacity:0.8 }}>{(item.tags||[]).join(', ')}</span>
                  </div>
                  <div className="td">
                    <div className="row-actions" style={{ display:'flex', gap:6 }}>
                      <button className="btn" onClick={()=>openEdit(item)}>Edit</button>
                      <button className="btn btn-ghost" onClick={()=>del(item)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : <p className="muted">No solutions match your filters.</p>
      )}

      <Modal open={modal.open} title={modal.item? 'Edit Solution' : 'New Solution'} onClose={()=>setModal({ open:false, item:null })}
        footer={<>
          <button className="btn" onClick={()=>setModal({ open:false, item:null })}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save</button>
        </>}>
        <div className="form-grid">
          <input autoFocus placeholder="Title" value={form.title} onChange={e=>setForm({ ...form, title:e.target.value })} />
          <input placeholder="Problem URL" value={form.problemUrl} onChange={e=>setForm({ ...form, problemUrl:e.target.value })} />
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <label className="small">Category</label>
            <input placeholder="e.g., Arrays" value={form.category} onChange={e=>setForm({ ...form, category:e.target.value })} style={{ minWidth:160 }} />
            <label className="small">Difficulty</label>
            <select value={form.difficulty} onChange={e=>setForm({ ...form, difficulty:e.target.value })}>
              {DIFFS.map(d => <option key={d} value={d}>{d||'(none)'}</option>)}
            </select>
            <label className="small">Language</label>
            <select value={form.language} onChange={e=>setForm({ ...form, language:e.target.value })}>
              {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <textarea placeholder="Approach / Notes" value={form.approach} onChange={e=>setForm({ ...form, approach:e.target.value })} rows={3} />
          <textarea placeholder="Code" value={form.code} onChange={e=>setForm({ ...form, code:e.target.value })} rows={8} style={{ fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} />
          <input placeholder="Tags (comma separated)" value={form.tagsDraft} onChange={e=>setForm({ ...form, tagsDraft:e.target.value })} />
        </div>
      </Modal>
    </section>
  );
}
