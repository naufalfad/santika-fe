import { Wallet, Gift, Users, Briefcase, ChevronRight } from 'lucide-react';
import { useApprovalStore } from '../../../app/store/useApprovalStore';
import { cn } from '../../../shared/utils/cn';

export const PendingApprovals = () => {
    const approvalRequests = useApprovalStore((state) => state.approvalRequests);
    
    // Get requests that are waiting for approval
    const pendingRequests = approvalRequests.filter((req) => req.status === 'Menunggu');

    const formatIDR = (val: number) => 
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const getIcon = (komisi: string) => {
        const k = komisi.toLowerCase();
        if (k.includes('liturgi')) return <Gift size={14} />;
        if (k.includes('omk')) return <Wallet size={14} />;
        if (k.includes('pse') || k.includes('sosial')) return <Users size={14} />;
        return <Briefcase size={14} />;
    };

    const getColorClass = (komisi: string) => {
        const k = komisi.toLowerCase();
        if (k.includes('liturgi')) return 'bg-purple-50 text-purple-600';
        if (k.includes('omk')) return 'bg-blue-50 text-blue-600';
        if (k.includes('pse') || k.includes('sosial')) return 'bg-emerald-50 text-emerald-600';
        return 'bg-amber-50 text-amber-600';
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Pengajuan Menunggu Persetujuan</h3>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">
                    {pendingRequests.length} Pengajuan
                </span>
            </div>

            <div className="space-y-3">
                {pendingRequests.slice(0, 4).map((req) => (
                    <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
                        <div className={cn("p-2 rounded-lg", getColorClass(req.komisi))}>
                            {getIcon(req.komisi)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{req.judul}</h4>
                            <p className="text-[10px] text-gray-400">{req.komisi}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-800">{formatIDR(req.nominal)}</p>
                            <p className="text-[9px] text-gray-400">{req.tanggal}</p>
                        </div>
                    </div>
                ))}
                {pendingRequests.length === 0 && (
                    <p className="text-xs text-center text-slate-400 py-6">
                        Tidak ada pengajuan yang memerlukan persetujuan saat ini.
                    </p>
                )}
            </div>

            <button className="w-full mt-4 py-2 text-[10px] font-bold text-blue-600 flex items-center justify-between border-t border-slate-50 hover:bg-slate-50">
                Lihat semua pengajuan <ChevronRight size={14} />
            </button>
        </div>
    );
};