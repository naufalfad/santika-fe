import React from 'react';
import { formatIDR } from '../../../shared/utils/formatter';
import type { CashFlowSummary } from '../hooks/useLaporanKeuangan';

interface LaporanArusKasProps {
    summary: CashFlowSummary;
}

/**
 * Presentation component for displaying the Cash Flow Report.
 * Keeps structural representation clean and separated from domain calculations.
 */
export const LaporanArusKas: React.FC<LaporanArusKasProps> = ({ summary }) => {
    return (
        <div className="overflow-x-auto border border-slate-200 rounded-none shadow-none">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-100 text-slate-800 text-[12px] font-black uppercase border-b border-slate-200">
                        <th className="p-4 border-r border-slate-200">Aktivitas Arus Kas</th>
                        <th className="p-4 text-right w-64">Jumlah (IDR)</th>
                    </tr>
                </thead>
                <tbody className="text-sm bg-white divide-y divide-slate-100">
                    {/* ARUS KAS MASUK */}
                    <tr className="bg-slate-50/50 font-black text-slate-800">
                        <td className="p-3 pl-4 border-r border-slate-100 uppercase tracking-wider text-[11px] text-slate-500">
                            Arus Kas Masuk (Penerimaan)
                        </td>
                        <td className="p-3"></td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r border-slate-100">
                            Penerimaan Kolekte
                        </td>
                        <td className="p-3 text-right text-emerald-600 font-black">
                            {formatIDR(summary.inboundKolekte)}
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r border-slate-100">
                            Penerimaan Donasi / Aksi Sosial
                        </td>
                        <td className="p-3 text-right text-emerald-600 font-black">
                            {formatIDR(summary.inboundDonasi)}
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r border-slate-100">
                            Dana Pembangunan Altar / Gedung
                        </td>
                        <td className="p-3 text-right text-emerald-600 font-black">
                            {formatIDR(summary.inboundPembangunan)}
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r border-slate-100">
                            Persembahan & Pendapatan Lain-lain
                        </td>
                        <td className="p-3 text-right text-emerald-600 font-black">
                            {formatIDR(summary.inboundLainnya)}
                        </td>
                    </tr>
                    <tr className="bg-slate-50 text-emerald-600 font-bold border-b border-slate-100">
                        <td className="p-3 pl-6 border-r border-slate-100 uppercase text-[11px] tracking-wider">
                            Total Penerimaan Kas
                        </td>
                        <td className="p-3 text-right font-black">
                            {formatIDR(summary.totalPenerimaanKas)}
                        </td>
                    </tr>

                    {/* ARUS KAS KELUAR */}
                    <tr className="bg-slate-50/50 font-black text-slate-800">
                        <td className="p-3 pl-4 border-r border-slate-100 uppercase tracking-wider text-[11px] text-slate-500">
                            Arus Kas Keluar (Pengeluaran)
                        </td>
                        <td className="p-3"></td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r border-slate-100">
                            Pengeluaran Administrasi & Operasional Kantor
                        </td>
                        <td className="p-3 text-right text-rose-600 font-black">
                            {formatIDR(summary.outboundOperasional)}
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r border-slate-100">
                            Pengeluaran Liturgi & Perayaan Hari Raya
                        </td>
                        <td className="p-3 text-right text-rose-600 font-black">
                            {formatIDR(summary.outboundLiturgi)}
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r border-slate-100">
                            Belanja Kegiatan Komisi & Pembinaan Iman
                        </td>
                        <td className="p-3 text-right text-rose-600 font-black">
                            {formatIDR(summary.outboundKegiatan)}
                        </td>
                    </tr>
                    <tr className="bg-slate-50 text-rose-600 font-bold border-b border-slate-100">
                        <td className="p-3 pl-6 border-r border-slate-100 uppercase text-[11px] tracking-wider">
                            Total Pengeluaran Kas
                        </td>
                        <td className="p-3 text-right font-black">
                            {formatIDR(summary.totalPengeluaranKas)}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr className="bg-slate-50 text-slate-800 font-bold text-base border-t border-slate-200">
                        <td className="p-4 pl-4 uppercase border-r border-slate-200 tracking-wider text-xs">
                            Kenaikan / (Penurunan) Bersih Kas
                        </td>
                        <td className="p-4 text-right font-black bg-slate-100/80 text-slate-900 underline decoration-double underline-offset-4">
                            {formatIDR(summary.kenaikanBersihKas)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};