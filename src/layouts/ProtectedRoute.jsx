// src/layouts/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Se não tem token, chuta pro login
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Renderiza a página protegida
};