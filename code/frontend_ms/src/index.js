import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App'
import User from './components/user'
import Admin from './components/admin'
import Login from './components/login'
import Registration from './components/register';
const container = document.getElementById('root');
const root = createRoot(container);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/user',
    element: <User />,
  },
  {
    path: '/register',
    element: <Registration />,
  },
  {
    path: '/admin',
    element: <Admin />,
  }
]);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
    <App />
  </StrictMode>
);