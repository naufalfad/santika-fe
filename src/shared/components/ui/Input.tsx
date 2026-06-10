import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

/**
 * GRASP: Information Expert + High Cohesion
 * Input adalah primitif form paling fundamental. Ia memegang semua data
 * yang relevan untuk dirinya: label, value state (via HTMLInputElement),
 * error message, icon slot, dan right-element slot (untuk tombol show/hide password dll).
 *
 * DESIGN SYSTEM GUARD:
 * - rounded-none: MUTLAK. Form input tidak boleh berbentuk kapsul.
 * - focus:ring DIHAPUS (ring adalah artefak rounded UI). Diganti dengan
 *   focus:border-blue-500 + border tebal (border-2) saat fokus — ini lebih
 *   tajam secara visual dan selaras dengan filosofi sharp corner.
 * - Padding input presisi: px-4 py-2.5 untuk kepadatan yang nyaman di mobile.
 * - Warna border error menggunakan rose-500 (bukan red) sesuai palet DS.
 *
 * ZERO DATA CLIPPING:
 * - Input menggunakan w-full agar tidak ada data yang terpotong oleh container.
 * - min-w-0 pada wrapper mencegah overflow di dalam flex container.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, hint, icon, rightElement, ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className="space-y-1 w-full min-w-0">
        {/* LABEL */}
        {label && (
          <label
            className={cn(
              'text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5',
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

        {/* INPUT WRAPPER */}
        <div className="relative flex items-center">
          {/* Left Icon Slot */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full bg-white text-sm text-slate-800 font-medium',
              'border border-slate-200 outline-none',
              // DESIGN SYSTEM GUARD: rounded-none — zero kapsul form
              'rounded-none',
              // Padding presisi — sesuai mobile PWA standard
              'px-4 py-2.5',
              // Micro-interaction: border berubah warna saat fokus (bukan ring)
              // border-2 saat fokus menciptakan efek "active border" yang tajam dan tegas
              'transition-colors duration-150',
              'focus:border-slate-700 focus:bg-white',
              // Placeholder typography
              'placeholder:text-slate-300 placeholder:font-normal',
              // Icon offset kiri
              icon && 'pl-9',
              // Right element offset kanan
              rightElement && 'pr-10',
              // State error: border rose
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
          />

          {/* Right Element Slot — untuk suffix icon seperti eye toggle, clear, dll */}
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
              {rightElement}
            </div>
          )}
        </div>

        {/* ERROR MESSAGE */}
        {hasError && (
          <p
            id={`${props.id ?? props.name}-error`}
            className="text-[10px] text-rose-500 font-bold tracking-wide"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* HINT MESSAGE — muncul hanya jika tidak ada error */}
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

Input.displayName = 'Input';
