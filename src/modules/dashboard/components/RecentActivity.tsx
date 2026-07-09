import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuditLogsQuery } from '../../audit-trail/hooks/useAuditLogsQuery';
import { formatIDR } from '../../../shared/utils/formatter';

export const RecentActivity = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useAuditLogsQuery({ limit: 5 });

    const logs = data?.logs || [];

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xs font-semibold text-slate-400 shrink-0">
                Aktivitas Terakhir
            </h3>

            {/* Scrollable Area Tengah */}
            <div className="flex-1 overflow-y-auto no-scrollbar mt-3 pr-1 divide-y divide-slate-100/80">
                {isLoading ? (
                    <p className="text-[11px] text-center text-slate-400 font-medium py-8">
                        Memuat data aktivitas...
                    </p>
                ) : logs.length === 0 ? (
                    <p className="text-[11px] text-center text-slate-400 font-medium py-8">
                        Tidak ada aktivitas terbaru.
                    </p>
                ) : (
                    logs.map((log) => {
                        const amountVal = Number(log.amount || 0);
                        const isIncome = log.type === 'IN';
                        const isExpense = log.type === 'OUT';

                        const formattedTime = new Date(log.tanggal).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        }) + ' WIB';

                        return (
                            <div key={log.id} className="flex justify-between items-start gap-4 py-2.5">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-medium text-slate-700 leading-snug truncate" title={log.action}>
                                        {log.action}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-medium mt-1 tracking-tight">
                                        {formattedTime}
                                    </p>
                                </div>
                                {amountVal > 0 && (
                                    <p className={`text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                                        isIncome ? 'text-sky-600' : isExpense ? 'text-rose-600' : 'text-slate-800'

                                    }`}>
                                        {isIncome ? '+' : isExpense ? '-' : ''} {formatIDR(amountVal)}
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Sticky Tombol memeluk lantai card */}
            <button
                onClick={() => navigate('/audit-trail')}
                className="w-full pt-3.5 pb-1 text-[10px] font-semibold text-blue-600 flex items-center justify-between border-t border-slate-100 hover:text-blue-700 transition-colors shrink-0"
            >
                LIHAT SEMUA AKTIVITAS <ChevronRight size={12} />
            </button>
        </div>
    );
};