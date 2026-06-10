import { useMemo } from 'react';
import { Wallet, Users, ArrowUpRight, History, Plus } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { MOCK_DANA_KHUSUS } from '../../../shared/mock/anggaranData';
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';

const MOCK_HISTORY = [
    {
        id: 1,
        tanggal: '24 Mar 2024',
        donatur: 'Keluarga Bpk. Santoso',
        program: 'Pembangunan Gedung Karya',
        jumlah: 5000000,
        metode: 'Transfer Bank'
    },
    {
        id: 2,
        tanggal: '23 Mar 2024',
        donatur: 'Hamba Allah',
        program: 'Beasiswa Pendidikan Anak',
        jumlah: 1000000,
        metode: 'Tunai'
    }
];

/**
 * Typesafe Dana Khusus page showing dedicated donation programs.
 * Formatted with tight density spacing and standard flat borders.
 */
const DanaKhususPage = () => {
    const processedPrograms = useMemo(() => {
        return MOCK_DANA_KHUSUS.map((dana) => {
            const collectionPercent = dana.target > 0 ? (dana.terkumpul / dana.target) * 100 : 0;
            return {
                ...dana,
                collectionPercent,
            };
        });
    }, []);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dana Khusus</h2>
                    <p className="text-sm text-gray-500">Pengelolaan dana terikat dan donasi pembangunan.</p>
                </div>
                <Button className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 shadow-sm">
                    <Plus size={16} /> Buka Program Dana Baru
                </Button>
            </div>

            {/* Program cards - Seamless flat surfaces */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {processedPrograms.map((dana) => (
                    <Card key={dana.id} className="flex flex-col h-full border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100/50">
                                    <Wallet size={16} />
                                </div>
                                <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-2 py-0.5 rounded">
                                    AKTIF
                                </span>
                            </div>

                            <h3 className="font-bold text-sm text-slate-800 leading-snug tracking-tight">{dana.namaDana}</h3>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-tighter">ID: {dana.id}</p>

                            <div className="space-y-3 mt-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                                        <span>Progress Pengumpulan</span>
                                        <span className="text-blue-600">{Math.round(dana.collectionPercent)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full"
                                            style={{ width: `${Math.min(dana.collectionPercent, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="py-2.5 border-r border-slate-100">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Terkumpul</p>
                                        <p className="text-xs font-black text-slate-800 tracking-tight mt-0.5">{formatIDR(dana.terkumpul)}</p>
                                    </div>
                                    <div className="py-2.5 pl-1">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Target</p>
                                        <p className="text-xs font-black text-slate-800 tracking-tight mt-0.5">{formatIDR(dana.target)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[11px]">
                            <div className="flex items-center gap-1.5 font-bold text-slate-400">
                                <Users size={12} />
                                <span>124 Donatur</span>
                            </div>
                            <button className="font-black text-blue-600 flex items-center gap-0.5 hover:text-blue-700 transition-colors uppercase tracking-tight text-[10px]">
                                Lihat Detail <ArrowUpRight size={12} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Aktivitas Dana Khusus - Responsive Table using AdaptiveList */}
            <div className="space-y-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <History size={14} /> Riwayat Donasi Terakhir
                    </h3>
                </div>

                <AdaptiveList
                    data={MOCK_HISTORY}
                    desktopHeaders={[
                        'Tanggal',
                        'Donatur',
                        'Program',
                        'Jumlah',
                        'Metode'
                    ]}
                    renderDesktopRow={(item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-2.5 text-xs text-slate-500 font-medium border-r border-slate-100">{item.tanggal}</td>
                            <td className="px-5 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{item.donatur}</td>
                            <td className="px-5 py-2.5 text-xs font-semibold text-slate-600 border-r border-slate-100">{item.program}</td>
                            <td className="px-5 py-2.5 text-xs font-black text-right text-emerald-600 border-r border-slate-100">{formatIDR(item.jumlah)}</td>
                            <td className="px-5 py-2.5 text-center">
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500 border border-slate-200/50">
                                    {item.metode}
                                </span>
                            </td>
                        </tr>
                    )}
                    renderMobileCard={(item) => (
                        <div className="flex flex-col gap-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-700">{item.donatur}</span>
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500 border border-slate-200/50">
                                    {item.metode}
                                </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-600">{item.program}</div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-1">
                                <span>{item.tanggal}</span>
                                <span className="font-black text-emerald-600 text-xs">{formatIDR(item.jumlah)}</span>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export default DanaKhususPage;