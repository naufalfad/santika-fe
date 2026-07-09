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
                    <tr className="text-slate-800 text-sm font-semibold border-b border-slate-200">

                        <th className="p-4 border-r border-slate-200">Aktivitas Arus Kas</th>
                        <th className="p-4 text-right w-64">Jumlah (IDR)</th>
                    </tr>
                </thead>
                <tbody className="text-sm bg-white divide-y divide-slate-100">
                    {/* ARUS KAS MASUK */}
                    <tr className="bg-slate-50/50 font-semibold text-slate-800">
                        <td className="p-3 pl-4 border-r text-[11px] text-slate-500">
                            Arus Kas Masuk (Penerimaan)
                        </td>
                        <td className="p-3"></td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r">
                            Penerimaan Kolekte
                        </td>
                        <td className="p-3 text-right text-sky-600 font-semibold">
                            {formatIDR(summary.inboundKolekte)}
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r">
                            Penerimaan Donasi / Aksi Sosial
                        </td>
                        <td className="p-3 text-right text-sky-600 font-semibold">
                            {formatIDR(summary.inboundDonasi)}
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r">
                            Dana Pembangunan Altar / Gedung
                        </td>
                        <td className="p-3 text-right text-sky-600 font-semibold">
                            {formatIDR(summary.inboundPembangunan)}
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r">
                            Persembahan & Pendapatan Lain-lain
                        </td>
                        <td className="p-3 text-right text-sky-600 font-semibold">
                            {formatIDR(summary.inboundLainnya)}
                        </td>
                    </tr>
                    <tr className="text-sky-600 font-medium border-b">
                        <td className="p-3 pl-6 border-r text-[11px]">
                            Total Penerimaan Kas
                        </td>
                        <td className="p-3 text-right font-semibold">
                            {formatIDR(summary.totalPenerimaanKas)}
                        </td>
                    </tr>


                    {/* ARUS KAS KELUAR */}
                    <tr className="bg-slate-50/50 font-semibold text-slate-800">
                        <td className="p-3 pl-4 border-r text-[11px] text-slate-500">
                            Arus Kas Keluar (Pengeluaran)
                        </td>
                        <td className="p-3"></td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r">
                            Pengeluaran Administrasi & Operasional Kantor
                        </td>
                        <td className="p-3 text-right text-rose-600 font-semibold">
                            {formatIDR(summary.outboundOperasional)}
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r">
                            Pengeluaran Liturgi & Perayaan Hari Raya
                        </td>
                        <td className="p-3 text-right text-rose-600 font-semibold">
                            {formatIDR(summary.outboundLiturgi)}
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3 pl-8 text-slate-600 font-semibold border-r">
                            Belanja Kegiatan Komisi & Pembinaan Iman
                        </td>
                        <td className="p-3 text-right text-rose-600 font-semibold">
                            {formatIDR(summary.outboundKegiatan)}
                        </td>
                    </tr>
                    <tr className="text-rose-600 font-medium border-b">
                        <td className="p-3 pl-6 border-r text-[11px]">
                            Total Pengeluaran Kas
                        </td>
                        <td className="p-3 text-right font-semibold">
                            {formatIDR(summary.totalPengeluaranKas)}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr className="text-slate-800 font-medium text-base border-t border-slate-200">
                        <td className="p-4 pl-4 border-r border-slate-200 text-xs">
                            Kenaikan / (Penurunan) Bersih Kas
                        </td>
                        <td className="p-4 text-right font-semibold bg-slate-100/80 text-slate-900">
                            {formatIDR(summary.kenaikanBersihKas)}
                        </td>
                    </tr>

                </tfoot>
            </table>
        </div>
    );
};