import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  placeholder?: string;
}

/**
 * GRASP: Information Expert + High Cohesion
 * Select memiliki kohesi yang identik dengan Input secara semantik —
 * keduanya adalah form controls dengan pola label → wrapper → field → feedback.
 * Dipertahankan sebagai komponen terpisah (bukan merge) karena:
 * 1. HTMLSelectElement != HTMLInputElement — interface berbeda, tipe berbeda.
 * 2. Select memiliki keunikan: custom chevron arrow, placeholder option, appearance-none.
 *
 * DESIGN SYSTEM GUARD:
 * - rounded-none: MUTLAK. Dropdown tidak boleh berbentuk kapsul.
 * - focus:ring DIHAPUS → focus:border-slate-700 konsisten dengan Input.
 * - ChevronDown dari lucide menggantikan SVG inline manual (lebih maintainable).
 * - appearance-none DIPERTAHANKAN agar chevron custom terlihat di semua browser.
 *
 * ZERO DATA CLIPPING:
 * - pr-9 pada select memastikan teks value tidak tertumpuk ikon chevron kanan.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, label, error, hint, icon, placeholder, ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className="space-y-1 w-full min-w-0">
        {/* LABEL */}
        {label && (
          <label
            className={cn(
              'text-[10px] font-semibold   flex items-center gap-1.5',
              hasError ? 'text-rose-500' : 'text-slate-500'
            )}
          >
            {label}
            {props.required && (
              <span className="text-rose-500 text-xs leading-none" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* SELECT WRAPPER */}
        <div className="relative flex items-center">
          {/* Left Icon Slot */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          <select
            ref={ref}
            className={cn(
              'w-full bg-slate-50 text-sm text-slate-800 font-medium',
              'border border-transparent outline-none',
              // DESIGN SYSTEM GUARD: rounded-none — zero kapsul dropdown
              'rounded-none',
              // Padding presisi — pr-9 mencegah zero data clipping di atas chevron
              'px-4 py-2.5 pr-10',
              // Hapus appearance browser default, gunakan chevron custom
              'appearance-none',
              // Micro-interaction: background berubah dan border muncul halus saat fokus
              'transition-all duration-150 cursor-pointer',
              'focus:border-slate-300 focus:bg-white',
              // Icon offset kiri
              icon && 'pl-9',
              // State error
              hasError
                ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                : '',
              // State disabled
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50',
              className
            )}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={
              hasError
                ? `${props.id ?? props.name}-error`
                : hint
                ? `${props.id ?? props.name}-hint`
                : undefined
            }
            {...props}
          >
            {/* Placeholder option — disabled agar tidak bisa dipilih kembali */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          {/* Custom Chevron Arrow — pointer-events-none agar klik menembus ke select */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
            <ChevronDown size={14} strokeWidth={2.5} />
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {hasError && (
          <p
            id={`${props.id ?? props.name}-error`}
            className="text-[10px] text-rose-500 font-medium"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* HINT MESSAGE */}
        {!hasError && hint && (
          <p
            id={`${props.id ?? props.name}-hint`}
            className="text-[10px] text-slate-400 font-medium"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
