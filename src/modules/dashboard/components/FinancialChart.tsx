import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatIDR } from '../../../shared/utils/formatter';
import { useKasMasukQuery } from '../../kas-masuk/hooks/useKasMasukQuery';
import { useKasKeluarQuery } from '../../kas-keluar/hooks/useKasKeluarQuery';

/**
 * Area Chart mapping Church inflows and expenditures.
 * Utilizes centralized formatting and seamless layout separations.
 */
export const FinancialChart = () => {
    const { data: kasMasuk = [], isLoading: isMasukLoading } = useKasMasukQuery();
    const { data: kasKeluar = [], isLoading: isKeluarLoading } = useKasKeluarQuery();

    const isLoading = isMasukLoading || isKeluarLoading;

    // Generate indices and names for the last 6 months
    const last6Months = useMemo(() => {
        const months = [];
        const locale = 'id-ID';
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1); // avoid end of month overflow
            d.setMonth(d.getMonth() - i);
            const name = d.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
            months.push({
                name,
                monthIdx: d.getMonth(),
                yearVal: d.getFullYear(),
                masuk: 0,
                keluar: 0,
            });
        }
        return months;
    }, []);

    // Aggregate values
    const chartData = useMemo(() => {
        const months = last6Months.map(m => ({ ...m }));

        kasMasuk.forEach((item) => {
            const d = new Date(item.transactionDate);
            const mIdx = d.getMonth();
            const yVal = d.getFullYear();
            const match = months.find(m => m.monthIdx === mIdx && m.yearVal === yVal);
            if (match) {
                match.masuk += Number(item.amount || 0);
            }
        });

        kasKeluar.forEach((item) => {
            const d = new Date(item.transactionDate);
            const mIdx = d.getMonth();
            const yVal = d.getFullYear();
            const match = months.find(m => m.monthIdx === mIdx && m.yearVal === yVal);
            if (match) {
                match.keluar += Number(item.amount || 0);
            }
        });

        return months.map(({ name, masuk, keluar }) => ({ name, masuk, keluar }));
    }, [kasMasuk, kasKeluar, last6Months]);

    // Calculate totals for side panel
    const totals = useMemo(() => {
        let totalMasuk = 0;
        let totalKeluar = 0;
        chartData.forEach(item => {
            totalMasuk += item.masuk;
            totalKeluar += item.keluar;
        });
        return {
            penerimaan: totalMasuk,
            pengeluaran: totalKeluar,
            surplus: totalMasuk - totalKeluar
        };
    }, [chartData]);

    const chartTitleLabel = useMemo(() => {
        if (last6Months.length > 0) {
            const firstMonth = last6Months[0].name;
            const lastMonth = last6Months[last6Months.length - 1].name;
            return `6 Bulan Terakhir (${firstMonth} - ${lastMonth})`;
        }
        return '6 Bulan Terakhir';
    }, [last6Months]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* ── SISI KIRI: CHART VISUALIZER ── */}
            <div className="lg:col-span-3 h-[280px]">
                <div className="mb-4">
                    <h3 className="text-xs font-semibold text-slate-400">
                        Grafik Penerimaan & Pengeluaran
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {chartTitleLabel}
                    </p>
                </div>
                {isLoading ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                        Memuat data grafik...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                {/* Gradien Linear untuk Area Penerimaan (Emerald-500) */}
                                <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                {/* Gradien Linear untuk Area Pengeluaran (Rose-500) */}
                                <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.08} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                                tickFormatter={(val) => formatIDR(val, { notation: 'compact' })}
                            />
                            {/* DESIGN SYSTEM GUARD: borderRadius: '0px' (sudut tajam murni pada Tooltip) */}
                            <Tooltip
                                contentStyle={{
                                    border: '1px solid #f1f5f9',
                                    borderRadius: '0px',
                                    fontSize: '11px',
                                    fontWeight: 600
                                }}
                                formatter={(value) => formatIDR(Number(value))}
                            />
                            {/* DESIGN SYSTEM GUARD: iconType="rect" (kotak tajam, bukan lingkaran mengambang) */}
                            <Legend
                                verticalAlign="top"
                                align="center"
                                iconType="rect"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '9px', fontWeight: 700, paddingBottom: '15px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="masuk"
                                name="Penerimaan"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorMasuk)"
                                dot={{ r: 3, fill: '#10b981' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="keluar"
                                name="Pengeluaran"
                                stroke="#f43f5e"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorKeluar)"
                                dot={{ r: 3, fill: '#f43f5e' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── SISI KANAN: FLAT SEAMLESS SUMMARY SIDE PANEL ── */}
            <div className="flex flex-col justify-center gap-4 lg:border-l lg:border-slate-100 lg:pl-6">
                <div className="pb-2 border-b border-slate-100 lg:border-0 lg:pb-0">
                    <p className="text-[9px] font-semibold text-slate-400">Total Penerimaan</p>
                    <p className="text-base font-bold text-emerald-600 tracking-tight leading-snug">
                        {isLoading ? '...' : formatIDR(totals.penerimaan)}
                    </p>
                </div>
                <div className="pb-2 border-b border-slate-100 lg:border-0 lg:pb-0">
                    <p className="text-[9px] font-semibold text-slate-400">Total Pengeluaran</p>
                    <p className="text-base font-bold text-rose-600 tracking-tight leading-snug">
                        {isLoading ? '...' : formatIDR(totals.pengeluaran)}
                    </p>
                </div>
                <div className="pt-2 lg:pt-3 lg:border-t lg:border-slate-100">
                    <p className="text-[9px] font-semibold text-slate-400">Selisih (Surplus)</p>
                    <p className={`text-base font-bold tracking-tight leading-snug ${totals.surplus >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                        {isLoading ? '...' : formatIDR(totals.surplus)}
                    </p>
                </div>
            </div>
        </div>
    );
};