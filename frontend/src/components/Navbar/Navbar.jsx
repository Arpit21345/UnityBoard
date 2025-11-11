import React, { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="navbar" role="navigation" aria-label="Main">
      <div className="nav-inner">
        <a className="brand" href="/">
          <img className="brand-logo" src="/logo.png" alt="UnityBoard logo" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
          <span>UnityBoard</span>
        </a>
        <div className="spacer" />
        <button
          className="hamburger"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen(v => !v)}
        >
          ☰
        </button>
        <div id="nav-links" className={`links-group${open ? ' open' : ''}`}>
          <a href="/dashboard" className="link">Dashboard</a>
          <a href="/login" className="link">Login</a>
          <a href="/register" className="link">Register</a>
          <a
            href="#"
            onClick={(e)=>{ e.preventDefault(); localStorage.removeItem('token'); window.location.href='/'; }}
            className="link"
          >Logout</a>
        </div>
      </div>
    </nav>
  );
}
