import { useMemo } from 'react';
import { Wallet, Gift, Users, Briefcase, ChevronRight } from 'lucide-react';
import { useApprovalStore } from '../../../app/store/useApprovalStore';
import { cn } from '../../../shared/utils/cn';
import { formatIDR } from '../../../shared/utils/formatter';

/**
 * Unified and seamless list for pending expense approvals.
 * Standardized spacing without bulky bounding boxes.
 */
export const PendingApprovals = () => {
    const approvalRequests = useApprovalStore((state) => state.approvalRequests);

    // Memoize computation to extract only pending approvals
    const pendingRequests = useMemo(() => {
        return approvalRequests.filter((req) => req.status === 'Menunggu');
    }, [approvalRequests]);

    const getIcon = (komisi: string) => {
        const k = komisi.toLowerCase();
        if (k.includes('liturgi')) return <Gift size={12} />;
        if (k.includes('omk')) return <Wallet size={12} />;
        if (k.includes('pse') || k.includes('sosial')) return <Users size={12} />;
        return <Briefcase size={12} />;
    };

    const getColorClass = (komisi: string) => {
        const k = komisi.toLowerCase();
        if (k.includes('liturgi')) return 'bg-purple-50 text-purple-600 border border-purple-100/50';
        if (k.includes('omk')) return 'bg-blue-50 text-blue-600 border border-blue-100/50';
        if (k.includes('pse') || k.includes('sosial')) return 'bg-emerald-50 text-emerald-600 border border-emerald-100/50';
        return 'bg-amber-50 text-amber-600 border border-amber-100/50';
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Menunggu Persetujuan
                </h3>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black rounded-full">
                    {pendingRequests.length} Antrean
                </span>
            </div>

            <div className="divide-y divide-slate-100/80">
                {pendingRequests.slice(0, 4).map((req) => (
                    <div
                        key={req.id}
                        className="flex items-center gap-3 py-2.5 transition-colors group cursor-pointer hover:bg-slate-50/40"
                    >
                        <div className={cn("p-1.5 rounded-lg shrink-0", getColorClass(req.komisi))}>
                            {getIcon(req.komisi)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                {req.judul}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{req.komisi}</p>
                        </div>

                        <div className="text-right shrink-0">
                            <p className="text-xs font-black text-slate-800 tracking-tight">
                                {formatIDR(req.nominal)}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold tracking-tight">{req.tanggal}</p>
                        </div>
                    </div>
                ))}
                {pendingRequests.length === 0 && (
                    <p className="text-[11px] text-center text-slate-400 font-medium py-8">
                        Tidak ada pengajuan yang memerlukan persetujuan saat ini.
                    </p>
                )}
            </div>

            <button className="w-full pt-3.5 pb-1 text-[10px] font-black text-blue-600 flex items-center justify-between border-t border-slate-100 hover:text-blue-700 transition-colors">
                LIHAT SEMUA PENGAJUAN <ChevronRight size={12} />
            </button>
        </div>
    );
};