import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../app/store/useAuthStore';
import { AccessDenied } from './AccessDenied';
import type { UserRole } from '../types/auth';

interface RouteGuardProps {
  allowableRoles: UserRole[];
  children: React.ReactNode;
}

export const RouteGuard = ({ allowableRoles, children }: RouteGuardProps) => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowableRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
