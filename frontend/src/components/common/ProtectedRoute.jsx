import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF1F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#B92F60] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#30232A]/70">Checking studio credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
