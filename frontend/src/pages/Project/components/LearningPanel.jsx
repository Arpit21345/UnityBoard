import React, { useEffect, useMemo, useState } from 'react';
import { apiListLearning, apiCreateLearning, apiUpdateLearning, apiDeleteLearning } from '../../../services/learning.js';
import { useToast } from '../../../components/Toast/ToastContext.jsx';
import Modal from '../../../components/Modal/Modal.jsx';

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

  const allTags = useMemo(() => Array.from(new Set(items.flatMap(i => i.tags || []))).slice(0, 50), [items]);

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
      materials: parseCsv(form.materialsDraft)
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

  return (
    <section>
      <div className="section-header">
        <h3>Learning Tracker</h3>
        <div className="actions">
          <button className="btn btn-primary" onClick={openNew}>New</button>
        </div>
      </div>

      <div className="filters" style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:12 }}>
        <input placeholder="Search" value={query} onChange={e=>setQuery(e.target.value)} style={{ minWidth:220 }} />
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
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
                    <div className="title-row">
                      <strong>{item.title}</strong>
                      <span className={`badge badge-${item.status.replace('in-','in-')}`}>{item.status}</span>
                      {item.dueDate && <span className="badge">Due {new Date(item.dueDate).toLocaleDateString()}</span>}
                    </div>
                    {item.description && <p className="small" style={{ margin:'4px 0 0 0' }}>{item.description}</p>}
                    {(item.tags||[]).length>0 && (
                      <div style={{ marginTop:6, display:'flex', gap:6, flexWrap:'wrap' }}>
                        {item.tags.map((t,idx)=>(<span key={idx} className="chip small">{t}</span>))}
                      </div>
                    )}
                    {(item.materials||[]).length>0 && (
                      <div style={{ marginTop:6 }}>
                        <span className="small">Materials: </span>
                        {item.materials.map((m,idx)=>(
                          <a key={idx} href={m} target="_blank" rel="noreferrer" className="small" style={{ marginRight:8 }}>{m}</a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="row-actions" style={{ display:'flex', gap:6 }}>
                    <button className="btn" onClick={()=>openEdit(item)}>Edit</button>
                    <button className="btn btn-ghost" onClick={()=>del(item)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="muted">No learning items match your filters.</p>
      )}

      <Modal
        open={modal.open}
        title={modal.item ? 'Edit Learning' : 'New Learning'}
        onClose={()=> setModal({ open:false, item:null })}
        footer={<>
          <button className="btn" onClick={()=> setModal({ open:false, item:null })}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save</button>
        </>}
      >
        <div className="form-grid">
          <input autoFocus placeholder="Title" value={form.title} onChange={e=>setForm({ ...form, title:e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({ ...form, description:e.target.value })} rows={3} />
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <label className="small">Status</label>
            <select value={form.status} onChange={e=>setForm({ ...form, status:e.target.value })}>
              <option value="todo">Todo</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
            <label className="small">Due</label>
            <input type="date" value={form.dueDate} onChange={e=>setForm({ ...form, dueDate:e.target.value })} />
          </div>
          <input placeholder="Tags (comma separated)" value={form.tagsDraft} onChange={e=>setForm({ ...form, tagsDraft:e.target.value })} />
          <textarea placeholder="Materials links (comma separated URLs)" value={form.materialsDraft} onChange={e=>setForm({ ...form, materialsDraft:e.target.value })} rows={2} />
        </div>
      </Modal>
    </section>
  );
}
