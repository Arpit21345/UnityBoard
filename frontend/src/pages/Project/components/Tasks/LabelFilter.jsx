import React, { useEffect, useRef, useState } from 'react';

export default function LabelFilter({ value, onChange, labels }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e){ if(ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const currentLabel = value === 'all' ? 'All' : value;
  const display = currentLabel?.length > 20 ? currentLabel.slice(0,20) + '…' : currentLabel;
  return (
    <div className="label-filter" ref={ref}>
      <label className="small">Label</label>
      <button type="button" className="label-filter-trigger" onClick={()=> setOpen(o=>!o)} aria-haspopup="listbox" aria-expanded={open}>
        <span className="label-filter-value" title={currentLabel}>{display}</span>
        <span className="caret" aria-hidden>▾</span>
      </button>
      {open && (
        <div className="label-filter-pop" role="listbox" tabIndex={-1}>
          <div className="label-filter-search-row">
            <input
              placeholder="Filter labels…"
              onChange={(e)=>{
                const q = e.target.value.toLowerCase();
                const opts = Array.from(ref.current.querySelectorAll('.label-filter-option'));
                opts.forEach(el => {
                  const text = el.getAttribute('data-label');
                  if(!text) return;
                  el.style.display = q && !text.toLowerCase().includes(q) ? 'none' : '';
                });
              }}
            />
          </div>
          <div className="label-filter-options">
            <div
              className={`label-filter-option ${value==='all' ? 'active':''}`}
              data-label="All"
              role="option"
              onClick={()=>{ onChange('all'); setOpen(false); }}
            >All</div>
            {labels.map(l => (
              <div
                key={l}
                className={`label-filter-option ${value===l ? 'active':''}`}
                data-label={l}
                title={l}
                role="option"
                onClick={()=>{ onChange(l); setOpen(false); }}
              >{l.length>32? l.slice(0,32)+'…': l}</div>
            ))}
            {labels.length===0 && <div className="label-filter-empty">No labels</div>}
          </div>
        </div>
      )}
    </div>
  );
}
