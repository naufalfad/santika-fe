import React from 'react';
import { formatIDR } from '../../../shared/utils/formatter';
import type { BudgetRealisation } from '../hooks/useLaporanKeuangan';

interface LaporanRealisasiProps {
    realisations: BudgetRealisation[];
}

/**
 * Presentation component for showing Annual Budget Realisation details.
 * Modular, typesafe, and fully decoupled from store context.
 */
export const LaporanRealisasi: React.FC<LaporanRealisasiProps> = ({ realisations }) => {
    // Aggregate total metrics
    const totalAnggaran = realisations.reduce((sum, item) => sum + item.anggaran, 0);
    const totalRealisasi = realisations.reduce((sum, item) => sum + item.realisasi, 0);
    const totalSisa = realisations.reduce((sum, item) => sum + item.sisa, 0);
    const totalPersen = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

    return (
        <div className="overflow-x-auto shadow-sm rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-100 text-slate-800 text-[11px] font-black uppercase border-b border-gray-200">
                        <th className="p-3 border-r border-gray-200">Pos Anggaran</th>
                        <th className="p-3 text-right border-r border-gray-200 w-48">Plafon Anggaran</th>
                        <th className="p-3 text-right border-r border-gray-200 w-48">Realisasi Pengeluaran</th>
                        <th className="p-3 text-center border-r border-gray-200 w-32">Serapan (%)</th>
                        <th className="p-3 text-right w-48">Sisa Pagu</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {realisations.length > 0 ? (
                        realisations.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 font-semibold text-slate-700 border-r border-gray-200">
                                    {item.nama}
                                </td>
                                <td className="p-3 text-right text-slate-600 font-medium border-r border-gray-200">
                                    {formatIDR(item.anggaran)}
                                </td>
                                <td className="p-3 text-right text-rose-600 font-black border-r border-gray-200">
                                    {formatIDR(item.realisasi)}
                                </td>
                                <td className="p-3 border-r border-gray-200 text-center">
                                    <span
                                        className={`inline-block px-2.5 py-1 rounded text-xs font-black tracking-tight ${item.persen > 80
                                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            }`}
                                    >
                                        {Math.round(item.persen)}%
                                    </span>
                                </td>
                                <td className="p-3 text-right text-emerald-600 font-black bg-slate-50/30">
                                    {formatIDR(item.sisa)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-medium bg-white">
                                Tidak ada data realisasi anggaran yang dapat ditampilkan.
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr className="bg-slate-900 text-white font-bold text-sm">
                        <td className="p-4 uppercase border-r border-slate-700 text-xs tracking-wider">
                            Total Pagu Anggaran Paroki
                        </td>
                        <td className="p-4 text-right border-r border-slate-700 font-black">
                            {formatIDR(totalAnggaran)}
                        </td>
                        <td className="p-4 text-right border-r border-slate-700 text-rose-300 font-black">
                            {formatIDR(totalRealisasi)}
                        </td>
                        <td className="p-4 text-center border-r border-slate-700 font-black text-amber-400 text-xs">
                            {Math.round(totalPersen)}%
                        </td>
                        <td className="p-4 text-right bg-slate-800 text-emerald-400 font-black underline decoration-double underline-offset-4">
                            {formatIDR(totalSisa)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};