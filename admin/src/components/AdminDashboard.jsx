import React, { useState, useEffect } from 'react'
import './AdminDashboard.css'

const AdminDashboard = ({ onLogout }) => {
  const BACKEND_URL = `http://localhost:${import.meta.env.VITE_BACKEND_PORT || 5000}`
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      setError('')

      const headers = {
        'Authorization': 'admin-authenticated',
        'Content-Type': 'application/json'
      }

      console.log('🔄 Loading admin data...')

      // Fetch users
      const usersResponse = await fetch('/api/admin/users', { headers })
      const usersData = await usersResponse.json()
      console.log('👥 Users response:', usersData)
      
      // Fetch projects  
      const projectsResponse = await fetch('/api/admin/projects', { headers })
      const projectsData = await projectsResponse.json()
      console.log('📁 Projects response:', projectsData)

      if (usersData.ok) {
        const users = usersData.users || []
        console.log('👥 Users with avatars:', users.map(u => ({ name: u.name, avatar: u.avatar })))
        setUsers(users)
      }
      if (projectsData.ok) setProjects(projectsData.projects || [])

      console.log('✅ Admin data loaded successfully')

    } catch (err) {
      console.error('💥 Admin data error:', err)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin data...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-nav">
          <h1>🛡️ UnityBoard Admin</h1>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-content">
        <nav className="admin-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            👥 Users ({users.length})
          </button>
          <button 
            className={activeTab === 'projects' ? 'active' : ''} 
            onClick={() => setActiveTab('projects')}
          >
            📁 Projects ({projects.length})
          </button>
        </nav>

        {error && <div className="error-banner">{error}</div>}

        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-number">{users.length}</div>
              </div>
              <div className="stat-card">
                <h3>Total Projects</h3>
                <div className="stat-number">{projects.length}</div>
              </div>
              <div className="stat-card">
                <h3>Public Projects</h3>
                <div className="stat-number">
                  {projects.filter(p => p.visibility === 'public').length}
                </div>
              </div>
              <div className="stat-card">
                <h3>Private Projects</h3>
                <div className="stat-number">
                  {projects.filter(p => p.visibility === 'private').length}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td className="user-name">
                        <div className="user-avatar-container">
                          {user.avatar ? (
                            <img 
                              src={user.avatar.startsWith('http') ? user.avatar : `${BACKEND_URL}${user.avatar}`} 
                              alt={user.name} 
                              className="user-avatar"
                              onError={(e) => {
                                console.log('Avatar failed to load:', e.target.src);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="user-avatar-fallback"
                            style={{ display: user.avatar ? 'none' : 'flex' }}
                          >
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        </div>
                        <span className="user-name-text">{user.name}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        {projects.filter(p => 
                          p.members?.some(m => String(m.user) === String(user._id))
                        ).length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="projects-section">
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Owner</th>
                    <th>Visibility</th>
                    <th>Members</th>
                    <th>Created</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(project => {
                    const owner = users.find(u => 
                      project.members?.some(m => String(m.user) === String(u._id) && m.role === 'owner')
                    )
                    return (
                      <tr key={project._id}>
                        <td className="project-name">
                          <strong>{project.name}</strong>
                          {project.description && (
                            <div className="project-desc">{project.description}</div>
                          )}
                        </td>
                        <td>{owner?.name || 'Unknown'}</td>
                        <td>
                          <span className={`visibility-badge ${project.visibility}`}>
                            {project.visibility}
                          </span>
                        </td>
                        <td>{project.members?.length || 0}</td>
                        <td>{formatDate(project.createdAt)}</td>
                        <td>
                          <span className={`status-badge ${project.status || 'active'}`}>
                            {project.status || 'active'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard