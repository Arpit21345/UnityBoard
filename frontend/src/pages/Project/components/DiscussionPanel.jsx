import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiListThreads, apiCreateThread, apiUpdateThread, apiDeleteThread, apiListMessages, apiCreateMessage, apiDeleteMessage } from '../../../services/discussion.js';
import { apiListProjectMembers } from '../../../services/projects.js';
import { useToast } from '../../../components/Toast/ToastContext.jsx';
import Modal from '../../../components/Modal/Modal.jsx';

export default function DiscussionPanel({ projectId, me, amPrivileged, project }) {
  const { notify } = useToast();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(localStorage.getItem(`thr.q.${projectId}`)||'');
  const [tagsFilter, setTagsFilter] = useState(() => { try { return JSON.parse(localStorage.getItem(`thr.tags.${projectId}`)||'[]'); } catch { return []; } });
  const [pinnedOnly, setPinnedOnly] = useState(() => {
    try { return localStorage.getItem(`thr.pinnedOnly.${projectId}`) === '1'; } catch { return false; }
  });
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [modal, setModal] = useState({ open:false, item:null });
  const [form, setForm] = useState({ title:'', tagsDraft:'' });
  const msgListRef = useRef(null);
  const [members, setMembers] = useState([]);
  const isCreator = (item) => me && item && String(item.createdBy) === String(me._id);
  const canCreate = !!amPrivileged;
  const canEditDelete = (item) => !!(amPrivileged || isCreator(item));
  const canModerate = !!amPrivileged;

  useEffect(() => { (async()=>{
    try {
      const res = await apiListThreads(projectId);
      if (res.ok) {
        const items = res.items||[];
        setThreads(items);
        const saved = localStorage.getItem(`thr.active.${projectId}`);
        const pick = items.find(t=>t._id===saved) || items.find(t=>t.pinned) || items[0];
        if (pick) openThread(pick);
      } else notify('Failed to load threads','error');
    } catch { notify('Failed to load threads','error'); }
    finally { setLoading(false); }
  })(); }, [projectId]);
  useEffect(() => { (async()=>{ try { const m = await apiListProjectMembers(projectId); setMembers(m||[]); } catch { /* ignore */ } })(); }, [projectId]);
  useEffect(() => { localStorage.setItem(`thr.q.${projectId}`, query); }, [projectId, query]);
  useEffect(() => { localStorage.setItem(`thr.tags.${projectId}`, JSON.stringify(tagsFilter)); }, [projectId, tagsFilter]);
  useEffect(() => { try { localStorage.setItem(`thr.pinnedOnly.${projectId}`, pinnedOnly ? '1' : '0'); } catch {} }, [projectId, pinnedOnly]);

  const allTags = useMemo(() => Array.from(new Set(threads.flatMap(t => t.tags || []))).slice(0, 50), [threads]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads.filter(t => {
      if (pinnedOnly && !t.pinned) return false;
      if (tagsFilter.length && !tagsFilter.every(x => (t.tags||[]).includes(x))) return false;
      if (!q) return true;
      return (t.title||'').toLowerCase().includes(q);
    });
  }, [threads, query, tagsFilter, pinnedOnly]);

  function openNew(){ if (!canCreate) return; setForm({ title:'', tagsDraft:'' }); setModal({ open:true, item:null }); }
  function openEdit(item){ if (!canEditDelete(item)) return; setForm({ title:item.title||'', tagsDraft:(item.tags||[]).join(', ') }); setModal({ open:true, item }); }
  function parseTags(s){ return (s||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,15); }

  async function save(){
    const payload = { title: form.title?.trim(), tags: parseTags(form.tagsDraft) };
    if (!payload.title) { notify('Title is required','warning'); return; }
    try {
      if (modal.item){
        const res = await apiUpdateThread(modal.item._id, payload);
        if (res.ok) { setThreads(threads.map(t=>t._id===res.item._id?res.item:t)); notify('Updated','success'); }
        else notify(res.error||'Update failed','error');
      } else {
        const res = await apiCreateThread(projectId, payload);
        if (res.ok) { setThreads([res.item, ...threads]); notify('Created','success'); }
        else notify(res.error||'Create failed','error');
      }
      setModal({ open:false, item:null });
    } catch { notify(modal.item?'Update failed':'Create failed','error'); }
  }
  async function del(item){ if (!canEditDelete(item)) return; if (!confirm('Delete this thread?')) return; try { const res = await apiDeleteThread(item._id); if (res.ok) { setThreads(threads.filter(t=>t._id!==item._id)); if (active?._id===item._id){ setActive(null); setMessages([]); } notify('Deleted','success'); } else notify(res.error||'Delete failed','error'); } catch { notify('Delete failed','error'); } }

  async function openThread(item){
    setActive(item);
    try { localStorage.setItem(`thr.active.${projectId}`, item._id); } catch {}
    try {
      const res = await apiListMessages(item._id);
      if (res.ok) {
        setMessages(res.items||[]);
        setTimeout(()=>{ msgListRef.current?.scrollTo({ top: msgListRef.current.scrollHeight, behavior:'smooth' }); }, 50);
      } else notify('Failed to load messages','error');
    } catch { notify('Failed to load messages','error'); }
  }

  async function send(){
    const text = (msgText||'').trim(); if (!text || !active) return;
    const tempId = `tmp-${Date.now()}`;
    const temp = { _id: tempId, text, createdAt: new Date().toISOString(), user: me?._id, __optimistic: true };
    setMessages([...messages, temp]);
    setMsgText('');
    setTimeout(()=>{ msgListRef.current?.scrollTo({ top: msgListRef.current.scrollHeight, behavior:'smooth' }); }, 0);
    try {
      const res = await apiCreateMessage(active._id, { text });
      if (res.ok) {
        setMessages(curr => curr.map(m => m._id === tempId ? res.item : m));
      } else {
        setMessages(curr => curr.filter(m => m._id !== tempId));
        notify(res.error||'Send failed','error');
      }
    } catch {
      setMessages(curr => curr.filter(m => m._id !== tempId));
      notify('Send failed','error');
    }
  }

  async function togglePin(item){ if (!canModerate) return; try { const res = await apiUpdateThread(item._id, { pinned: !item.pinned }); if (res.ok){ setThreads(threads.map(t=>t._id===item._id?res.item:t)); if (active?._id===item._id) setActive(res.item); notify(res.item.pinned?'Pinned':'Unpinned','success'); } else notify(res.error||'Action failed','error'); } catch { notify('Action failed','error'); } }
  async function toggleLock(item){ if (!canModerate) return; try { const res = await apiUpdateThread(item._id, { locked: !item.locked }); if (res.ok){ setThreads(threads.map(t=>t._id===item._id?res.item:t)); if (active?._id===item._id) setActive(res.item); notify(res.item.locked?'Locked':'Unlocked','success'); } else notify(res.error||'Action failed','error'); } catch { notify('Action failed','error'); } }
  async function deleteMsg(m){ if (!active) return; try { const res = await apiDeleteMessage(active._id, m._id); if (res.ok){ setMessages(messages.map(x=>x._id===m._id?res.item:x)); } else notify(res.error||'Delete failed','error'); } catch { notify('Delete failed','error'); } }

  const singleRoom = !!project?.chatSingleRoom;
  return (
    <section style={{ display:'grid', gridTemplateColumns: singleRoom ? '1fr' : '280px 1fr', gap:12 }}>
      {!singleRoom && <div>
        <div className="section-header" style={{ marginBottom:8 }}>
          <h3>Threads</h3>
          <div className="actions">{canCreate && <button className="btn btn-primary" onClick={openNew}>New</button>}</div>
        </div>
        <div className="card" style={{ marginBottom:8, padding:8 }}>
          <p className="small" style={{ margin:0 }}>Project-wide group chat. No private messages. Owner/Admin manage threads; all members can post.</p>
        </div>
        <input placeholder="Search" value={query} onChange={e=>setQuery(e.target.value)} style={{ width:'100%', marginBottom:8 }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, gap:8, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {allTags.map(t => (
              <button key={t} className={`chip ${tagsFilter.includes(t)?'chip-active':''}`} onClick={()=> setTagsFilter(v => v.includes(t) ? v.filter(x=>x!==t) : [...v, t])}>{t}</button>
            ))}
          </div>
          <label className="small" style={{ display:'flex', alignItems:'center', gap:6 }}>
            <input type="checkbox" checked={pinnedOnly} onChange={e=>setPinnedOnly(e.target.checked)} />
            Pinned only
          </label>
        </div>
        {loading ? <p>Loading…</p> : (
          <div className="card-list">
            {filtered.map(item => (
              <div key={item._id} className={`card ${active?._id===item._id?'card-active':''}`} onClick={()=>openThread(item)} style={{ cursor:'pointer' }}>
                <div className="title-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <strong className="truncate" title={item.title}>
                    {item.pinned && <span title="Pinned" style={{ marginRight:4 }}>📌</span>}
                    {item.locked && <span title="Locked" style={{ marginRight:4 }}>🔒</span>}
                    {item.title}
                  </strong>
                  <span className="small" style={{ opacity:0.7 }}>{new Date(item.updatedAt||item.createdAt).toLocaleDateString()}</span>
                </div>
                {(item.tags||[]).length>0 && <div className="small" style={{ opacity:0.8, marginTop:4 }}>{item.tags.join(', ')}</div>}
                {(canEditDelete(item) || canModerate) && (
                  <div className="row-actions" style={{ display:'flex', gap:6, marginTop:8 }} onClick={e=>e.stopPropagation()}>
                    {canModerate && <>
                      <button className="btn btn-ghost" onClick={()=>togglePin(item)}>{item.pinned? 'Unpin' : 'Pin'}</button>
                      <button className="btn btn-ghost" onClick={()=>toggleLock(item)}>{item.locked? 'Unlock' : 'Lock'}</button>
                    </>}
                    {canEditDelete(item) && <>
                      <button className="btn" onClick={()=>openEdit(item)}>Edit</button>
                      <button className="btn btn-ghost" onClick={()=>del(item)}>Delete</button>
                    </>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {(!filtered.length && !loading) && (
          <div className="card" style={{ padding:12, marginTop:8 }}>
            <div className="small muted">No threads yet.</div>
            {canCreate && <button className="btn btn-primary" style={{ marginTop:8 }} onClick={openNew}>Create your first thread</button>}
          </div>
        )}
      </div>}
      <div>
        <div className="section-header" style={{ marginBottom:8 }}>
          <h3>
            {active ? (
              <>
                {active.pinned && <span title="Pinned" style={{ marginRight:6 }}>📌</span>}
                {active.locked && <span title="Locked" style={{ marginRight:6 }}>🔒</span>}
                {active.title}
              </>
            ) : 'Messages'}
          </h3>
        </div>
        {singleRoom && (
          <div className="small muted" style={{ marginTop:-6, marginBottom:8 }}>
            Single-room discussion is enabled for this project.
          </div>
        )}
        {!active ? (
          <p className="muted">{singleRoom ? 'Start chatting in your project room.' : 'Select a thread to view messages.'}</p>
        ) : (
          <div className="card" style={{ minHeight:320, display:'flex', flexDirection:'column' }}>
            {active.locked && <div className="banner warning" style={{ padding:8, borderBottom:'1px solid var(--border)', background:'var(--bg-subtle)' }}>Thread is locked. Members can read but cannot post.</div>}
            <div ref={msgListRef} style={{ flex:1, overflow:'auto', padding:8, display:'flex', flexDirection:'column', gap:8 }}>
              {messages.map(m => (
                <div key={m._id} className="bubble" style={{ opacity: m.deleted ? 0.7 : 1 }}>
                  <div className="small" style={{ opacity:0.7 }}>
                    {(() => {
                      const u = members.find(x => String(x.user) === String(m.user));
                      const name = u?.name || (me && String(me._id)===String(m.user) ? 'You' : 'Member');
                      return `${name} • ${new Date(m.createdAt).toLocaleString()}`;
                    })()}
                  </div>
                  <div>{m.text}</div>
                  {!m.__optimistic && !m.deleted && (canModerate || (me && String(me._id) === String(m.user))) && (
                    <div className="small" style={{ marginTop:4 }}>
                      <button className="btn btn-ghost" onClick={()=>deleteMsg(m)}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
              {(!messages.length && active) && (
                <div className="bubble" style={{ opacity:0.8 }}>
                  <div className="small" style={{ opacity:0.7 }}>No messages yet</div>
                  <div>Start the conversation.</div>
                </div>
              )}
            </div>
            <div style={{ borderTop:'1px solid var(--border)', padding:8, display:'flex', gap:8 }}>
              <input placeholder={active.locked? 'Thread is locked' : 'Type a message'} disabled={!!active.locked} value={msgText} onChange={e=>setMsgText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ send(); } }} style={{ flex:1 }} />
              <button className="btn btn-primary" onClick={send} disabled={!!active.locked || !msgText.trim()}>Send</button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modal.open} title={modal.item? 'Edit Thread' : 'New Thread'} onClose={()=>setModal({ open:false, item:null })}
        footer={<>
          <button className="btn" onClick={()=>setModal({ open:false, item:null })}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save</button>
        </>}>
        <div className="form-grid">
          <input autoFocus placeholder="Title" value={form.title} onChange={e=>setForm({ ...form, title:e.target.value })} />
          <input placeholder="Tags (comma separated)" value={form.tagsDraft} onChange={e=>setForm({ ...form, tagsDraft:e.target.value })} />
        </div>
      </Modal>
    </section>
  );
}
