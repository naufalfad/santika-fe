import React from 'react';
import { useAuthStore } from '../../app/store/useAuthStore';
import { AccessDenied } from './AccessDenied';
import type { UserRole } from '../types/auth';

interface RouteGuardProps {
  allowableRoles: UserRole[];
  children: React.ReactNode;
}

export const RouteGuard = ({ allowableRoles, children }: RouteGuardProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowableRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
