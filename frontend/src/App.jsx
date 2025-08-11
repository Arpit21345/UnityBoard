import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Explore from './pages/Explore/Explore.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Project from './pages/Project/Project.jsx';
import AiHelper from './components/AiHelper/AiHelper.jsx';
import { AiContextProvider } from './components/AiHelper/AiContext.jsx';
import InviteAccept from './pages/InviteAccept/InviteAccept.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AiContextProvider>
        {
          // Public pages use Navbar; private pages use Topbar via AppLayout
        }
        <Routes>
          <Route path="/" element={<><Navbar /><Explore /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />
          <Route path="/register" element={<><Navbar /><Register /></>} />
          <Route path="/invite/:token" element={<><Navbar /><InviteAccept /></>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><Project /></ProtectedRoute>} />
        </Routes>
        <AiHelper />
      </AiContextProvider>
    </BrowserRouter>
  );
}
