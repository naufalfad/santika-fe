import { useMemo } from 'react';
import { Wallet, Gift, Users, Briefcase, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKegiatanQuery, usePermohonanAnggaranQuery } from '../../approval/hooks/useApprovalQuery';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { cn } from '../../../shared/utils/cn';
import { formatIDR } from '../../../shared/utils/formatter';

export const PendingApprovals = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    // Fetch live activities & budget requests
    const { data: kegiatanList = [], isLoading: isKegiatanLoading } = useKegiatanQuery();
    const { data: anggaranList = [], isLoading: isAnggaranLoading } = usePermohonanAnggaranQuery();

    // Filter pending items based on user role
    const pendingItems = useMemo(() => {
        const items: Array<{
            id: string;
            type: 'kegiatan' | 'anggaran';
            title: string;
            sub: string;
            amountStr: string;
            dateStr: string;
            status: string;
            komisi: string;
        }> = [];

        kegiatanList.forEach(k => {
            const isPending = user?.role === 'PASTOR' ? k.status === 'DIREVIEW' :
                              user?.role === 'BENDAHARA' ? k.status === 'DIAJUKAN' :
                              (k.status === 'DIAJUKAN' || k.status === 'DIREVIEW');
            if (isPending) {
                items.push({
                    id: k.id,
                    type: 'kegiatan',
                    title: k.namaKegiatan,
                    sub: `Kegiatan • ${k.komisi?.nama || 'Komisi'}`,
                    amountStr: k.nomorKegiatan,
                    dateStr: new Date(k.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                    status: k.status,
                    komisi: k.komisi?.nama || 'Komisi'
                });
            }
        });

        anggaranList.forEach(a => {
            const isPending = user?.role === 'PASTOR' ? a.status === 'MENUNGGU_PERSETUJUAN' :
                              user?.role === 'BENDAHARA' ? a.status === 'DIAJUKAN' :
                              (a.status === 'DIAJUKAN' || a.status === 'MENUNGGU_PERSETUJUAN');
            if (isPending) {
                items.push({
                    id: a.id,
                    type: 'anggaran',
                    title: a.kegiatan?.namaKegiatan || 'Kebutuhan Anggaran',
                    sub: `Anggaran • ${a.kegiatan?.komisi?.nama || 'Komisi'}`,
                    amountStr: formatIDR(a.estimasiBiaya),
                    dateStr: new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                    status: a.status,
                    komisi: a.kegiatan?.komisi?.nama || 'Komisi'
                });
            }
        });

        return items;
    }, [kegiatanList, anggaranList, user]);

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

    const isLoading = isKegiatanLoading || isAnggaranLoading;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Menunggu Persetujuan
                </h3>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black rounded-full">
                    {isLoading ? '...' : `${pendingItems.length} Antrean`}
                </span>
            </div>

            <div className="divide-y divide-slate-100/80 max-h-[300px] overflow-y-auto pr-1">
                {isLoading ? (
                    <p className="text-[11px] text-center text-slate-400 font-medium py-8">
                        Memuat data antrean...
                    </p>
                ) : pendingItems.length === 0 ? (
                    <p className="text-[11px] text-center text-slate-400 font-medium py-8">
                        Tidak ada pengajuan yang memerlukan persetujuan Anda saat ini.
                    </p>
                ) : (
                    pendingItems.slice(0, 5).map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 py-2.5 transition-colors group cursor-pointer hover:bg-slate-50/40"
                            onClick={() => navigate('/approval')}
                        >
                            <div className={cn("p-1.5 rounded-lg shrink-0", getColorClass(item.komisi))}>
                                {getIcon(item.komisi)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-semibold">{item.sub}</p>
                            </div>

                            <div className="text-right shrink-0">
                                <p className="text-xs font-black text-slate-800 tracking-tight">
                                    {item.amountStr}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold tracking-tight">{item.dateStr}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={() => navigate('/approval')}
                className="w-full pt-3.5 pb-1 text-[10px] font-black text-blue-600 flex items-center justify-between border-t border-slate-100 hover:text-blue-700 transition-colors"
            >
                LIHAT ANTRIAN PERSETUJUAN <ChevronRight size={12} />
            </button>
        </div>
    );
};