import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
