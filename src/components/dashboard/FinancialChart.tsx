import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_ANALYTICS, SUMMARY_TOTALS } from '../../mock/dashboardData';

export const FinancialChart = () => {
    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(val);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 h-[300px]">
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase">Grafik Penerimaan & Pengeluaran</h3>
                    <p className="text-[10px] text-gray-400">6 Bulan Terakhir (Desember 2024 - Mei 2025)</p>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_ANALYTICS}>
                        <defs>
                            <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={formatIDR} />
                        <Tooltip />
                        <Legend verticalAlign="top" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '20px' }} />
                        <Area type="monotone" dataKey="masuk" name="Penerimaan (Rp)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMasuk)" dot={{ r: 4, fill: '#10b981' }} />
                        <Area type="monotone" dataKey="keluar" name="Pengeluaran (Rp)" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorKeluar)" dot={{ r: 4, fill: '#ef4444' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Side Box */}
            <div className="flex flex-col justify-center gap-6 border-l border-slate-100 pl-6">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Total Penerimaan</p>
                    <p className="text-lg font-black text-emerald-600">Rp {SUMMARY_TOTALS.penerimaan.toLocaleString('id-ID')}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">Total Pengeluaran</p>
                    <p className="text-lg font-black text-rose-600">Rp {SUMMARY_TOTALS.pengeluaran.toLocaleString('id-ID')}</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Surplus</p>
                    <p className="text-lg font-black text-blue-600">Rp {SUMMARY_TOTALS.surplus.toLocaleString('id-ID')}</p>
                </div>
            </div>
        </div>
    );
};