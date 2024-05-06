import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App'
import Login from './components/login'
import Submit from './components/submit'
const container = document.getElementById('root');
const root = createRoot(container);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/submit',
    element: <Submit />,
  }
]);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
    <App />
  </StrictMode>
);