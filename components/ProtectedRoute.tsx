
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'worker' | 'customer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { adminUser, workerUser, user } = useStore();
  const location = useLocation();

  const isAuthenticated = () => {
    if (role === 'admin') return !!adminUser;
    if (role === 'worker') return !!workerUser;
    return !!user;
  };

  if (!isAuthenticated()) {
    // Redirect to appropriate login based on intended role
    const loginPath = role === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
