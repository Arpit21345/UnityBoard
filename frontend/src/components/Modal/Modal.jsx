import React, { useEffect } from 'react';

export default function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    function onKey(e){ if(e.key==='Escape') onClose?.(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000 }} onClick={onClose}>
      <div className="card" style={{ width:'min(640px, 92vw)', maxHeight:'88vh', overflow:'auto' }} onClick={e=>e.stopPropagation()}>
        {title && <div style={{ padding:'12px 16px', borderBottom:'1px solid #e5e7eb', fontWeight:600 }}>{title}</div>}
        <div style={{ padding:'12px 16px' }}>{children}</div>
        {footer && <div style={{ padding:'12px 16px', borderTop:'1px solid #e5e7eb', display:'flex', justifyContent:'flex-end', gap:8 }}>{footer}</div>}
      </div>
    </div>
  );
}
