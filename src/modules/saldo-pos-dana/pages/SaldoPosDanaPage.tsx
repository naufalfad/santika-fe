import { useState, useMemo } from 'react';
import {
  Coins, TrendingUp, TrendingDown, Wallet, Search, RotateCw, CheckCircle, ArrowLeftRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import { useFundBalancesQuery, useTransferBalanceMutation } from '../../kas-masuk/hooks/useKasMasukQuery';
import { formatIDR } from '../../../shared/utils/formatter';
import { useAuthStore } from '../../../app/store/useAuthStore';

/**
 * SaldoPosDanaPage Component
 * 
 * Implements a high-density, professional dashboard to monitor fund balances
 * per Pos Dana. Follows strict "rounded-none" and flat, border-based design systems.
 */
const transferSchema = z.object({
  source_fund_category_id: z.string().uuid('Pilih Pos Dana Asal'),
  target_fund_category_id: z.string().uuid('Pilih Pos Dana Tujuan'),
  amount: z.number({ message: 'Nominal wajib diisi' }).min(100, 'Nominal minimal Rp 100'),
  description: z.string().min(3, 'Keterangan minimal 3 karakter'),
});

type TransferFormData = z.infer<typeof transferSchema>;

const SaldoPosDanaPage = () => {
  const { data: fundBalances = [], isLoading, refetch, isRefetching } = useFundBalancesQuery();
  const { user } = useAuthStore();
  const isBendaharaOrAdmin = user?.role === 'BENDAHARA' || user?.role === 'SUPER_ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'PERMANENT' | 'SPECIAL_FUND'>('PERMANENT');

  const transferMutation = useTransferBalanceMutation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      source_fund_category_id: '',
      target_fund_category_id: '',
      amount: undefined,
      description: '',
    },
  });

  const selectedSourceId = watch('source_fund_category_id');

  // Filter out Special Funds from transfers
  const transferrableFunds = useMemo(() => {
    return fundBalances.filter((f) => f.isActive && !f.fund.startsWith('Dana Khusus:'));
  }, [fundBalances]);

  // Find selected source fund to get its balance
  const selectedSourceFund = useMemo(() => {
    return fundBalances.find((f) => f.id === selectedSourceId) || null;
  }, [selectedSourceId, fundBalances]);

  const onTransferSubmit = async (data: TransferFormData) => {
    if (selectedSourceFund && Number(selectedSourceFund.balance) < data.amount) {
      alert(`Saldo ${selectedSourceFund.fund} tidak mencukupi untuk transfer.`);
      return;
    }

    transferMutation.mutate(
      {
        source_fund_category_id: data.source_fund_category_id,
        target_fund_category_id: data.target_fund_category_id,
        amount: data.amount,
        description: data.description,
      },
      {
        onSuccess: () => {
          setIsTransferModalOpen(false);
          reset();
        },
      }
    );
  };

  // Split fund balances
  const permanentBalances = useMemo(() => {
    return fundBalances.filter((f) => !f.fund.startsWith('Dana Khusus:'));
  }, [fundBalances]);

  const specialBalances = useMemo(() => {
    return fundBalances.filter((f) => f.fund.startsWith('Dana Khusus:'));
  }, [fundBalances]);

  const currentBalances = useMemo(() => {
    return activeTab === 'PERMANENT' ? permanentBalances : specialBalances;
  }, [activeTab, permanentBalances, specialBalances]);

  // Core metrics derived from live fund balances data
  const metrics = useMemo(() => {
    let totalBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let activeCount = 0;

    currentBalances.forEach((item) => {
      totalBalance += Number(item.balance || 0);
      totalIncome += Number(item.income || 0);
      totalExpense += Number(item.expense || 0);
      if (item.isActive) activeCount++;
    });

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      activeCount,
    };
  }, [currentBalances]);

  // Apply search & status filters
  const filteredData = useMemo(() => {
    return currentBalances.filter((item) => {
      const matchesSearch =
        item.fund.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [currentBalances, searchTerm, statusFilter]);

  // Recharts: Data preparation for Income vs Expense BarChart
  const barChartData = useMemo(() => {
    return filteredData.map((item) => ({
      name: activeTab === 'PERMANENT' ? item.fund : item.fund.replace('Dana Khusus: ', ''),
      Pemasukan: Number(item.income || 0),
      Pengeluaran: Number(item.expense || 0),
    }));
  }, [filteredData, activeTab]);

  // Recharts: Data preparation for Balance share PieChart (only funds with positive balance)
  const pieChartData = useMemo(() => {
    const colors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6', '#f43f5e'];
    const activeBalances = filteredData.filter((item) => Number(item.balance || 0) > 0);
    
    if (activeBalances.length === 0) {
      return [{ name: 'Tidak ada saldo positif', value: 1, color: '#e2e8f0' }];
    }

    return activeBalances.map((item, index) => ({
      name: activeTab === 'PERMANENT' ? item.fund : item.fund.replace('Dana Khusus: ', ''),
      value: Number(item.balance),
      color: colors[index % colors.length],
    }));
  }, [filteredData, activeTab]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Saldo Pos Dana</h2>
          <p className="text-sm text-gray-500">Informasi saldo keseluruhan, total pemasukan, dan pengeluaran setiap pos dana.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isBendaharaOrAdmin && activeTab === 'PERMANENT' && (
            <Button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-none shadow-none font-bold"
            >
              <ArrowLeftRight size={14} />
              Transfer Saldo
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs border-slate-200"
          >
            <RotateCw size={14} className={isRefetching ? 'animate-spin' : ''} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar pb-0 text-sm font-bold text-slate-400">
        <button
          onClick={() => setActiveTab('PERMANENT')}
          className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${
            activeTab === 'PERMANENT'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Pos Dana Permanen
        </button>
        <button
          onClick={() => setActiveTab('SPECIAL_FUND')}
          className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${
            activeTab === 'SPECIAL_FUND'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Dana Khusus
        </button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-600 border-y-slate-200 border-r-slate-200">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
            {activeTab === 'PERMANENT' ? 'Total Saldo' : 'Saldo Dana Khusus'}
          </p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">
            {isLoading ? '...' : formatIDR(metrics.totalBalance)}
          </h4>
          <div className="flex items-center gap-1 mt-2 text-blue-600 font-bold text-[10px]">
            <Wallet size={12} />
            <span>{activeTab === 'PERMANENT' ? 'Seluruh Pos Dana' : 'Seluruh Dana Khusus'}</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600 border-y-slate-200 border-r-slate-200">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Pemasukan</p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">
            {isLoading ? '...' : formatIDR(metrics.totalIncome)}
          </h4>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 font-bold text-[10px]">
            <TrendingUp size={12} />
            <span>Akumulasi Penerimaan</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500 border-y-slate-200 border-r-slate-200">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Pengeluaran</p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">
            {isLoading ? '...' : formatIDR(metrics.totalExpense)}
          </h4>
          <div className="flex items-center gap-1 mt-2 text-rose-500 font-bold text-[10px]">
            <TrendingDown size={12} />
            <span>Akumulasi Pengeluaran</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 border-y-slate-200 border-r-slate-200">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
            {activeTab === 'PERMANENT' ? 'Pos Dana Aktif' : 'Program Dana Khusus Aktif'}
          </p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">
            {isLoading ? '...' : `${metrics.activeCount} / ${currentBalances.length}`}
          </h4>
          <div className="flex items-center gap-1 mt-2 text-amber-600 font-bold text-[10px]">
            <CheckCircle size={12} />
            <span>Siap Digunakan</span>
          </div>
        </Card>
      </div>

      {/* Analytical Visualizations */}
      {!isLoading && fundBalances.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart: Income vs Expense comparison */}
          <Card className="lg:col-span-8 p-5 border-slate-200">
            <div className="mb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins size={14} className="text-blue-500" /> {activeTab === 'PERMANENT' ? 'Pemasukan vs Pengeluaran per Pos Dana' : 'Pemasukan vs Pengeluaran per Dana Khusus'}
              </h3>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
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
                  <Tooltip
                    contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '0px', fontSize: '11px', fontWeight: 600 }}
                    formatter={(val) => formatIDR(Number(val))}
                  />
                  <Legend verticalAlign="top" height={36} iconType="rect" wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                  <Bar dataKey="Pemasukan" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Pie Chart: Balance Distribution */}
          <Card className="lg:col-span-4 p-5 border-slate-200 flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Wallet size={14} className="text-emerald-500" /> {activeTab === 'PERMANENT' ? 'Distribusi Saldo Aktif' : 'Distribusi Saldo Dana Khusus'}
            </h3>
            <div className="h-[180px] flex-1 min-h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatIDR(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom high-contrast legend list for donut */}
            <div className="mt-4 max-h-[80px] overflow-y-auto divide-y divide-slate-100 text-[10px] font-bold text-slate-600">
              {pieChartData.map((entry: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="truncate">{entry.name}</span>
                  </div>
                  <span className="text-slate-800">{entry.value > 1 ? formatIDR(entry.value, { notation: 'compact' }) : '-'}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Filter and Table Section */}
      <div className="space-y-4">
        {/* Filters Controls */}
        <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-none w-full md:w-80">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'PERMANENT' ? "Cari pos dana berdasarkan nama/kode..." : "Cari dana khusus berdasarkan nama/kode..."}
              className="bg-transparent outline-none text-xs w-full text-slate-800 font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider hidden sm:inline">Status:</span>
            <div className="flex border border-slate-200 rounded-none overflow-hidden">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 text-xs font-black transition-colors ${
                  statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1 text-xs font-black transition-colors ${
                  statusFilter === 'ACTIVE' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setStatusFilter('INACTIVE')}
                className={`px-3 py-1 text-xs font-black transition-colors ${
                  statusFilter === 'INACTIVE' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Non-Aktif
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table & Mobile Card Listing */}
        <AdaptiveList
          data={filteredData}
          isLoading={isLoading}
          desktopHeaders={[
            'Kode Pos',
            activeTab === 'PERMANENT' ? 'Nama Pos Dana' : 'Program Dana Khusus',
            'Total Pemasukan',
            'Total Pengeluaran',
            'Saldo Saat Ini',
            'Status',
          ]}
          renderDesktopRow={(item) => (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-5 py-3 text-xs font-black text-blue-600 border-r border-slate-100 uppercase">
                {item.code}
              </td>
              <td className="px-5 py-3 text-xs font-bold text-slate-700 border-r border-slate-100">
                {activeTab === 'PERMANENT' ? item.fund : item.fund.replace('Dana Khusus: ', '')}
              </td>
              <td className="px-5 py-3 text-xs font-semibold text-right text-emerald-600 border-r border-slate-100">
                {formatIDR(Number(item.income))}
              </td>
              <td className="px-5 py-3 text-xs font-semibold text-right text-rose-500 border-r border-slate-100">
                {formatIDR(Number(item.expense))}
              </td>
              <td className={`px-5 py-3 text-xs font-black text-right border-r border-slate-100 ${
                Number(item.balance) < 0 ? 'text-rose-600 bg-rose-50/20' : 'text-slate-800'
              }`}>
                {formatIDR(Number(item.balance))}
              </td>
              <td className="px-5 py-3 text-center">
                <Badge variant={item.isActive ? 'success' : 'danger'}>
                  {item.isActive ? 'Aktif' : 'Non-Aktif'}
                </Badge>
              </td>
            </tr>
          )}
          renderMobileCard={(item) => (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-blue-600 uppercase">{item.code}</span>
                <Badge variant={item.isActive ? 'success' : 'danger'}>
                  {item.isActive ? 'Aktif' : 'Non-Aktif'}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">
                  {activeTab === 'PERMANENT' ? item.fund : item.fund.replace('Dana Khusus: ', '')}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 mt-1">
                <div>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Pemasukan</p>
                  <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">{formatIDR(Number(item.income))}</p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Pengeluaran</p>
                  <p className="text-[10px] font-semibold text-rose-500 mt-0.5">{formatIDR(Number(item.expense))}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-slate-400 font-bold uppercase">Saldo</p>
                  <p className={`text-[10px] font-black mt-0.5 ${
                    Number(item.balance) < 0 ? 'text-rose-600' : 'text-slate-800'
                  }`}>
                    {formatIDR(Number(item.balance))}
                  </p>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      {/* Transfer Saldo Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          reset();
          transferMutation.reset();
        }}
        title="Transfer Saldo Antar Pos Dana"
      >
        <form onSubmit={handleSubmit(onTransferSubmit)} className="space-y-4">
          {transferMutation.isError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 font-semibold flex items-center gap-2">
              <RotateCw size={14} className="shrink-0 animate-spin" />
              <span>{(transferMutation.error as any)?.response?.data?.message || 'Gagal melakukan transfer saldo.'}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pos Dana Asal */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase">Pos Dana Asal (Sumber)</label>
              <select
                {...register('source_fund_category_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Pilih Pos Dana Asal</option>
                {transferrableFunds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fund} ({formatIDR(f.balance, { notation: 'compact' })})
                  </option>
                ))}
              </select>
              {errors.source_fund_category_id && <p className="text-[10px] text-rose-500 font-bold">{errors.source_fund_category_id.message}</p>}
            </div>

            {/* Pos Dana Tujuan */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase">Pos Dana Tujuan</label>
              <select
                {...register('target_fund_category_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Pilih Pos Dana Tujuan</option>
                {transferrableFunds
                  .filter((f) => f.id !== selectedSourceId)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fund} ({formatIDR(f.balance, { notation: 'compact' })})
                    </option>
                  ))}
              </select>
              {errors.target_fund_category_id && <p className="text-[10px] text-rose-500 font-bold">{errors.target_fund_category_id.message}</p>}
            </div>
          </div>

          {/* Saldo Asal Information */}
          {selectedSourceFund && (
            <div className="p-3 bg-blue-50/50 border border-blue-100 text-xs font-semibold text-blue-800 flex justify-between items-center">
              <span>Saldo Tersedia ({selectedSourceFund.fund}):</span>
              <span className="font-bold text-sm text-blue-900">{formatIDR(selectedSourceFund.balance)}</span>
            </div>
          )}

          {/* Nominal */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase">Nominal Transfer (Rp)</label>
            <input
              type="number"
              placeholder="0"
              {...register('amount', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {errors.amount && <p className="text-[10px] text-rose-500 font-bold">{errors.amount.message}</p>}
          </div>

          {/* Keterangan */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase">Keterangan</label>
            <input
              type="text"
              placeholder="Misal: Pemindahan kas operasional bulanan"
              {...register('description')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {errors.description && <p className="text-[10px] text-rose-500 font-bold">{errors.description.message}</p>}
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsTransferModalOpen(false);
                reset();
                transferMutation.reset();
              }}
              className="flex-1 rounded-none font-bold text-slate-500"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || transferMutation.isPending}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-none font-bold flex justify-center items-center gap-2"
            >
              {isSubmitting || transferMutation.isPending ? 'Memindahkan...' : 'Konfirmasi Transfer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SaldoPosDanaPage;
