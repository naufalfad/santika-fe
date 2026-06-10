import React, { useState, useLayoutEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface Ripple {
  key: number;
  x: number;
  y: number;
  size: number;
}

/**
 * GRASP: Information Expert + High Cohesion
 * Button adalah primitif aksi utama. Ia memegang semua logika yang
 * hanya relevan untuk dirinya sendiri: variant styling, ripple animation,
 * loading state, dan icon slots.
 *
 * DESIGN SYSTEM GUARD:
 * - rounded-none: MUTLAK pada outer button element.
 * - rounded-full pada RIPPLE CIRCLE dipertahankan secara sengaja.
 *   Ini adalah partikel efek animasi visual internal (pointer-events-none),
 *   BUKAN elemen UI yang menampilkan data. Menghapusnya akan membuat
 *   animasi bergerak sebagai kotak, merusak kualitas micro-interaction.
 *   Ref: Larman Ch.17 — Protected Variations: jangan ekspos internal
 *   implementation detail ke luar hanya karena aturan permukaan.
 * - Flat solid colors: tidak ada shadow berwarna berpijar atau glassmorphism.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  onClick,
  disabled,
  ...props
}: ButtonProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Self-inject ripple keyframes ke document head — zero external CSS dependency
  useLayoutEffect(() => {
    const styleId = 'santika-button-ripple-style';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.innerHTML = `
        @keyframes santika-ripple-effect {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-santika-ripple {
          animation: santika-ripple-effect 0.6s linear forwards;
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, []);

  /**
   * Variant map: flat solid colors sesuai Design System Guard.
   * Tidak ada shadow berwarna berpijar (rose-glow, blue-glow) — dihapus.
   * Hover state cukup menggelapkan warna 1 shade untuk feedback taktis.
   */
  const variantMap: Record<ButtonVariant, string> = {
    primary:
      'bg-slate-800 text-white hover:bg-slate-900 active:bg-black',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300',
    outline:
      'border border-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 active:bg-slate-100',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
    ghost:
      'text-slate-600 bg-transparent hover:bg-slate-100 active:bg-slate-200',
  };

  const sizeMap: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-[10px] gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5',
  };

  const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: Ripple = { key: Date.now(), x, y, size };
    setRipples((prev) => [...prev, newRipple]);

    if (onClick) {
      onClick(event);
    }
  };

  const cleanUpRipple = (key: number) => {
    setRipples((prev) => prev.filter((r) => r.key !== key));
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={handleTriggerClick}
      disabled={isDisabled}
      className={cn(
        // DESIGN SYSTEM GUARD: rounded-none — zero rounded corners
        'relative overflow-hidden rounded-none',
        'inline-flex items-center justify-center',
        'font-bold tracking-wide uppercase',
        // Micro-interaction: subtle press scale, smooth duration
        'transition-colors duration-150 active:scale-[0.97] transition-transform',
        'disabled:opacity-40 disabled:pointer-events-none select-none',
        // Cursor feedback: loading state
        isLoading && 'cursor-wait',
        variantMap[variant],
        sizeMap[size],
        className
      )}
      {...props}
    >
      {/* ── RIPPLE CONTAINER: partikel animasi internal ── */}
      {/* rounded-full DIPERTAHANKAN pada ripple — ini adalah efek visual partikel,
          bukan elemen UI. Ini adalah keputusan Protected Variations yang disengaja. */}
      <span className="absolute inset-0 block pointer-events-none">
        {ripples.map((ripple) => (
          <span
            key={ripple.key}
            onAnimationEnd={() => cleanUpRipple(ripple.key)}
            className="absolute bg-white/25 rounded-full animate-santika-ripple pointer-events-none opacity-100"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
      </span>

      {/* ── KONTEN: Icon kiri + children + icon kanan ── */}
      {isLoading ? (
        <Loader2 size={14} className="animate-spin shrink-0" />
      ) : (
        leftIcon && (
          <span className="shrink-0 flex items-center">{leftIcon}</span>
        )
      )}

      <span className="relative z-10">{children}</span>

      {!isLoading && rightIcon && (
        <span className="shrink-0 flex items-center">{rightIcon}</span>
      )}
    </button>
  );
};