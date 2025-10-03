import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../context-api/user-context/UseUser';
import Spinner from '../Spinner';

const PrivateRoutes = () => {
  const { user, token, loading } = useUser();

  if (loading) {
    return <Spinner />;
  }

  return (user && token) ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoutes;