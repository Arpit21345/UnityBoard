import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import GlobalNavbar from './components/layout/GlobalNavbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Explore from './pages/Explore/Explore.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Profile from './pages/Profile/Profile.jsx';
import UserSettings from './pages/Settings/Settings.jsx';
import Notifications from './pages/Notifications/Notifications.jsx';
import Logout from './pages/Logout/Logout.jsx';
import Project from './pages/Project/Project.jsx';
import PastProjects from './pages/PastProjects/PastProjects.jsx';
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
  { path: '/', element: <><GlobalNavbar compact /><Explore /></> },
  { path: '/login', element: <><GlobalNavbar compact /><Login /></> },
  { path: '/register', element: <><GlobalNavbar compact /><Register /></> },
  { path: '/invite/:token', element: <><GlobalNavbar compact /><InviteAccept /></> },
        { path: '/dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/past-projects', element: <ProtectedRoute><PastProjects /></ProtectedRoute> },
        { path: '/project/:id', element: <ProtectedRoute><Project /></ProtectedRoute> },
  { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '/settings', element: <ProtectedRoute><UserSettings /></ProtectedRoute> },
  { path: '/notifications', element: <ProtectedRoute><Notifications /></ProtectedRoute> },
  { path: '/logout', element: <ProtectedRoute><Logout /></ProtectedRoute> },
      ],
    },
  ]);

  return <RouterProvider router={router} future={{ v7_startTransition: true, v7_relativeSplatPath: true }} />;
}
