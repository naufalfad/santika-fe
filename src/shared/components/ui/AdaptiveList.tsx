// --- FILE: src\shared\components\ui\AdaptiveList.tsx-- -
import React from 'react';
import { cn } from '../../utils/cn';
import { Inbox } from 'lucide-react';
import { Pagination } from './Pagination';

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
  /**
   * Konfigurasi pagination (opsional).
   */
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
}

export const AdaptiveList = <T,>({
  data,
  desktopHeaders,
  renderDesktopRow,
  renderMobileCard,
  emptyStateMessage = 'Tidak ada catatan data untuk ditampilkan.',
  className,
  isLoading = false,
  skeletonRows = 5,
  pagination,
}: AdaptiveListProps<T>) => {
  const hasData = data && data.length > 0;

  // ── SKELETON LOADING STATE ──
  if (isLoading) {
    return (
      <div className={cn('overflow-hidden border border-slate-200 rounded-none bg-white shadow-sm', className)}>
        {/* Mobile skeleton */}
        <div className="block md:hidden divide-y divide-slate-100">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} className="p-3.5 animate-pulse">
              <div className="h-3 bg-slate-200/60 w-3/4 mb-2 rounded-none" />
              <div className="h-2.5 bg-slate-200/60 w-1/2 rounded-none" />
            </div>
          ))}
        </div>
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
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
                    <td key={j} className="px-5 py-3.5 border-r last:border-r-0">
                      <div className="h-3 bg-slate-200/60 w-full max-w-[120px] rounded-none" />
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
    <div className={cn('overflow-hidden border border-slate-200 rounded-none bg-white shadow-sm', className)}>
      {hasData ? (
        <>
          {/* MOBILE VIEW */}
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

          {/* DESKTOP VIEW: Standardized Data Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-600 text-xs font-semibold border-b border-slate-200 bg-slate-50/80">
                  {desktopHeaders.map((header, idx) => (
                    <th
                      key={idx}
                      className={cn(
                        'px-5 py-3.5 border-r border-slate-200 last:border-r-0 whitespace-nowrap',
                        // Alignment otomatis untuk kolom numerik (Rata Kanan)
                        typeof header === 'string' &&
                        (header.toLowerCase().includes('jumlah') ||
                          header.toLowerCase().includes('nominal') ||
                          header.toLowerCase().includes('saldo') ||
                          header.toLowerCase().includes('total')) &&
                        'text-right',
                        // Alignment otomatis untuk Status dan Aksi (Rata Tengah)
                        typeof header === 'string' &&
                        (header.toLowerCase() === 'aksi' ||
                          header.toLowerCase() === 'status' || // 👈 TAMBAHKAN INI
                          header === '') &&
                        'text-center'
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

          {/* PAGINATION CONTROLS */}
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={pagination.onPageChange}
            />
          )}
        </>
      ) : (
        /* EMPTY STATE */
        <div className="p-12 flex flex-col items-center justify-center bg-white text-center">
          <div className="mb-3 bg-slate-100 border border-slate-200/50 p-3 rounded-none text-slate-400">
            <Inbox size={24} />
          </div>
          <p className="text-xs text-slate-500 font-medium">{emptyStateMessage}</p>
        </div>
      )}
    </div>
  );
};