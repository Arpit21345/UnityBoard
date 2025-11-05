import React from 'react';
import './PriorityBadge.css';

export default function PriorityBadge({ value }) {
  const v = (value || 'medium');
  const label = v.charAt(0).toUpperCase() + v.slice(1);
  return <span className={`badge badge-${v}`}>{label}</span>;
}
