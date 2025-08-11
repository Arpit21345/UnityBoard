import React from 'react';

export default function AppLayout({ sidebar, topbar, children }) {
  return (
    <div className="layout">
      <aside className="sidebar">{sidebar}</aside>
      <div>
        <div className="topbar"><div className="topbar-inner">{topbar}</div></div>
        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
}
