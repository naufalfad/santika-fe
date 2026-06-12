import React from 'react';
import { formatIDR, formatDate } from '../../../shared/utils/formatter';
import type { BkuRecord } from '../hooks/useLaporanKeuangan';

interface LaporanBKUProps {
    records: BkuRecord[];
    totalMasuk: number;
    totalKeluar: number;
    endingSaldo: number;
}

/**
 * Stateless presentation component for showing Buku Kas Umum records.
 * Keeps structural representation clean and separated from domain calculations.
 */
export const LaporanBKU: React.FC<LaporanBKUProps> = ({
    records,
    totalMasuk,
    totalKeluar,
    endingSaldo,
}) => {
    return (
        <div className="overflow-x-auto border border-slate-200 rounded-none shadow-none">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-100 text-slate-800 text-[11px] font-black uppercase border-b border-slate-200">
                        <th className="p-3 text-center w-12 border-r border-slate-200">No</th>
                        <th className="p-3 w-32 border-r border-slate-200">Tanggal</th>
                        <th className="p-3 border-r border-slate-200">Keterangan</th>
                        <th className="p-3 text-center w-28 border-r border-slate-200">Ref</th>
                        <th className="p-3 text-right w-40 border-r border-slate-200">Masuk (Dr)</th>
                        <th className="p-3 text-right w-40 border-r border-slate-200">Keluar (Cr)</th>
                        <th className="p-3 text-right bg-slate-200/80 w-44">Saldo</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {records.length > 0 ? (
                        records.map((item, idx) => (
                            <tr key={item.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 text-center text-gray-500 font-medium border-r border-slate-100">
                                    {idx + 1}
                                </td>
                                <td className="p-3 text-slate-600 font-medium whitespace-nowrap border-r border-slate-100">
                                    {formatDate(item.tanggal)}
                                </td>
                                <td className="p-3 font-semibold text-slate-700 leading-relaxed border-r border-slate-100">
                                    {item.keterangan}
                                </td>
                                <td className="p-3 text-center font-mono text-xs text-slate-800 font-semibold border-r border-slate-100">
                                    {item.ref}
                                </td>
                                <td className="p-3 text-right text-emerald-600 font-black border-r border-slate-100">
                                    {item.masuk > 0 ? formatIDR(item.masuk) : '-'}
                                </td>
                                <td className="p-3 text-right text-rose-600 font-black border-r border-slate-100">
                                    {item.keluar > 0 ? formatIDR(item.keluar) : '-'}
                                </td>
                                <td className="p-3 text-right font-black bg-slate-50/30 text-slate-800">
                                    {formatIDR(item.saldo)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400 font-medium bg-white">
                                Tidak ada catatan transaksi Buku Kas Umum untuk filter yang dipilih.
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr className="bg-slate-50 text-slate-800 font-bold text-sm border-t border-slate-200">
                        <td colSpan={4} className="p-4 text-right uppercase tracking-wider text-xs border-r border-slate-200">
                            Total Mutasi Periode Ini
                        </td>
                        <td className="p-4 text-right text-emerald-600 font-black border-r border-slate-200">
                            {formatIDR(totalMasuk)}
                        </td>
                        <td className="p-4 text-right text-rose-600 font-black border-r border-slate-200">
                            {formatIDR(totalKeluar)}
                        </td>
                        <td className="p-4 text-right bg-slate-100/80 text-slate-900 font-black underline decoration-double underline-offset-4">
                            {formatIDR(endingSaldo)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};