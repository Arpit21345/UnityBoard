import React, { useState } from 'react'
import './AdminLogin.css'

const AdminLogin = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('🚀 Admin login attempt:', form)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      })

      console.log('📡 Response status:', response.status)
      
      const data = await response.json()
      console.log('📦 Response data:', data)

      if (response.ok && data.ok) {
        console.log('✅ Admin login successful')
        onLogin()
      } else {
        console.log('❌ Admin login failed:', data.error)
        setError(data.error || 'Invalid admin credentials')
      }
    } catch (err) {
      console.error('💥 Connection error:', err)
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-header">
          <h1>🛡️ Admin Panel</h1>
          <p>UnityBoard Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="admin@unityboard.com"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Admin Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Admin Login'}
          </button>
        </form>

        <div className="admin-footer">
          <small>Authorized personnel only</small>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin