import { ChevronRight } from 'lucide-react';
import { useActivityStore } from '../../../app/store/useActivityStore';

export const RecentActivity = () => {
    const logs = useActivityStore((state) => state.logs);
    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID').format(val);

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Aktivitas Terakhir</h3>
            <div className="space-y-4">
                {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-slate-700 leading-snug">{log.action}</p>
                            <p className="text-[9px] text-gray-400 mt-1">{log.time}</p>
                        </div>
                        {log.amount > 0 && (
                            <p className={`text-[11px] font-black whitespace-nowrap ${
                                log.type === 'in' ? 'text-emerald-600' : 
                                log.type === 'out' ? 'text-rose-600' : 'text-slate-800'
                            }`}>
                                {log.type === 'in' ? '+' : '-'} Rp {formatIDR(log.amount)}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 py-2 text-[10px] font-bold text-blue-600 flex items-center justify-between border-t border-slate-50 hover:bg-slate-50">
                Lihat semua aktivitas <ChevronRight size={14} />
            </button>
        </div>
    );
};