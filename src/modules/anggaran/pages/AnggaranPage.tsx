import { useMemo, useState } from 'react';
import { ShieldAlert, Plus, Calculator, Wallet, ArrowUpRight, TrendingUp, Edit2 } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { ChartCard } from '../../../shared/components/ui/ChartCard';
import { MiniLedger, type LedgerItem } from '../../../shared/components/ui/MiniLedger';
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import { useAnggaranQuery } from '../hooks/useAnggaranQuery';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { BuatAnggaranModal } from '../components/BuatAnggaranModal';
import { EditAnggaranModal } from '../components/EditAnggaranModal';
import { cn } from '../../../shared/utils/cn';

/**
 * Clean & Typesafe Anggaran dashboard page focusing entirely on budget details.
 * Implements high contrast typography, flat visual hierarchy, and live chart analytics.
 */
const AnggaranPage = () => {
    const { data: budgets = [], isLoading } = useAnggaranQuery();
    const { user } = useAuthStore();
    const isBendahara = user?.role === 'BENDAHARA';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<any>(null);

    // Calculate core metrics
    const metrics = useMemo(() => {
        let totalPlafon = 0;
        let totalRealisasi = 0;
        let totalSisa = 0;

        budgets.forEach((budget) => {
            budget.items.forEach((item) => {
                totalPlafon += Number(item.plafon || 0);
                totalRealisasi += Number(item.realisasi || 0);
                totalSisa += Number(item.sisa || 0);
            });
        });

        const burnRate = totalPlafon > 0 ? (totalRealisasi / totalPlafon) * 100 : 0;

        return {
            totalPlafon,
            totalRealisasi,
            totalSisa,
            burnRate,
        };
    }, [budgets]);

    // Format budget data for table display
    const processedAnggaran = useMemo(() => {
        return budgets.flatMap((budget) => {
            return budget.items.map((item) => ({
                id: item.id,
                namaPos: item.name,
                plafon: Number(item.plafon),
                terpakai: Number(item.realisasi),
                sisa: Number(item.sisa),
                percentUsed: Number(item.persentase),
                kategori: budget.fundCategory.name,
                tahun: budget.tahun,
                budgetId: budget.id,
            }));
        });
    }, [budgets]);

    // Aggregate Plafon vs Realisasi by category for Bar Chart
    const categoryAggregates = useMemo(() => {
        const aggregates: Record<string, { kategori: string; Plafon: number; Terpakai: number }> = {};
        budgets.forEach((budget) => {
            const catName = budget.fundCategory.name;
            if (!aggregates[catName]) {
                aggregates[catName] = { kategori: catName, Plafon: 0, Terpakai: 0 };
            }
            budget.items.forEach((item) => {
                aggregates[catName].Plafon += Number(item.plafon || 0);
                aggregates[catName].Terpakai += Number(item.realisasi || 0);
            });
        });
        return Object.values(aggregates);
    }, [budgets]);

    // Aggregate remaining budget by category for Donut Chart
    const categorySisaDataset = useMemo<LedgerItem[]>(() => {
        const aggregates: Record<string, number> = {};
        let totalSisa = 0;
        budgets.forEach((budget) => {
            const catName = budget.fundCategory.name;
            budget.items.forEach((item) => {
                const sisaVal = Number(item.sisa || 0);
                if (sisaVal > 0) {
                    aggregates[catName] = (aggregates[catName] || 0) + sisaVal;
                    totalSisa += sisaVal;
                }
            });
        });

        const colors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
        return Object.entries(aggregates).map(([name, value], index) => ({
            name,
            value,
            percentage: totalSisa > 0 ? (value / totalSisa) * 100 : 0,
            color: colors[index % colors.length]
        }));
    }, [budgets]);

    const getCategoryBadge = (kategori: string) => {
        const key = kategori.toLowerCase();
        let dotColor = 'bg-slate-400';
        let label = kategori;

        if (key.includes('liturgi')) {
            dotColor = 'bg-indigo-500';
            label = 'Liturgi';
        } else if (key.includes('omk') || key.includes('kepemudaan')) {
            dotColor = 'bg-rose-500';
            label = 'OMK';
        } else if (key.includes('pse') || key.includes('sosial')) {
            dotColor = 'bg-emerald-500';
            label = 'PSE (Sosial)';
        } else if (key.includes('operasional')) {
            dotColor = 'bg-slate-500';
            label = 'Operasional';
        } else if (key.includes('pemeliharaan') || key.includes('sarpras')) {
            dotColor = 'bg-amber-500';
            label = 'Pemeliharaan';
        } else if (key.includes('pendidikan') || key.includes('kateketik')) {
            dotColor = 'bg-purple-500';
            label = 'Pendidikan';
        }

        return (
            <div className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)}></span>
                <span className="text-xs font-semibold text-slate-700">{label}</span>
            </div>
        );
    };

    const getProgressColor = (percent: number) => {
        if (percent > 80) return 'bg-rose-500';
        if (percent >= 50) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getSisaColorClass = (sisa: number, plafon: number) => {
        if (sisa <= 0) return 'text-rose-600 font-bold';
        if (sisa < plafon * 0.2) return 'text-amber-600 font-bold';
        return 'text-emerald-600 font-bold';
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-medium text-slate-800 tracking-tight">Manajemen Anggaran</h2>
                    <p className="text-sm text-gray-500">Monitoring plafon and realisasi rencana anggaran tahunan paroki.</p>
                </div>
                {isBendahara && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 shadow-sm rounded-none"
                    >
                        <Plus size={16} /> Buat Pos Anggaran
                    </Button>
                )}
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border border-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold">Total Plafon Anggaran</p>
                    <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{formatIDR(metrics.totalPlafon)}</h4>
                    <p className="text-[9px] text-indigo-600 mt-2 font-medium flex items-center gap-1">
                        <Wallet size={10} /> Limit pagu maksimal
                    </p>
                </Card>

                <Card className="p-4 border border-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold">Realisasi (Terpakai)</p>
                    <h4 className="text-lg font-semibold mt-1 text-rose-600 tracking-tight">{formatIDR(metrics.totalRealisasi)}</h4>
                    <p className="text-[9px] text-rose-600 mt-2 font-medium flex items-center gap-1">
                        <ArrowUpRight size={10} /> Total dana terserap
                    </p>
                </Card>

                <Card className="p-4 border border-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold">Sisa Anggaran Tersedia</p>
                    <h4 className="text-lg font-semibold mt-1 text-emerald-600 tracking-tight">{formatIDR(metrics.totalSisa)}</h4>
                    <p className="text-[9px] text-emerald-600 mt-2 font-medium">✓ Siap dialokasikan</p>
                </Card>

                <Card className="p-4 border border-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold">Persentase Penyerapan</p>
                    <div className="flex items-end gap-1 mt-1">
                        <h4 className="text-lg font-semibold text-slate-800 tracking-tight">{Math.round(metrics.burnRate)}%</h4>
                        <p className="text-[9px] text-slate-400 font-medium mb-0.5">terpakai</p>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-none mt-3 overflow-hidden">
                        <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${metrics.burnRate}%` }}></div>
                    </div>
                </Card>
            </div>

            {/* Analytics Visualizations (Menerapkan Tinggi Penuh Sejajar Tanpa Tambahan KPI) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Plafon vs Realisasi Bar Chart (Grafik Batang Diperpanjang Tinggi Vertikalnya) */}
                <Card className="lg:col-span-8 p-5 border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-600" />
                        <h3 className="text-xs font-semibold text-slate-400">
                            Perbandingan Plafon vs Realisasi Anggaran Per Kategori
                        </h3>
                    </div>

                    {/* Mengunci Tinggi Canvas Grafik h-[400px] dengan Penanganan Kategori Meluap */}
                    <div className="w-full overflow-x-auto no-scrollbar">
                        <div className="h-[400px] min-w-[800px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryAggregates} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="kategori" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                                        tickFormatter={(val) => formatIDR(val, { notation: 'compact' })}
                                    />
                                    <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '0px', fontSize: '11px', fontWeight: 600 }} formatter={(val) => formatIDR(Number(val))} />
                                    <Legend iconSize={8} iconType="rect" wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />

                                    {/* DESIGN SYSTEM GUARD: radius={0} murni tajam tanpa membulat */}
                                    <Bar dataKey="Plafon" fill="#6366f1" radius={0} />
                                    <Bar dataKey="Terpakai" fill="#f43f5e" radius={0} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                {/* Donut Allocation Chart (Menerapkan Standardisasi Asymmetric Split & Progressive Help) */}
                <div className="lg:col-span-4">
                    <ChartCard
                        title="Proporsi Sisa Anggaran"
                        subtitle="Bulan Berjalan"
                        helpText={`Proporsi Sisa Anggaran:\n\nBagan ini menggambarkan persebaran sisa dana anggaran yang siap untuk dialokasikan pada setiap program paroki tahun berjalan.\n\nSistem akan memberikan pembatasan otomatis jika pengajuan pengeluaran melampaui sisa pagu pos dana terkait.`}
                        chartElement={
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={categorySisaDataset}
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {categorySisaDataset.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatIDR(Number(value))} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        }
                    >
                        <MiniLedger items={categorySisaDataset} maxHeightClass="max-h-[220px]" />
                    </ChartCard>
                </div>
            </div>

            {/* SECTION: Anggaran Tahunan Table */}
            <div>
                <h3 className="text-xs font-semibold text-slate-400 mb-4 flex items-center gap-2">
                    <Calculator className="text-emerald-600" size={16} /> Rincian Pos Anggaran Paroki
                </h3>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : processedAnggaran.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-none shadow-sm font-semibold text-xs">
                            Belum ada pos anggaran rencana belanja yang dibuat.
                        </div>
                    ) : (
                        <AdaptiveList
                            data={processedAnggaran}
                            desktopHeaders={[
                                'Kategori',
                                'Nama Pos Anggaran',
                                'Tahun',
                                'Plafon',
                                'Terpakai',
                                'Progress',
                                'Sisa Anggaran',
                                ...(isBendahara ? ['Aksi'] : [])
                            ]}
                            renderDesktopRow={(item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-2.5 border-r">
                                        {getCategoryBadge(item.kategori)}
                                    </td>
                                    <td className="px-5 py-2.5 text-xs font-medium text-slate-700 border-r">{item.namaPos}</td>
                                    <td className="px-5 py-2.5 text-xs font-medium text-slate-500 border-r text-center">{item.tahun}</td>
                                    <td className="px-5 py-2.5 text-xs text-right font-mono text-slate-600 border-r">{formatIDR(item.plafon)}</td>
                                    <td className="px-5 py-2.5 text-xs text-right font-mono font-medium text-rose-600 border-r">{formatIDR(item.terpakai)}</td>
                                    <td className="px-5 py-2.5 border-r">
                                        <div className="flex items-center gap-2.5 justify-center">
                                            <div className="flex-1 bg-slate-100 h-2 rounded-none w-24 overflow-hidden border border-slate-200/30">
                                                <div
                                                    className={cn("h-full transition-all duration-300", getProgressColor(item.percentUsed))}
                                                    style={{ width: `${Math.min(item.percentUsed, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] font-mono font-medium text-slate-500 w-8 text-right">{Math.round(item.percentUsed)}%</span>
                                        </div>
                                    </td>
                                    <td className={cn("px-5 py-2.5 text-xs text-right font-mono", isBendahara && "border-r", getSisaColorClass(item.sisa, item.plafon))}>{formatIDR(item.sisa)}</td>
                                    {isBendahara && (
                                        <td className="px-5 py-2.5 text-center">
                                            <button
                                                title="Edit Anggaran"
                                                onClick={() => {
                                                    const parentBudget = budgets.find((b) => b.id === item.budgetId);
                                                    if (parentBudget) {
                                                        setSelectedBudget(parentBudget);
                                                        setIsEditModalOpen(true);
                                                    }
                                                }}
                                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all duration-100 rounded-none shadow-sm"
                                            >
                                                <Edit2 size={13} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            )}
                            renderMobileCard={(item) => (
                                <div className="flex flex-col gap-2.5">
                                    <div className="flex justify-between items-center">
                                        {getCategoryBadge(item.kategori)}
                                        <span className="text-[10px] font-mono font-medium text-slate-500">{item.tahun} - {Math.round(item.percentUsed)}% Terpakai</span>
                                    </div>
                                    <div className="text-xs font-semibold text-slate-800">{item.namaPos}</div>
                                    <div className="w-full bg-slate-100 h-2 rounded-none border border-slate-200/30 overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-300", getProgressColor(item.percentUsed))}
                                            style={{ width: `${Math.min(item.percentUsed, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                                        <div>
                                            <span className="text-slate-400 font-semibold block text-[8px]">Plafon</span>
                                            <span className="font-mono text-slate-700">{formatIDR(item.plafon)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 font-semibold block text-[8px]">Terpakai</span>
                                            <span className="font-mono font-medium text-rose-600">{formatIDR(item.terpakai)}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-slate-400 font-semibold block text-[8px]">Sisa</span>
                                            <span className={cn("font-mono", getSisaColorClass(item.sisa, item.plafon))}>{formatIDR(item.sisa)}</span>
                                        </div>
                                    </div>
                                    {isBendahara && (
                                        <div className="pt-2 border-t flex justify-end">
                                            <button
                                                title="Edit Anggaran"
                                                onClick={() => {
                                                    const parentBudget = budgets.find((b) => b.id === item.budgetId);
                                                    if (parentBudget) {
                                                        setSelectedBudget(parentBudget);
                                                        setIsEditModalOpen(true);
                                                    }
                                                }}
                                                className="px-2.5 py-1 text-slate-500 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all duration-100 rounded-none flex items-center gap-1 text-[10px] font-semibold"
                                            >
                                                <Edit2 size={12} /> Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    )}

                    <div className="p-3.5 bg-amber-50/60 rounded-none flex items-center gap-2.5 text-amber-900 shadow-none">
                        <ShieldAlert size={16} className="text-amber-700 shrink-0" />
                        <p className="text-[11px] font-semibold leading-normal">
                            Sistem akan memberikan peringatan otomatis jika pengajuan dana melebihi sisa anggaran di setiap Pos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Buat Rencana Anggaran Baru"
                size="xl"
            >
                <BuatAnggaranModal
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            {/* Edit Modal Form */}
            {selectedBudget && (
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedBudget(null);
                    }}
                    title={`Edit Rencana Anggaran - ${selectedBudget.fundCategory.name}`}
                    size="xl"
                >
                    <EditAnggaranModal
                        budget={selectedBudget}
                        onSuccess={() => {
                            setIsEditModalOpen(false);
                            setSelectedBudget(null);
                        }}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedBudget(null);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
};

export default AnggaranPage;