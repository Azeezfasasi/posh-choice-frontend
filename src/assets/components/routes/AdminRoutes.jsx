import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../context-api/user-context/UseUser';
import Spinner from '../Spinner';

// Only admins and super admins; the backend enforces the same rule on every admin API
const AdminRoutes = () => {
  const { user, token, loading, isAdmin } = useUser();

  if (loading || (token && !user)) {
    return <Spinner />;
  }

  if (!user || !token) return <Navigate to="/login" replace />;
  return isAdmin ? <Outlet /> : <Navigate to="/app/dashboard" replace />;
};

export default AdminRoutes;
