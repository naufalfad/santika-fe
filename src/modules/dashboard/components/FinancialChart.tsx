import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_ANALYTICS, SUMMARY_TOTALS } from '../../../shared/mock/dashboardData';
import { formatIDR } from '../../../shared/utils/formatter';

/**
 * Area Chart mapping Church inflows and expenditures.
 * Utilizes centralized formatting and seamless layout separations.
 */
export const FinancialChart = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chart Visualizer */}
            <div className="lg:col-span-3 h-[280px]">
                <div className="mb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                        Grafik Penerimaan & Pengeluaran
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        6 Bulan Terakhir (Desember 2024 - Mei 2025)
                    </p>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_ANALYTICS}>
                        <defs>
                            <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.08} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                            tickFormatter={(val) => formatIDR(val, { notation: 'compact' })}
                        />
                        <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }} />
                        <Legend verticalAlign="top" align="center" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 700, paddingBottom: '15px' }} />
                        <Area type="monotone" dataKey="masuk" name="Penerimaan" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMasuk)" dot={{ r: 3.5, fill: '#10b981' }} />
                        <Area type="monotone" dataKey="keluar" name="Pengeluaran" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorKeluar)" dot={{ r: 3.5, fill: '#ef4444' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Flat Seamless Summary Side Panel */}
            <div className="flex flex-col justify-center gap-4 lg:border-l lg:border-slate-100 lg:pl-6">
                <div className="pb-2 border-b border-slate-100/60 lg:border-0 lg:pb-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Penerimaan</p>
                    <p className="text-base font-black text-emerald-600 tracking-tight leading-snug">
                        {formatIDR(SUMMARY_TOTALS.penerimaan)}
                    </p>
                </div>
                <div className="pb-2 border-b border-slate-100/60 lg:border-0 lg:pb-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Pengeluaran</p>
                    <p className="text-base font-black text-rose-600 tracking-tight leading-snug">
                        {formatIDR(SUMMARY_TOTALS.pengeluaran)}
                    </p>
                </div>
                <div className="pt-2 lg:pt-3 lg:border-t lg:border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Selisih</p>
                    <p className="text-base font-black text-blue-600 tracking-tight leading-snug">
                        {formatIDR(SUMMARY_TOTALS.surplus)}
                    </p>
                </div>
            </div>
        </div>
    );
};