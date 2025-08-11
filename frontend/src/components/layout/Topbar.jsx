import React from 'react';

export default function Topbar() {
  return (
    <>
      <div className="search"><input className="input" placeholder="Search projects, tasks, or team members..."/></div>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <button className="btn" title="Theme">🌓</button>
        <button className="btn" title="Notifications">🔔</button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'#ddd'}}/>
          <div className="small">owner</div>
        </div>
      </div>
    </>
  );
}
