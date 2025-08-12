import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastCtx = createContext({ notify: () => {} });

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const notify = useCallback((message, type = 'info', ttl = 3000) => {
    const id = Math.random().toString(36).slice(2);
    setItems(list => [...list, { id, message, type }]);
    setTimeout(() => setItems(list => list.filter(i => i.id !== id)), ttl);
  }, []);
  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      <div style={{ position:'fixed', top:12, right:12, display:'flex', flexDirection:'column', gap:8, zIndex:9999 }}>
        {items.map(i => (
          <div key={i.id} style={{ padding:'10px 12px', borderRadius:6, color:'#fff', background:i.type==='error'?'#ef4444':i.type==='success'?'#10b981':'#3b82f6', boxShadow:'0 6px 20px rgba(0,0,0,0.15)' }}>
            {i.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
