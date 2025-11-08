import React from 'react';
import './Avatar.css';

const API = import.meta.env.VITE_API_URL || '';

// Helper function to get avatar URL
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  return `${API}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
};

// Helper function to generate consistent color based on name
const getAvatarColor = (name) => {
  if (!name) return '#6366f1'; // Default indigo color
  
  const colors = [
    '#ef4444', // red
    '#f97316', // orange  
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
  ];
  
  // Generate consistent hash from name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export default function Avatar({ 
  user, 
  size = 'medium', // 'small', 'medium', 'large', 'xl'
  className = '',
  showName = false 
}) {
  const avatarUrl = getAvatarUrl(user?.avatar);
  const displayName = user?.name || 'Unknown';
  const initials = displayName.slice(0, 1).toUpperCase();
  const backgroundColor = getAvatarColor(displayName);
  
  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium', 
    large: 'avatar-large',
    xl: 'avatar-xl'
  };
  
  return (
    <div className={`avatar-container ${className}`}>
      <div className={`avatar ${sizeClasses[size]}`}>
        {avatarUrl ? (
          <>
            <img 
              src={avatarUrl} 
              alt={`${displayName}'s avatar`}
              className="avatar-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div 
              className="avatar-fallback"
              style={{ 
                backgroundColor,
                display: 'none'
              }}
            >
              {initials}
            </div>
          </>
        ) : (
          <div 
            className="avatar-fallback"
            style={{ backgroundColor }}
          >
            {initials}
          </div>
        )}
      </div>
      {showName && <span className="avatar-name">{displayName}</span>}
    </div>
  );
}