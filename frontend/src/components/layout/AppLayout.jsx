import React, { useState } from 'react';

export default function AppLayout({ sidebar, topbar, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      {/* Mobile sidebar toggle button */}
      <button 
        className="sidebar-toggle mobile-only" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>
      
      {/* Sidebar with mobile toggle functionality */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {React.cloneElement(sidebar, { onLinkClick: () => setSidebarOpen(false) })}
      </aside>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay mobile-only" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="layout-col">
        {topbar}
        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
}
