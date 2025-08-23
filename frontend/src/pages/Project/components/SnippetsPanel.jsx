import React, { useEffect, useMemo, useState } from 'react';
import { apiListSnippets, apiCreateSnippet, apiUpdateSnippet, apiDeleteSnippet } from '../../../services/snippets.js';
import { useToast } from '../../../components/Toast/ToastContext.jsx';
import Modal from '../../../components/Modal/Modal.jsx';

const LANGS = ['plaintext','javascript','typescript','python','java','csharp','cpp','go','rust','sql','bash','json','yaml','html','css'];

export default function SnippetsPanel({ projectId, me }) {
  const { notify } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(localStorage.getItem(`snip.q.${projectId}`) || '');
  const [lang, setLang] = useState(localStorage.getItem(`snip.lang.${projectId}`) || 'all');
  const [tagsFilter, setTagsFilter] = useState(() => { try { return JSON.parse(localStorage.getItem(`snip.tags.${projectId}`) || '[]'); } catch { return []; } });
  const [modal, setModal] = useState({ open:false, item:null, codeOpen:false });
  const [form, setForm] = useState({ title:'', language:'plaintext', tagsDraft:'', notes:'', code:'' });

  useEffect(() => { (async()=>{
    try { const res = await apiListSnippets(projectId); if (res.ok) setItems(res.items||[]); else notify('Failed to load snippets','error'); }
    catch { notify('Failed to load snippets','error'); }
    finally { setLoading(false); }
  })(); }, [projectId]);

  useEffect(() => { localStorage.setItem(`snip.q.${projectId}`, query); }, [projectId, query]);
  useEffect(() => { localStorage.setItem(`snip.lang.${projectId}`, lang); }, [projectId, lang]);
  useEffect(() => { localStorage.setItem(`snip.tags.${projectId}`, JSON.stringify(tagsFilter)); }, [projectId, tagsFilter]);

  const allTags = useMemo(() => Array.from(new Set(items.flatMap(i => i.tags || []))).slice(0, 50), [items]);

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

  function openNew(){ setForm({ title:'', language:'plaintext', tagsDraft:'', notes:'', code:'' }); setModal({ open:true, item:null, codeOpen:true }); }
  function openEdit(item){ setForm({ title:item.title||'', language:item.language||'plaintext', tagsDraft:(item.tags||[]).join(', '), notes:item.notes||'', code:item.code||'' }); setModal({ open:true, item, codeOpen:true }); }
  function parseTags(s){ return (s||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,15); }

  async function save(){
    const payload = { title: form.title?.trim(), language: form.language||'plaintext', tags: parseTags(form.tagsDraft), notes: form.notes||'', code: form.code||'' };
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
      setModal({ open:false, item:null, codeOpen:false });
    } catch { notify(modal.item?'Update failed':'Create failed','error'); }
  }

  async function del(item){ if (!confirm('Delete this snippet?')) return; try { const res = await apiDeleteSnippet(item._id); if (res.ok) { setItems(items.filter(i=>i._id!==item._id)); notify('Deleted','success'); } else notify(res.error||'Delete failed','error'); } catch { notify('Delete failed','error'); } }
  async function copyCode(snippet){ try { await navigator.clipboard.writeText(snippet.code||''); notify('Copied code','success'); } catch { notify('Copy failed','error'); } }

  return (
    <section>
      <div className="section-header">
        <h3>Smart Snippets</h3>
        <div className="actions"><button className="btn btn-primary" onClick={openNew}>New</button></div>
      </div>

      <div className="filters" style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:12 }}>
        <input placeholder="Search" value={query} onChange={e=>setQuery(e.target.value)} style={{ minWidth:220 }} />
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

      {loading ? <p>Loading…</p> : (
        filtered.length ? (
          <div className="card-list">
            {filtered.map(item => (
              <div key={item._id} className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                  <div>
                    <div className="title-row" style={{ gap:8, display:'flex', alignItems:'center', flexWrap:'wrap' }}>
                      <strong>{item.title}</strong>
                      <span className="badge">{item.language||'plaintext'}</span>
                      {(item.tags||[]).length>0 && (
                        <span className="small" style={{ opacity:0.8 }}>{item.tags.join(', ')}</span>
                      )}
                    </div>
                    {item.notes && <p className="small" style={{ margin:'4px 0 0 0' }}>{item.notes}</p>}
                  </div>
                  <div className="row-actions" style={{ display:'flex', gap:6 }}>
                    <button className="btn" onClick={()=>copyCode(item)}>Copy</button>
                    <button className="btn" onClick={()=>openEdit(item)}>Edit</button>
                    <button className="btn btn-ghost" onClick={()=>del(item)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="muted">No snippets match your filters.</p>
      )}

      <Modal open={modal.open} title={modal.item? 'Edit Snippet' : 'New Snippet'} onClose={()=>setModal({ open:false, item:null, codeOpen:false })}
        footer={<>
          <button className="btn" onClick={()=>setModal({ open:false, item:null, codeOpen:false })}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save</button>
        </>}>
        <div className="form-grid">
          <input autoFocus placeholder="Title" value={form.title} onChange={e=>setForm({ ...form, title:e.target.value })} />
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <label className="small">Language</label>
            <select value={form.language} onChange={e=>setForm({ ...form, language:e.target.value })}>
              {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <label className="small">Tags</label>
            <input placeholder="comma separated" value={form.tagsDraft} onChange={e=>setForm({ ...form, tagsDraft:e.target.value })} style={{ minWidth:220 }} />
          </div>
          <textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({ ...form, notes:e.target.value })} rows={2} />
          <textarea placeholder="Code" value={form.code} onChange={e=>setForm({ ...form, code:e.target.value })} rows={10} style={{ fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} />
        </div>
      </Modal>
    </section>
  );
}
