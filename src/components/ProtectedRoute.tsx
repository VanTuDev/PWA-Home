import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PawPrint } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'manager' | 'staff' | 'user')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center animate-bounce shadow-lg">
          <PawPrint className="text-on-primary w-10 h-10" />
        </div>
        <p className="text-primary font-bold text-sm tracking-widest uppercase animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!user) {
    // If attempting to access admin and not logged in, redirect to `/admin/login` or `/login`
    const isDashboardPath = location.pathname.startsWith('/admin');
    return <Navigate to={isDashboardPath ? "/admin/login" : "/login"} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
