import React from 'react';
import { cn } from '../../utils/cn';

interface AdaptiveListProps<T> {
  data: T[];
  desktopHeaders: React.ReactNode[];
  renderDesktopRow: (item: T, index: number) => React.ReactNode;
  renderMobileCard: (item: T, index: number) => React.ReactNode;
  emptyStateMessage?: string;
  className?: string;
  /**
   * Jika true, tampilkan skeleton loading rows sebagai pengganti data.
   * Gunakan saat data sedang di-fetch dari API.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Jumlah baris skeleton saat isLoading = true.
   * @default 5
   */
  skeletonRows?: number;
}

/**
 * GRASP: Pure Fabrication + Polymorphism
 * AdaptiveList adalah Pure Fabrication: tidak ada entitas bisnis "AdaptiveList"
 * dalam domain paroki. Ia ada untuk memenuhi kebutuhan teknis polimorfisme layout:
 * satu data source, dua representasi berbeda berdasarkan breakpoint.
 *
 * GRASP: Polymorphism
 * Alih-alih `if (isMobile) renderMobile() else renderDesktop()`,
 * kita menggunakan CSS class switching (block md:hidden / hidden md:block) —
 * ini adalah Polymorphism berbasis CSS yang lebih performant karena
 * zero JS re-render untuk perubahan viewport.
 *
 * DESIGN SYSTEM GUARD:
 * - rounded-none: MUTLAK pada container outer dan semua elemen internal.
 * - border satu sisi (divide-y divide-slate-100) untuk pemisah baris — no box-inside-box.
 * - Skeleton loading state ditambahkan untuk UX yang tidak melompat (layout stability).
 */
export const AdaptiveList = <T,>({
  data,
  desktopHeaders,
  renderDesktopRow,
  renderMobileCard,
  emptyStateMessage = 'Tidak ada catatan data untuk ditampilkan.',
  className,
  isLoading = false,
  skeletonRows = 5,
}: AdaptiveListProps<T>) => {
  const hasData = data && data.length > 0;

  // ── SKELETON LOADING STATE ──
  if (isLoading) {
    return (
      // DESIGN SYSTEM GUARD: rounded-none pada container
      <div className={cn('overflow-hidden border border-slate-200 rounded-none bg-white shadow-sm', className)}>
        {/* Mobile skeleton */}
        <div className="block md:hidden divide-y divide-slate-100">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} className="p-3.5 animate-pulse">
              <div className="h-3 bg-slate-100 w-3/4 mb-2" />
              <div className="h-2.5 bg-slate-100 w-1/2" />
            </div>
          ))}
        </div>
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {desktopHeaders.map((_, idx) => (
                  <th key={idx} className="px-5 py-3">
                    <div className="h-2.5 bg-slate-100 animate-pulse w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {desktopHeaders.map((_, j) => (
                    <td key={j} className="px-5 py-3.5">
                      <div className="h-3 bg-slate-100 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    // DESIGN SYSTEM GUARD: rounded-none pada container outer
    <div className={cn('overflow-hidden border border-slate-200 rounded-none bg-white shadow-sm', className)}>
      {hasData ? (
        <>
          {/* MOBILE VIEW: high-density flat card rows, no nested border cards */}
          <div className="block md:hidden divide-y divide-slate-100 bg-white">
            {data.map((item, index) => (
              <div
                key={index}
                className="p-3.5 hover:bg-slate-50/60 transition-colors duration-100"
              >
                {renderMobileCard(item, index)}
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: standardized data table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-wider border-b border-slate-100">
                  {desktopHeaders.map((header, idx) => (
                    <th
                      key={idx}
                      className={cn(
                        'px-5 py-3 border-r border-slate-100 last:border-r-0 whitespace-nowrap',
                        // Alignment otomatis untuk kolom numerik
                        typeof header === 'string' &&
                          (header.toLowerCase().includes('jumlah') ||
                            header.toLowerCase().includes('nominal') ||
                            header.toLowerCase().includes('saldo') ||
                            header.toLowerCase().includes('total')) &&
                          'text-right'
                      )}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.map((item, index) => renderDesktopRow(item, index))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* EMPTY STATE */
        <div className="p-10 text-center bg-white">
          <p className="text-xs text-slate-400 font-medium">{emptyStateMessage}</p>
        </div>
      )}
    </div>
  );
};