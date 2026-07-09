import { useMemo } from 'react';
import { formatIDR } from '../../../shared/utils/formatter';
import { useAnggaranQuery } from '../../anggaran/hooks/useAnggaranQuery';

export const BudgetSummary = () => {
    const currentYear = useMemo(() => new Date().getFullYear(), []);
    const { data: budgets = [], isLoading } = useAnggaranQuery({ tahun: currentYear });

    const budgetItems = useMemo(() => {
        return budgets.flatMap((b) =>
            b.items.map((item) => ({
                id: item.id,
                nama: item.name,
                anggaran: Number(item.plafon || 0),
                realisasi: Number(item.realisasi || 0),
                sisa: Number(item.sisa || 0),
                persen: Number(item.persentase || 0),
            }))
        );
    }, [budgets]);

    const { totalAnggaran, totalRealisasi, totalSisa, totalPersen } = useMemo(() => {
        const tAnggaran = budgetItems.reduce((sum, i) => sum + i.anggaran, 0);
        const tRealisasi = budgetItems.reduce((sum, i) => sum + i.realisasi, 0);
        const tSisa = tAnggaran - tRealisasi;
        const tPersen = tAnggaran > 0 ? Math.round((tRealisasi / tAnggaran) * 100) : 0;

        return {
            totalAnggaran: tAnggaran,
            totalRealisasi: tRealisasi,
            totalSisa: tSisa,
            totalPersen: tPersen,
        };
    }, [budgetItems]);

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xs font-semibold text-slate-400 shrink-0">
                Ringkasan Anggaran Tahun {currentYear}
            </h3>

            {/* Scrollable Area Tengah */}
            <div className="flex-1 overflow-y-auto no-scrollbar mt-4 pr-1">
                {isLoading ? (
                    <p className="text-[11px] text-center text-slate-400 font-medium py-8">
                        Memuat data anggaran...
                    </p>
                ) : budgetItems.length === 0 ? (
                    <p className="text-[11px] text-center text-slate-400 font-medium py-8">
                        Tidak ada data anggaran untuk tahun {currentYear}.
                    </p>
                ) : (
                    <table className="w-full text-left relative">
                        <thead className="sticky top-0 bg-white z-10">
                            <tr className="text-[10px] font-semibold text-slate-400 border-b border-slate-100">
                                <th className="pb-2 font-medium bg-white">Program / Kegiatan</th>
                                <th className="pb-2 text-right bg-white">Anggaran</th>
                                <th className="pb-2 text-right bg-white">Realisasi</th>
                                <th className="pb-2 text-right bg-white">Sisa Anggaran</th>
                                <th className="pb-2 text-center w-20 bg-white">%</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60">
                            {budgetItems.map((item, index) => (
                                <tr key={item.id} className="text-[11px] hover:bg-slate-50/50 transition-colors">
                                    <td className="py-2.5 font-medium text-slate-700">{index + 1}. {item.nama}</td>
                                    <td className="py-2.5 text-right text-slate-500 font-medium">{formatIDR(item.anggaran)}</td>
                                    <td className="py-2.5 text-right text-slate-500 font-medium">{formatIDR(item.realisasi)}</td>
                                    <td className="py-2.5 text-right font-medium text-slate-700">{formatIDR(item.sisa)}</td>
                                    <td className="py-2.5 px-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex-1 bg-slate-100 h-1 rounded-none overflow-hidden">
                                                <div className="bg-sky-500 h-full rounded-none" style={{ width: `${Math.min(item.persen, 100)}%` }}></div>

                                            </div>
                                            <span className="font-medium text-slate-500 w-5 text-right text-[10px]">{item.persen}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Sticky Footer Total */}
            <div className="mt-auto pt-3 border-t border-slate-200 shrink-0">
                <table className="w-full text-left">
                    <tbody>
                        <tr className="text-[11px] font-semibold text-blue-800">
                            <td className="py-1 font-semibold text-[10px]">Total</td>
                            <td className="py-1 text-right font-semibold">{isLoading ? '...' : formatIDR(totalAnggaran)}</td>
                            <td className="py-1 text-right font-semibold">{isLoading ? '...' : formatIDR(totalRealisasi)}</td>
                            <td className="py-1 text-right font-semibold">{isLoading ? '...' : formatIDR(totalSisa)}</td>
                            <td className="py-1 px-3 w-20">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex-1 bg-blue-100 h-1 rounded-none overflow-hidden">
                                        <div className="bg-blue-600 h-full rounded-none" style={{ width: `${Math.min(totalPersen, 100)}%` }}></div>
                                    </div>
                                    <span className="text-blue-600 font-semibold w-5 text-right text-[10px]">{isLoading ? '...' : `${totalPersen}%`}</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};