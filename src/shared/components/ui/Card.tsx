import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * GRASP: Information Expert + High Cohesion
 * Card adalah primitif container paling dasar dalam sistem desain SANTIKA.
 * Ia hanya memegang satu tanggung jawab tunggal: menyediakan surface area
 * yang konsisten, bersih, dan presisi untuk konten turunannya.
 *
 * DESIGN SYSTEM GUARD:
 * - rounded-none: MUTLAK. Tidak ada sudut membulat pada elemen UI.
 * - Shadow elevation dipertahankan untuk memberi depth cue visual (bukan glassmorphism).
 * - border tipis slate-200 memastikan card terlihat di atas bg-slate-50 tanpa
 *   menciptakan "box-inside-box" yang kontras berlebihan.
 */
export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        // DESIGN SYSTEM GUARD: rounded-none — zero rounded corners, no exception
        'bg-white rounded-none border border-slate-200 shadow-sm',
        // Micro-interaction: shadow elevation naik halus saat hover
        'hover:shadow-md hover:border-slate-300/80',
        // Transition hanya pada shadow dan border-color, bukan transform (hemat GPU)
        'transition-shadow duration-300 ease-in-out',
        'overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};