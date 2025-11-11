import React, { createContext, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Ctx = createContext({ 
  ctx: '', 
  setCtx: () => {}, 
  setProjectContext: () => {},
  isInProject: false,
  projectContext: null
});

export function AiContextProvider({ children }) {
  const location = useLocation();
  const [extra, setExtra] = useState('');
  const [projectContext, setProjectContext] = useState(null);

  const routeInfo = useMemo(() => {
    const p = location?.pathname || '';
    if (p === '/') return { route: 'Explore page', isProject: false };
    if (p.startsWith('/login')) return { route: 'Login page', isProject: false };
    if (p.startsWith('/register')) return { route: 'Register page', isProject: false };
    if (p.startsWith('/invite/')) return { route: 'Invite accept page', isProject: false };
    if (p.startsWith('/dashboard')) return { route: 'Dashboard page', isProject: false };
    if (p.startsWith('/profile')) return { route: 'Profile page', isProject: false };
    if (p.startsWith('/settings')) return { route: 'Settings page', isProject: false };
    if (p.startsWith('/project/')) {
      const id = p.split('/')[2] || '';
      return { route: `Project page`, isProject: true, projectId: id };
    }
    return { route: `Route ${p}`, isProject: false };
  }, [location?.pathname]);

  const ctx = useMemo(() => {
    let baseContext = routeInfo.route;
    
    // Add project context if available
    if (routeInfo.isProject && projectContext) {
      try {
        const projectInfo = [
          `Project: ${projectContext.name || 'Unnamed Project'}`,
          projectContext.description ? `Description: ${projectContext.description}` : '',
          projectContext.tasks?.length ? `Active tasks: ${projectContext.tasks.length}` : '',
          projectContext.members?.length ? `Team members: ${projectContext.members.length}` : ''
        ].filter(Boolean).join('. ');
        
        baseContext = projectInfo;
      } catch (error) {
        console.warn('Error building project context:', error);
        baseContext = `Project page (ID: ${routeInfo.projectId})`;
      }
    }
    
    return extra ? `${baseContext} | ${extra}` : baseContext;
  }, [routeInfo.route, routeInfo.isProject, routeInfo.projectId, projectContext?.name, projectContext?.description, projectContext?.tasks?.length, projectContext?.members?.length, extra]);

  const value = useMemo(() => ({ 
    ctx, 
    setCtx: setExtra,
    setProjectContext,
    isInProject: routeInfo.isProject,
    projectContext
  }), [ctx, routeInfo.isProject, projectContext]);
  
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAiContext() {
  return useContext(Ctx);
}
