import React, { useEffect, useState } from 'react';
import { apiListProjectMembers } from '../../services/projects.js';

export default function MemberPicker({ projectId, value, onChange, placeholder = 'Assign member' }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await apiListProjectMembers(projectId);
        setMembers(list);
      } catch (_) {}
      setLoading(false);
    })();
  }, [projectId]);

  return (
    <select value={value || ''} onChange={e => onChange?.(e.target.value)} disabled={loading}>
      <option value="">{placeholder}</option>
      {members.map(m => (
        <option key={m.user} value={m.user}>{m.name || m.email}</option>
      ))}
    </select>
  );
}
