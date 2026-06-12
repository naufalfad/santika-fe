import { useMemo } from 'react';
import { useKasStore } from '../../../app/store/useKasStore';
import { formatIDR } from '../../../shared/utils/formatter';

/**
 * High-density tabular summary showing dynamic budget realizations.
 * Computes complex metrics via useMemo for optimal client performance.
 * Sharp-corner styling.
 */
export const BudgetSummary = () => {
    const kasKeluar = useKasStore((state) => state.kasKeluar);

    const BUDGET_CATEGORIES = useMemo(() => [
        { id: 1, nama: 'Pastoral & Liturgi', anggaran: 120000000, baseRealisasi: 68000000, matchKategori: 'Liturgi' },
        { id: 2, nama: 'Pendidikan Iman', anggaran: 80000000, baseRealisasi: 32000000, matchKategori: 'Kegiatan Komisi' },
        { id: 3, nama: 'Sosial (PSE)', anggaran: 60000000, baseRealisasi: 28000000, matchKategori: 'Sosial' },
        { id: 4, nama: 'Sarana & Prasarana', anggaran: 100000000, baseRealisasi: 45000000, matchKategori: 'Pembangunan' },
        { id: 5, nama: 'Administrasi', anggaran: 40000000, baseRealisasi: 18000000, matchKategori: 'Operasional' },
    ], []);

    // Compute budget aggregations incrementally based on current cash-out store states
    const { budgetSummary, totalAnggaran, totalRealisasi, totalSisa, totalPersen } = useMemo(() => {
        const summary = BUDGET_CATEGORIES.map((cat) => {
            const currentSum = kasKeluar
                .filter((item) => item.kategori.toLowerCase() === cat.matchKategori.toLowerCase())
                .reduce((sum, item) => sum + item.jumlah, 0);
            const realisasi = cat.baseRealisasi + currentSum;
            const sisa = cat.anggaran - realisasi;
            const persen = Math.round((realisasi / cat.anggaran) * 100);

            return {
                id: cat.id,
                nama: cat.nama,
                anggaran: cat.anggaran,
                realisasi,
                sisa,
                persen
            };
        });

        const tAnggaran = summary.reduce((sum, i) => sum + i.anggaran, 0);
        const tRealisasi = summary.reduce((sum, i) => sum + i.realisasi, 0);
        const tSisa = tAnggaran - tRealisasi;
        const tPersen = Math.round((tRealisasi / tAnggaran) * 100);

        return {
            budgetSummary: summary,
            totalAnggaran: tAnggaran,
            totalRealisasi: tRealisasi,
            totalSisa: tSisa,
            totalPersen: tPersen
        };
    }, [kasKeluar, BUDGET_CATEGORIES]);

    return (
        <div className="overflow-x-auto">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
                Ringkasan Anggaran Tahun 2025
            </h3>
            <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                        <th className="pb-2 font-bold">Program / Kegiatan</th>
                        <th className="pb-2 text-right">Anggaran</th>
                        <th className="pb-2 text-right">Realisasi</th>
                        <th className="pb-2 text-right">Sisa Anggaran</th>
                        <th className="pb-2 text-center w-20">%</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                    {budgetSummary.map((item) => (
                        <tr key={item.id} className="text-[11px] hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 font-bold text-slate-700">{item.id}. {item.nama}</td>
                            <td className="py-2.5 text-right text-slate-500 font-medium">{formatIDR(item.anggaran)}</td>
                            <td className="py-2.5 text-right text-slate-500 font-medium">{formatIDR(item.realisasi)}</td>
                            <td className="py-2.5 text-right font-bold text-slate-700">{formatIDR(item.sisa)}</td>
                            <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex-1 bg-slate-100 h-1 rounded-none overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-none" style={{ width: `${Math.min(item.persen, 100)}%` }}></div>
                                    </div>
                                    <span className="font-bold text-slate-500 w-5 text-right text-[10px]">{item.persen}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="text-[11px] font-black bg-blue-50/40 text-blue-800">
                        <td className="py-2.5 pl-2 font-black uppercase tracking-wider text-[10px]">Total</td>
                        <td className="py-2.5 text-right font-black">{formatIDR(totalAnggaran)}</td>
                        <td className="py-2.5 text-right font-black">{formatIDR(totalRealisasi)}</td>
                        <td className="py-2.5 text-right font-black">{formatIDR(totalSisa)}</td>
                        <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                                <div className="flex-1 bg-blue-100 h-1 rounded-none overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-none" style={{ width: `${Math.min(totalPersen, 100)}%` }}></div>
                                </div>
                                <span className="text-blue-600 font-black w-5 text-right text-[10px]">{totalPersen}%</span>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};