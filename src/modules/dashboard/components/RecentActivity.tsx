import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useActivityStore } from '../../../app/store/useActivityStore';
import { formatIDR } from '../../../shared/utils/formatter';

export const RecentActivity = () => {
    const logs = useActivityStore((state) => state.logs);

    const activeLogs = useMemo(() => {
        return logs.slice(0, 5);
    }, [logs]);

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xs font-semibold text-slate-400 shrink-0">
                Aktivitas Terakhir
            </h3>

            {/* Scrollable Area Tengah */}
            <div className="flex-1 overflow-y-auto no-scrollbar mt-3 pr-1 divide-y divide-slate-100/80">
                {activeLogs.map((log) => (
                    <div key={log.id} className="flex justify-between items-start gap-4 py-2.5">
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-slate-700 leading-snug truncate">
                                {log.action}
                            </p>
                            <p className="text-[9px] text-slate-400 font-medium mt-1 tracking-tight">
                                {log.time}
                            </p>
                        </div>
                        {log.amount > 0 && (
                            <p className={`text-[11px] font-semibold whitespace-nowrap shrink-0 ${log.type === 'in' ? 'text-emerald-600' :
                                log.type === 'out' ? 'text-rose-600' : 'text-slate-800'
                                }`}>
                                {log.type === 'in' ? '+' : '-'} {formatIDR(log.amount)}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Sticky Tombol memeluk lantai card */}
            <button className="mt-auto pt-3.5 pb-1 text-[10px] font-semibold text-blue-600 flex items-center justify-between border-t border-slate-100 hover:text-blue-700 transition-colors shrink-0">
                LIHAT SEMUA AKTIVITAS <ChevronRight size={12} />
            </button>
        </div>
    );
};