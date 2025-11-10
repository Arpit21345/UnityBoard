import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('adminToken') === 'admin-authenticated'
  })

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true)
    localStorage.setItem('adminToken', 'admin-authenticated')
  }

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false)
    localStorage.removeItem('adminToken')
  }

  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route 
          path="/login" 
          element={
            isAdminAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <AdminLogin onLogin={handleAdminLogin} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAdminAuthenticated ? 
            <AdminDashboard onLogout={handleAdminLogout} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App