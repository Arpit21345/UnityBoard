import React, { createContext, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Ctx = createContext({ ctx: '', setCtx: () => {} });

export function AiContextProvider({ children }) {
  const location = useLocation();
  const [extra, setExtra] = useState('');

  const routeCtx = useMemo(() => {
    const p = location?.pathname || '';
    if (p === '/') return 'Explore page';
    if (p.startsWith('/login')) return 'Login page';
    if (p.startsWith('/register')) return 'Register page';
    if (p.startsWith('/invite/')) return `Invite accept page`;
    if (p.startsWith('/dashboard')) return 'Dashboard page';
    if (p.startsWith('/project/')) {
      const id = p.split('/')[2] || '';
      return `Project page id=${id}`;
    }
    return `Route ${p}`;
  }, [location?.pathname]);

  const ctx = useMemo(() => {
    return extra ? `${routeCtx} | ${extra}` : routeCtx;
  }, [routeCtx, extra]);

  const value = useMemo(() => ({ ctx, setCtx: setExtra }), [ctx]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAiContext() {
  return useContext(Ctx);
}
