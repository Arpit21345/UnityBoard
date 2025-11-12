import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ onLinkClick }) {
  const handleLinkClick = () => {
    // Close mobile sidebar when link is clicked
    if (onLinkClick) onLinkClick();
  };

  return (
    <nav className="side-nav">
      <div style={{fontWeight:700, marginBottom:12}}>UnityBoard</div>
      <NavLink to="/dashboard" className={({isActive})=>`side-link ${isActive?'active':''}`} onClick={handleLinkClick}>Home Dashboard</NavLink>
      <NavLink to="/profile" className={({isActive})=>`side-link ${isActive?'active':''}`} onClick={handleLinkClick}>Profile</NavLink>
      <NavLink to="/notifications" className={({isActive})=>`side-link ${isActive?'active':''}`} onClick={handleLinkClick}>Notifications</NavLink>
      <NavLink to="/settings" className={({isActive})=>`side-link ${isActive?'active':''}`} onClick={handleLinkClick}>Settings</NavLink>
      <NavLink to="/logout" className={({isActive})=>`side-link ${isActive?'active':''}`} onClick={handleLinkClick}>Logout</NavLink>
    </nav>
  );
}
