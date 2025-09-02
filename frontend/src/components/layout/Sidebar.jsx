import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <nav className="side-nav">
      <div style={{fontWeight:700, marginBottom:12}}>UnityBoard</div>
      <NavLink to="/dashboard" className={({isActive})=>`side-link ${isActive?'active':''}`}>Home Dashboard</NavLink>
      <NavLink to="/dashboard" className={({isActive})=>`side-link ${isActive?'active':''}`}>Profile</NavLink>
      <NavLink to="/dashboard" className={({isActive})=>`side-link ${isActive?'active':''}`}>Past Projects</NavLink>
      <NavLink to="/dashboard" className={({isActive})=>`side-link ${isActive?'active':''}`}>Settings</NavLink>
      <NavLink to="/login" className={({isActive})=>`side-link ${isActive?'active':''}`}>Logout</NavLink>
    </nav>
  );
}
