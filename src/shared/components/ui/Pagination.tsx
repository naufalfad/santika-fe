import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationProps) => {
  if (totalItems === 0) {
    return null;
  }

  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-slate-200 bg-slate-50/50',
        className
      )}
    >
      {/* Total info */}
      <div className="text-[11px] font-medium text-slate-500">
        Menampilkan <span className="font-semibold text-slate-700">{from}</span>–
        <span className="font-semibold text-slate-700">{to}</span> dari{' '}
        <span className="font-semibold text-slate-700">{totalItems}</span> data
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          leftIcon={<ChevronLeft size={14} />}
          className="h-8 py-0 px-2.5 font-medium border-slate-200 hover:bg-white text-slate-600 disabled:opacity-30"
        >
          Sebelumnya
        </Button>

        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            // Simple pagination strategy: show current, first, last, and pages around current if totalPages is large
            const isNear = Math.abs(currentPage - pageNum) <= 1;
            const isFirstOrLast = pageNum === 1 || pageNum === totalPages;

            if (!isNear && !isFirstOrLast) {
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return (
                  <span key={pageNum} className="text-slate-400 text-xs px-1 select-none">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'h-8 w-8 text-xs font-semibold rounded-none border transition-all duration-150',
                  currentPage === pageNum
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:bg-slate-100'
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          rightIcon={<ChevronRight size={14} />}
          className="h-8 py-0 px-2.5 font-medium border-slate-200 hover:bg-white text-slate-600 disabled:opacity-30"
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
};
