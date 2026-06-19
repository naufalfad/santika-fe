import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useActivityStore } from '../../../app/store/useActivityStore';
import { formatIDR } from '../../../shared/utils/formatter';

/**
 * Flat & Seamless recent activity list showing system audit logs.
 * Optimized with useMemo and utilizing centralized formatting.
 */
export const RecentActivity = () => {
    const logs = useActivityStore((state) => state.logs);

    // Memoize slice operation to reduce render computation
    const activeLogs = useMemo(() => {
        return logs.slice(0, 5);
    }, [logs]);

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400">
                Aktivitas Terakhir
            </h3>

            <div className="divide-y divide-slate-100/80">
                {activeLogs.map((log) => (
                    <div key={log.id} className="flex justify-between items-start gap-4 py-2.5">
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-slate-700 leading-snug">
                                {log.action}
                            </p>
                            <p className="text-[9px] text-slate-400 font-medium mt-1 tracking-tight">
                                {log.time}
                            </p>
                        </div>
                        {log.amount > 0 && (
                            <p className={`text-[11px] font-semibold whitespace-nowrap ${log.type === 'in' ? 'text-emerald-600' :
                                log.type === 'out' ? 'text-rose-600' : 'text-slate-800'
                                }`}>
                                {log.type === 'in' ? '+' : '-'} {formatIDR(log.amount)}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <button className="w-full pt-3.5 pb-1 text-[10px] font-semibold text-blue-600 flex items-center justify-between border-t border-slate-100 hover:text-blue-700 transition-colors">
                LIHAT SEMUA AKTIVITAS <ChevronRight size={12} />
            </button>
        </div>
    );
};