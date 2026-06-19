import { useMemo, useState } from 'react';
import { ShieldAlert, Plus, Calculator, Wallet, ArrowUpRight, TrendingUp, Percent } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
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
    const categorySisaDataset = useMemo(() => {
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
            percentage: totalSisa > 0 ? Math.round((value / totalSisa) * 100) : 0,
            color: colors[index % colors.length]
        }));
    }, [budgets]);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-medium text-slate-800 tracking-tight">Manajemen Anggaran</h2>
                    <p className="text-sm text-gray-500">Monitoring plafon dan realisasi rencana anggaran tahunan paroki.</p>
                </div>
                {isBendahara && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 shadow-sm"
                    >
                        <Plus size={16} /> Buat Pos Anggaran
                    </Button>
                )}
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border-l-4 border-l-indigo-500 border-y-slate-200 border-r-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold">Total Plafon Anggaran</p>
                    <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{formatIDR(metrics.totalPlafon)}</h4>
                    <p className="text-[9px] text-indigo-600 mt-2 font-medium flex items-center gap-1">
                        <Wallet size={10} /> Limit pagu maksimal
                    </p>
                </Card>

                <Card className="p-4 border-l-4 border-l-rose-500 border-y-slate-200 border-r-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold">Realisasi (Terpakai)</p>
                    <h4 className="text-lg font-semibold mt-1 text-rose-600 tracking-tight">{formatIDR(metrics.totalRealisasi)}</h4>
                    <p className="text-[9px] text-rose-600 mt-2 font-medium flex items-center gap-1">
                        <ArrowUpRight size={10} /> Total dana terserap
                    </p>
                </Card>

                <Card className="p-4 border-l-4 border-l-emerald-500 border-y-slate-200 border-r-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold">Sisa Anggaran Tersedia</p>
                    <h4 className="text-lg font-semibold mt-1 text-emerald-600 tracking-tight">{formatIDR(metrics.totalSisa)}</h4>
                    <p className="text-[9px] text-emerald-600 mt-2 font-medium">✓ Siap dialokasikan</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-amber-500 border-y-slate-200 border-r-slate-200 shadow-sm">
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

            {/* Analytics Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Plafon vs Realisasi Bar Chart */}
                <Card className="lg:col-span-8 p-5 border-slate-200 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-600" />
                        <h3 className="text-xs font-semibold text-slate-400">
                            Perbandingan Plafon vs Realisasi Anggaran Per Kategori
                        </h3>
                    </div>
                    <div className="h-[260px]">
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
                                <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }} />
                                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                                <Bar dataKey="Plafon" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Terpakai" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Donut Allocation Chart */}
                <Card className="lg:col-span-4 p-5 border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="mb-2 flex items-center gap-2">
                        <Percent size={16} className="text-emerald-500" />
                        <h3 className="text-xs font-semibold text-slate-400">
                            Proporsi Sisa Anggaran Per Kategori
                        </h3>
                    </div>
                    <div className="h-[180px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={categorySisaDataset}
                                    innerRadius={50}
                                    outerRadius={68}
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
                        {/* Center text for Donut */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] text-slate-400 font-semibold">Sisa Total</span>
                            <span className="text-sm font-semibold text-emerald-600">{formatIDR(metrics.totalSisa, { notation: 'compact' })}</span>
                        </div>
                    </div>
                    {/* Legend list inside card */}
                    <div className="space-y-1 pt-2">
                        {categorySisaDataset.slice(0, 3).map((item) => (
                            <div key={item.name} className="flex justify-between items-center text-[10px] font-medium">
                                <span className="flex items-center gap-1.5 text-slate-500">
                                    <span className="w-2 h-2 rounded-none" style={{ backgroundColor: item.color }}></span>
                                    {item.name}
                                </span>
                                <span className="text-slate-700">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </Card>
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
                                        <span className="text-[9px] font-semibold px-2 py-0.5 text-slate-600 tracking-tight">
                                            {item.kategori}
                                        </span>
                                    </td>
                                    <td className="px-5 py-2.5 text-xs font-medium text-slate-700 border-r">{item.namaPos}</td>
                                    <td className="px-5 py-2.5 text-xs font-medium text-slate-500 border-r text-center">{item.tahun}</td>
                                    <td className="px-5 py-2.5 text-xs text-right font-medium text-slate-600 border-r">{formatIDR(item.plafon)}</td>
                                    <td className="px-5 py-2.5 text-xs text-right font-semibold text-rose-600 border-r">{formatIDR(item.terpakai)}</td>
                                    <td className="px-5 py-2.5 border-r">
                                        <div className="flex items-center gap-2 justify-center">
                                            <div className="flex-1 bg-slate-100 h-1.5 rounded-none w-24 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-none ${item.percentUsed > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${item.percentUsed}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[9px] font-medium text-slate-500 w-6 text-right">{Math.round(item.percentUsed)}%</span>
                                        </div>
                                    </td>
                                    <td className={cn("px-5 py-2.5 text-xs text-right font-semibold text-emerald-600", isBendahara && "border-r ")}>{formatIDR(item.sisa)}</td>
                                    {isBendahara && (
                                        <td className="px-5 py-2.5 text-center">
                                            <Button
                                                onClick={() => {
                                                    const parentBudget = budgets.find((b) => b.id === item.budgetId);
                                                    if (parentBudget) {
                                                        setSelectedBudget(parentBudget);
                                                        setIsEditModalOpen(true);
                                                    }
                                                }}
                                                variant="ghost" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-transparent p-0 h-auto"
                                            >
                                                Edit
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            )}
                            renderMobileCard={(item) => (
                                <div className="flex flex-col gap-2.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-semibold px-2 py-0.5 text-slate-600 tracking-tight">
                                            {item.kategori}
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-500">{item.tahun} - {Math.round(item.percentUsed)}% Terpakai</span>
                                    </div>
                                    <div className="text-xs font-medium text-slate-800">{item.namaPos}</div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-none overflow-hidden">
                                        <div
                                            className={`h-full rounded-none ${item.percentUsed > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${item.percentUsed}%` }}
                                        ></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                                        <div>
                                            <span className="text-slate-400 font-medium block text-[8px]">Plafon</span>
                                            <span className="font-semibold text-slate-700">{formatIDR(item.plafon)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 font-medium block text-[8px]">Terpakai</span>
                                            <span className="font-medium text-rose-600">{formatIDR(item.terpakai)}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-slate-400 font-medium block text-[8px]">Sisa</span>
                                            <span className="font-semibold text-emerald-600">{formatIDR(item.sisa)}</span>
                                        </div>
                                    </div>
                                    {isBendahara && (
                                        <div className="pt-2 border-t flex justify-end">
                                            <Button
                                                onClick={() => {
                                                    const parentBudget = budgets.find((b) => b.id === item.budgetId);
                                                    if (parentBudget) {
                                                        setSelectedBudget(parentBudget);
                                                        setIsEditModalOpen(true);
                                                    }
                                                }}
                                                variant="ghost" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-transparent p-0 h-auto"
                                            >
                                                Edit Anggaran
                                            </Button>
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