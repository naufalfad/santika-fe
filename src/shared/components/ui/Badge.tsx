import React from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * GRASP: Information Expert
 * Badge memegang semua informasi tentang representasi status semantik.
 * Ia adalah indikator kontekstual (contextual indicator) — komponen paling
 * tepat untuk membawa informasi status secara ringkas.
 *
 * DESIGN SYSTEM GUARD:
 * - rounded-none: MUTLAK. Badge bukan pill, badge adalah tag status yang tegas.
 * - Flat solid colors sesuai palet DS: Slate, Emerald, Amber, Rose.
 * - Tipografi minimal: text-[10px] font-medium  .
 *   Hanya digunakan di contextual indicator yang butuh penegasan kognitif.
 */
export const Badge = ({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) => {
  const variantMap: Record<BadgeVariant, string> = {
    default:  'text-slate-600',
    success:  'text-emerald-600',
    warning:  'text-amber-600',
    danger:   'text-rose-600',
    info:     'text-blue-600',
    neutral:  'text-slate-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center',
        'text-xs font-semibold',
        'whitespace-nowrap',
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
};