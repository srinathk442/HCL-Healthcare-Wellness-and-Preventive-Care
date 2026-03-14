import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

const PatientRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  if (!user || user.role !== 'patient') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PatientRoute;
