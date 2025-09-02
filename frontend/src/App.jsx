import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
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
import { ToastProvider } from './components/Toast/ToastContext.jsx';

export default function App() {
  const RootProviders = () => (
    <AiContextProvider>
      <ToastProvider>
        <Outlet />
        <AiHelper />
      </ToastProvider>
    </AiContextProvider>
  );

  const router = createBrowserRouter([
    {
      element: <RootProviders />,
      children: [
        { path: '/', element: <><Navbar /><Explore /></> },
        { path: '/login', element: <><Navbar /><Login /></> },
        { path: '/register', element: <><Navbar /><Register /></> },
        { path: '/invite/:token', element: <><Navbar /><InviteAccept /></> },
        { path: '/dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
        { path: '/project/:id', element: <ProtectedRoute><Project /></ProtectedRoute> },
      ],
    },
  ]);

  return <RouterProvider router={router} future={{ v7_startTransition: true, v7_relativeSplatPath: true }} />;
}
