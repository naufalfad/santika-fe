import React from 'react';
import { BUDGET_SUMMARY } from '../../mock/dashboardData';

export const BudgetSummary = () => {
    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 tracking-tight">Ringkasan Anggaran Tahun 2025</h3>
            <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                        <th className="pb-3 font-bold">Program / Kegiatan</th>
                        <th className="pb-3 text-right">Anggaran</th>
                        <th className="pb-3 text-right">Realisasi</th>
                        <th className="pb-3 text-right">Sisa Anggaran</th>
                        <th className="pb-3 text-center w-24">%</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {BUDGET_SUMMARY.map((item) => (
                        <tr key={item.id} className="text-[11px] hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-bold text-slate-700">{item.id}. {item.nama}</td>
                            <td className="py-3 text-right text-slate-500">{formatIDR(item.anggaran)}</td>
                            <td className="py-3 text-right text-slate-500">{formatIDR(item.realisasi)}</td>
                            <td className="py-3 text-right font-bold text-slate-700">{formatIDR(item.sisa)}</td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full" style={{ width: `${item.persen}%` }}></div>
                                    </div>
                                    <span className="font-bold text-slate-600 w-6 text-right">{item.persen}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="text-[11px] font-black bg-blue-50/50">
                        <td className="py-3 pl-2 text-blue-600 uppercase">Total</td>
                        <td className="py-3 text-right text-blue-600">Rp 420.000.000</td>
                        <td className="py-3 text-right text-blue-600">Rp 193.450.000</td>
                        <td className="py-3 text-right text-blue-600">Rp 226.550.000</td>
                        <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full" style={{ width: '46%' }}></div>
                                </div>
                                <span className="text-blue-600">46%</span>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};