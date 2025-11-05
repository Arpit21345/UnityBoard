import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectSearch.css';
import { apiJoinPrivateProject } from '../../services/projects.js';
import { useToast } from '../Toast/ToastContext.jsx';

export default function ProjectSearch() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [projectName, setProjectName] = useState('');
  const [projectPassword, setProjectPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleJoinPrivateProject() {
    if (!projectName.trim()) {
      notify('Please enter a project name', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // Try to join with password (optional for public projects)
      const result = await apiJoinPrivateProject(projectName.trim(), projectPassword.trim() || undefined);
      notify(result.message || 'Successfully joined project!', 'success');
      setProjectName('');
      setProjectPassword('');
      // Trigger projects refresh
      try { 
        window.dispatchEvent(new Event('projects-changed')); 
      } catch {}
      // Navigate to the project
      if (result.project?._id) {
        navigate(`/project/${result.project._id}`);
      }
    } catch (e) {
      console.error('Join failed:', e);
      const errorMsg = e.message || 'Failed to join project';
      
      if (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('does not exist')) {
        notify('Project not found. Please check the project name.', 'error');
      } else {
        notify(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="project-search">
      <div className="project-search-header">
        <h3>Join a Project</h3>
        <p>Enter the exact project name (case-sensitive) to join</p>
      </div>

      <div className="project-search-inputs">
        <div className="secure-join-section">
          <div className="join-inputs">
            <input
              type="text"
              placeholder="Project name (case-sensitive)..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinPrivateProject()}
              className="project-name-input"
            />
            <input
              type="password"
              placeholder="Project password (if required)..."
              value={projectPassword}
              onChange={(e) => setProjectPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinPrivateProject()}
              className="join-code-input"
            />
            <button 
              onClick={handleJoinPrivateProject}
              disabled={loading || !projectName.trim()}
              className="secure-join-btn"
            >
              {loading ? 'Joining...' : 'Join Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
