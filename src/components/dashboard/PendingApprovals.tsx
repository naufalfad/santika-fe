import React from 'react';
import { Wallet, Gift, Users, ToolCase, ChevronRight } from 'lucide-react';
import { PENDING_REQUESTS } from '../../mock/dashboardData';
import { cn } from '../../utils/cn';

export const PendingApprovals = () => {
    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'wallet': return <Wallet size={14} />;
            case 'gift': return <Gift size={14} />;
            case 'users': return <Users size={14} />;
            case 'tool': return <ToolCase size={14} />;
            default: return <Wallet size={14} />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Pengajuan Menunggu Persetujuan</h3>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">4 Pengajuan</span>
            </div>

            <div className="space-y-3">
                {PENDING_REQUESTS.map((req) => (
                    <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
                        <div className={cn("p-2 rounded-lg",
                            req.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                req.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                    req.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        )}>
                            {getIcon(req.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{req.judul}</h4>
                            <p className="text-[10px] text-gray-400">{req.komisi}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-800">{formatIDR(req.nominal)}</p>
                            <p className="text-[9px] text-gray-400">{req.tgl}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-2 text-[10px] font-bold text-blue-600 flex items-center justify-between border-t border-slate-50 hover:bg-slate-50">
                Lihat semua pengajuan <ChevronRight size={14} />
            </button>
        </div>
    );
};