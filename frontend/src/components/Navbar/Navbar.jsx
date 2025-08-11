import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <a className="brand" href="/">
          <img className="brand-logo" src="/api/assets/logo.png" alt="UnityBoard logo" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
          <span>UnityBoard</span>
        </a>
        <div className="spacer" />
        <a href="/dashboard" className="link">Dashboard</a>
        <a href="/login" className="link" style={{ marginLeft: 12 }}>Login</a>
        <a href="/register" className="link" style={{ marginLeft: 12 }}>Register</a>
  <a href="#" onClick={(e)=>{ e.preventDefault(); localStorage.removeItem('token'); window.location.href='/'; }} className="link" style={{ marginLeft: 12 }}>Logout</a>
      </div>
    </nav>
  );
}
