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
 * - Tipografi minimal: text-[10px] font-bold uppercase tracking-widest.
 *   Hanya digunakan di contextual indicator yang butuh penegasan kognitif.
 */
export const Badge = ({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) => {
  const variantMap: Record<BadgeVariant, string> = {
    default:  'bg-slate-100 text-slate-600',
    success:  'bg-emerald-100 text-emerald-700',
    warning:  'bg-amber-100 text-amber-700',
    danger:   'bg-rose-100 text-rose-700',
    info:     'bg-blue-100 text-blue-700',
    neutral:  'bg-slate-200 text-slate-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5',
        // DESIGN SYSTEM GUARD: rounded-none — badge adalah tag tegas, bukan pill
        'rounded-none',
        'text-[10px] font-bold uppercase tracking-widest',
        'whitespace-nowrap',
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
};