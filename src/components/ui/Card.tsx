import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);