import React from 'react';
import Modal from '../../../../components/Modal/Modal.jsx';

const DIFFS = ['', 'easy', 'medium', 'hard', 'expert'];
const LANGS = ['plaintext','javascript','typescript','python','java','csharp','cpp','go','rust','sql','bash','json','yaml','html','css'];

export default function SolutionsModal({ open, item, form, setForm, onClose, onSave, busy=false, errorText='' }) {
  return (
    <Modal open={open} title={item? 'Edit Solution' : 'New Solution'} onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn btn-primary" onClick={onSave} disabled={busy}>{busy? 'Saving…' : 'Save'}</button>
      </>}>
      <div className="solutions-form">
        {errorText ? (
          <div className="card p-2" style={{borderColor:'var(--red-300)', color:'var(--red-700)'}}>
            <span className="small">{errorText}</span>
          </div>
        ) : null}
        <div>
          <label className="small">Title</label>
          <input autoFocus placeholder="Title" value={form.title} onChange={e=>setForm({ ...form, title:e.target.value })} />
        </div>
        <div>
          <label className="small">Problem URL</label>
          <input placeholder="https://..." value={form.problemUrl} onChange={e=>setForm({ ...form, problemUrl:e.target.value })} />
        </div>
        <div className="row-inline">
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
        <div>
          <label className="small">Approach / Notes</label>
          <textarea placeholder="Write detailed notes with line breaks, lists, etc." value={form.approach} onChange={e=>setForm({ ...form, approach:e.target.value })} rows={8} />
        </div>
        <div>
          <label className="small">Code</label>
          <textarea placeholder="Paste code" value={form.code} onChange={e=>setForm({ ...form, code:e.target.value })} rows={8} style={{ fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} />
        </div>
        <div>
          <label className="small">Tags (comma separated)</label>
          <input placeholder="array, two-pointers" value={form.tagsDraft} onChange={e=>setForm({ ...form, tagsDraft:e.target.value })} />
        </div>
        <div className="row-inline">
          <label className="small">Time</label>
          <input placeholder="e.g., O(n log n)" value={form.timeComplexity||''} onChange={e=>setForm({ ...form, timeComplexity:e.target.value })} style={{ minWidth:160 }} />
          <label className="small">Space</label>
          <input placeholder="e.g., O(n)" value={form.spaceComplexity||''} onChange={e=>setForm({ ...form, spaceComplexity:e.target.value })} style={{ minWidth:160 }} />
        </div>
        <div>
          <label className="small">References (one per line)</label>
          <textarea rows={2} placeholder="https://..." value={form.referencesDraft||''} onChange={e=>setForm({ ...form, referencesDraft:e.target.value })} />
        </div>
        <div>
          <label className="small">Related Problems (one per line)</label>
          <textarea rows={2} placeholder="https://... or text" value={form.relatedDraft||''} onChange={e=>setForm({ ...form, relatedDraft:e.target.value })} />
        </div>
      </div>
    </Modal>
  );
}
