import React from 'react';

export default function AppLayout({ sidebar, topbar, children }) {
  return (
    <div className="layout">
      <aside className="sidebar">{sidebar}</aside>
      <div className="layout-col">
        {topbar}
        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
}
