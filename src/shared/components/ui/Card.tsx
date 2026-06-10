import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => (
  <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)} {...props}>
    {children}
  </div>
);