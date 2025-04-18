import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PrivateRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>;
  }
  
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;