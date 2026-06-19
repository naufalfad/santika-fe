import { useState, useMemo, useEffect } from 'react';
import {
  Plus, Search, Download,
  FileImage, ArrowUpRight, TrendingUp,
  Info, UploadCloud
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import { ChartCard } from '../../../shared/components/ui/ChartCard';
import { MiniLedger, type LedgerItem } from '../../../shared/components/ui/MiniLedger';
import { KasKeluarForm } from '../components/KasKeluarForm';
import { SPJUploadModal } from '../../spj/components/SPJUploadModal';
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import { useKasKeluarQuery } from '../hooks/useKasKeluarQuery';
import { useFundBalancesQuery } from '../../kas-masuk/hooks/useKasMasukQuery';
import { useAnggaranQuery } from '../../anggaran/hooks/useAnggaranQuery';

/**
 * Standardized high-contrast, high-density Kas Keluar Management page.
 * Implements optimized useMemo selectors to prevent rendering lags.
 * Integrates React Query for async Server State and AdaptiveList for responsive layouts.
 * Fully interactive with dynamic chart updates, sharp-edge visual styling, and receipt preview modal.
 */
const KasKeluarPage = () => {
  const { data: kasKeluar = [], isLoading } = useKasKeluarQuery();
  const { data: fundBalances = [] } = useFundBalancesQuery();
  const { data: budgets = [] } = useAnggaranQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSpjUploadOpen, setIsSpjUploadOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | undefined>(undefined);
  const [selectedBuktiUrl, setSelectedBuktiUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PERMANENT' | 'SPECIAL_FUND'>('PERMANENT');
  const [timeRange, setTimeRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH'>('ALL');
  const [sortBy, setSortBy] = useState<'LATEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('LATEST');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Calculate base API asset paths dynamically
  const apiAssetUrl = useMemo(() => {
    return (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');
  }, []);

  // Split transactions
  const kasKeluarPermanent = useMemo(() => {
    return kasKeluar.filter(item => !item.specialFundId);
  }, [kasKeluar]);

  const kasKeluarSpecial = useMemo(() => {
    return kasKeluar.filter(item => !!item.specialFundId);
  }, [kasKeluar]);

  // Current transactions based on active tab
  const currentTransactions = useMemo(() => {
    return activeTab === 'PERMANENT' ? kasKeluarPermanent : kasKeluarSpecial;
  }, [activeTab, kasKeluarPermanent, kasKeluarSpecial]);

  // 2. Memoize overall cash balance (Sum of all active Pos Dana balances for current tab)
  const totalSaldoKas = useMemo(() => {
    return fundBalances.reduce((sum, item) => {
      const isSpecial = item.fund.startsWith('Dana Khusus:');
      const shouldInclude = activeTab === 'PERMANENT' ? !isSpecial : isSpecial;
      return sum + (shouldInclude ? Number(item.balance || 0) : 0);
    }, 0);
  }, [fundBalances, activeTab]);

  // 3. Memoize total expense for the current month
  const totalKeluarBulanIni = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return currentTransactions.reduce((sum, item) => {
      const d = new Date(item.transactionDate);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return sum + Number(item.amount);
      }
      return sum;
    }, 0);
  }, [currentTransactions]);

  // 4. Memoize number of transactions logged this month
  const transBulanIniCount = useMemo(() => {
    const now = new Date();
    return currentTransactions.filter(item => {
      const d = new Date(item.transactionDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [currentTransactions]);

  // 5. Memoize entire paroki budget burn rate
  const totalPlafon = useMemo(() => {
    return budgets.reduce((sum, b) => sum + Number(b.totalPlafon || 0), 0);
  }, [budgets]);

  const totalRealisasi = useMemo(() => {
    return budgets.reduce((sum, b) => sum + Number(b.totalRealisasi || 0), 0);
  }, [budgets]);

  const burnRate = useMemo(() => {
    if (totalPlafon === 0) return 0;
    return Math.min(Math.round((totalRealisasi / totalPlafon) * 100), 100);
  }, [totalPlafon, totalRealisasi]);

  // Average special fund expense
  const avgSpecialExpense = useMemo(() => {
    const specialTxsThisMonth = kasKeluarSpecial.filter(item => {
      const d = new Date(item.transactionDate);
      return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    });
    if (specialTxsThisMonth.length === 0) return 0;
    const sum = specialTxsThisMonth.reduce((acc, curr) => acc + Number(curr.amount), 0);
    return Math.round(sum / specialTxsThisMonth.length);
  }, [kasKeluarSpecial]);

  // Cascading data processing engine:
  // 1. Filter by time
  const filteredByTime = useMemo(() => {
    if (timeRange === 'ALL') return currentTransactions;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return currentTransactions.filter(item => {
      const d = new Date(item.transactionDate);
      if (timeRange === 'THIS_MONTH') {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      if (timeRange === 'LAST_MONTH') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      }
      return true;
    });
  }, [currentTransactions, timeRange]);

  // 2. Filter by search term
  const searchedData = useMemo(() => {
    if (!searchTerm) return filteredByTime;
    const term = searchTerm.toLowerCase();
    return filteredByTime.filter(item =>
      item.description.toLowerCase().includes(term) ||
      item.transactionNo.toLowerCase().includes(term) ||
      (item.fundCategory?.name || '').toLowerCase().includes(term) ||
      (item.expenseType?.name || '').toLowerCase().includes(term)
    );
  }, [filteredByTime, searchTerm]);

  // 3. Sort data
  const sortedData = useMemo(() => {
    const dataCopy = [...searchedData];
    return dataCopy.sort((a, b) => {
      if (sortBy === 'LATEST') {
        return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
      }
      if (sortBy === 'AMOUNT_DESC') {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortBy === 'AMOUNT_ASC') {
        return Number(a.amount) - Number(b.amount);
      }
      return 0;
    });
  }, [searchedData, sortBy]);

  // 4. Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedData.length / itemsPerPage);
  }, [sortedData, itemsPerPage]);

  // Reset page to 1 when filters or active tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, timeRange, sortBy]);

  // 7. Memoize daily trend chart dataset
  const trendDataset = useMemo(() => {
    const dailySums: Record<string, number> = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Sort transactions chronologically
    const sorted = [...currentTransactions]
      .filter(item => {
        const d = new Date(item.transactionDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());

    sorted.forEach(item => {
      const d = new Date(item.transactionDate);
      const day = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      dailySums[day] = (dailySums[day] || 0) + Number(item.amount);
    });

    const chartData = Object.entries(dailySums).map(([date, jumlah]) => ({
      date,
      jumlah
    }));

    return chartData.length > 0 ? chartData : [];
  }, [currentTransactions]);

  // Dataset Alokasi Jenis Belanja untuk MiniLedger
  const categoryDataset = useMemo<LedgerItem[]>(() => {
    const sums: Record<string, number> = {};
    let total = 0;

    currentTransactions.forEach(item => {
      const name = activeTab === 'PERMANENT'
        ? (item.expenseType?.name || 'Lain-lain')
        : (item.specialFund?.name || 'Lain-lain');
      sums[name] = (sums[name] || 0) + Number(item.amount);
      total += Number(item.amount);
    });

    if (total === 0) {
      return [];
    }

    const colors = ['#e11d48', '#f59e0b', '#7c3aed', '#0284c7', '#10b981', '#94a3b8'];
    return Object.entries(sums).map(([name, sum], index) => ({
      name,
      value: sum,
      percentage: total > 0 ? (sum / total) * 100 : 0,
      color: colors[index % colors.length],
    }));
  }, [currentTransactions, activeTab]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-medium text-slate-800 tracking-tight">Manajemen Kas Keluar</h2>
          <p className="text-sm text-gray-500">Pantau pengeluaran operasional dan kegiatan paroki secara real-time.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs border-slate-200 rounded-none">
            <Download size={16} /> Export Laporan
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 shadow-none text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-none">
            <Plus size={16} /> Catat Pengeluaran
          </Button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar pb-0 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('PERMANENT')}
          className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${activeTab === 'PERMANENT'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent hover:text-slate-700 hover:border-slate-300'
            }`}
        >
          Pos Dana Permanen
        </button>
        <button
          onClick={() => setActiveTab('SPECIAL_FUND')}
          className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${activeTab === 'SPECIAL_FUND'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent hover:text-slate-700 hover:border-slate-300'
            }`}
        >
          Dana Khusus
        </button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-semibold">
            {activeTab === 'PERMANENT' ? 'Total Keluar (Bulan Ini)' : 'Keluar Dana Khusus (Bulan Ini)'}
          </p>
          <h4 className="text-lg font-semibold mt-1 text-rose-600 tracking-tight">{formatIDR(totalKeluarBulanIni)}</h4>
          <p className="text-[9px] text-emerald-600 mt-2 font-medium">✓ Terkalkulasi dari pengeluaran riil</p>
        </Card>

        {activeTab === 'PERMANENT' ? (
          <Card className="p-4 border border-slate-200 shadow-sm">
            <p className="text-[10px] text-slate-400 font-semibold">Burn Rate Anggaran</p>
            <div className="flex items-end gap-1.5 mt-1">
              <h4 className="text-lg font-semibold text-slate-800 tracking-tight">{burnRate}%</h4>
              <p className="text-[9px] text-slate-400 font-medium mb-0.5">terpakai</p>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-none mt-3 overflow-hidden">
              <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${burnRate}%` }}></div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 border border-slate-200 shadow-sm">
            <p className="text-[10px] text-slate-400 font-semibold">Rata-rata Pengeluaran</p>
            <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{formatIDR(avgSpecialExpense)}</h4>
            <div className="flex items-center gap-1 mt-2 text-amber-600 font-medium text-[10px]">
              <TrendingUp size={12} />
              <span>Rata-rata Bulan Ini</span>
            </div>
          </Card>
        )}

        <Card className="p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-semibold">Transaksi (Bulan Ini)</p>
          <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{transBulanIniCount}</h4>
          <p className="text-[9px] text-blue-600 mt-2 font-medium flex items-center gap-1">
            <Info size={10} /> Tercatat di sistem bulan berjalan
          </p>
        </Card>

        <Card className="p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-semibold">
            {activeTab === 'PERMANENT' ? 'Saldo Kas Saat Ini' : 'Sisa Saldo Dana Khusus'}
          </p>
          <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{formatIDR(totalSaldoKas)}</h4>
          <p className="text-[9px] text-emerald-600 mt-2 font-medium">✓ Sinkron dengan neraca Pos Dana</p>
        </Card>
      </div>

      {/* Analytics & Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart */}
        <Card className="lg:col-span-8 p-5 border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <ArrowUpRight size={14} className="text-rose-500" /> Tren {activeTab === 'PERMANENT' ? 'Pengeluaran' : 'Pengeluaran Dana Khusus'} Bulanan
            </h3>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendDataset}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                  tickFormatter={(val) => formatIDR(val, { notation: 'compact' })}
                />
                <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }} />
                <Line type="monotone" dataKey="jumlah" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 3, fill: '#e11d48' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut & Ledger (Menerapkan Standardisasi Asymmetric Split & Progressive Help) */}
        <div className="lg:col-span-4">
          <ChartCard
            title={activeTab === 'PERMANENT' ? 'Alokasi Jenis Belanja' : 'Penyebaran Program'}
            subtitle="Bulan Berjalan"
            helpText={`Prosedur Pengeluaran:\n\n1. Setiap pengeluaran di atas Rp 500.000 wajib mendapatkan approval dari Pastor Paroki terlebih dahulu.\n2. Nota fisik yang sah harus diupload ke sistem berupa file gambar/PDF.\n3. Sistem akan otomatis meregistrasikan SPJ jika file bukti nota diupload.`}
            chartElement={
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryDataset}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDataset.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatIDR(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            }
          >
            <MiniLedger items={categoryDataset} maxHeightClass="max-h-[220px]" />
          </ChartCard>
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-4">
        <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200/60 rounded-none w-full lg:w-80">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nomor transaksi, rincian, atau kategori..."
              className="bg-transparent outline-none text-xs w-full text-slate-800 font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Rentang Waktu */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rentang Waktu:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-semibold rounded-none outline-none focus:border-slate-400 text-slate-700 cursor-pointer h-8"
              >
                <option value="ALL">Semua Waktu</option>
                <option value="THIS_MONTH">Bulan Ini</option>
                <option value="LAST_MONTH">Bulan Lalu</option>
              </select>
            </div>

            {/* Urutan */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urutan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-semibold rounded-none outline-none focus:border-slate-400 text-slate-700 cursor-pointer h-8"
              >
                <option value="LATEST">Terbaru</option>
                <option value="OLDEST">Terlama</option>
                <option value="AMOUNT_DESC">Nominal Tertinggi</option>
                <option value="AMOUNT_ASC">Nominal Terendah</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-none shadow-sm flex items-center justify-center gap-2.5 font-semibold text-xs">
            <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-none animate-spin"></div>
            Loading data transaksi kas keluar...
          </div>
        ) : (
          <AdaptiveList
            data={paginatedData}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages,
              totalItems: sortedData.length,
              itemsPerPage,
              onPageChange: setCurrentPage,
            }}
            desktopHeaders={[
              'No. Transaksi',
              'Tanggal',
              'Rincian Pengeluaran',
              'Pos Dana / Jenis',
              'Nominal',
              'Status',
              'Bukti'
            ]}
            renderDesktopRow={(item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 text-xs font-semibold text-rose-600 border-r">{item.transactionNo}</td>
                <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold border-r">
                  {new Date(item.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </td>
                <td className="px-5 py-3.5 text-xs font-medium text-slate-700 border-r max-w-[280px] truncate" title={item.description}>
                  {item.description}
                </td>
                <td className="px-5 py-3.5 border-r">
                  <div className="flex flex-col gap-0.5 items-start">
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 text-rose-600 rounded-none tracking-tight">
                      {item.fundCategory?.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 tracking-tight mt-0.5">
                      {item.expenseType?.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs font-semibold text-right text-rose-600 border-r">{formatIDR(Number(item.amount))}</td>
                <td className="px-5 py-3.5 border-r">
                  {item.status === 'MENUNGGU_SPJ' ? (
                    <div className="flex flex-col gap-1.5 items-start">
                      <Badge variant="warning">Menunggu SPJ</Badge>
                      <button
                        title="Upload SPJ"
                        onClick={() => {
                          setSelectedTransactionId(item.id);
                          setIsSpjUploadOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 border border-transparent hover:border-slate-200 transition-colors rounded-none"
                      >
                        <UploadCloud size={14} />
                      </button>
                    </div>
                  ) : (
                    <Badge variant="success">Selesai</Badge>
                  )}
                </td>
                <td className="px-5 py-3.5 text-center">
                  {item.attachment?.fileUrl ? (
                    <a
                      href={`${apiAssetUrl}${item.attachment.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 inline-block hover:bg-slate-100 border border-slate-200 rounded-none text-rose-600 hover:text-rose-700 transition-all"
                      title={item.attachment.fileName}
                    >
                      <FileImage size={14} />
                    </a>
                  ) : (
                    <span className="text-slate-300 font-medium text-[10px]">-</span>
                  )}
                </td>
              </tr>
            )}
            renderMobileCard={(item) => (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-rose-600">{item.transactionNo}</span>
                  {item.status === 'MENUNGGU_SPJ' ? (
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="warning">Menunggu SPJ</Badge>
                      <button
                        title="Upload SPJ"
                        onClick={() => {
                          setSelectedTransactionId(item.id);
                          setIsSpjUploadOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 border border-transparent hover:border-slate-200 transition-colors rounded-none"
                      >
                        <UploadCloud size={13} />
                      </button>
                    </div>
                  ) : (
                    <Badge variant="success">Selesai</Badge>
                  )}
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-medium text-slate-700 max-w-[200px] truncate">{item.description}</span>
                  <span className="text-sm font-semibold text-rose-600">{formatIDR(Number(item.amount))}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                  <span>{new Date(item.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                  <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 text-rose-600 rounded-none tracking-tight text-[8px] font-semibold">
                      {item.fundCategory?.name}
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded-none text-slate-600 font-semibold tracking-tight text-[8px]">
                      {item.expenseType?.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const url = item.attachment?.fileUrl ? `${apiAssetUrl}${item.attachment.fileUrl}` : 'https://via.placeholder.com/600x800?text=Nota+Pembayaran+Fisik';
                    setSelectedBuktiUrl(url);
                  }}
                  className="mt-2 text-[10px] text-rose-600 hover:text-rose-700 font-semibold text-left cursor-pointer"
                >
                  Lihat Bukti
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* Receipt Preview Modal */}
      <Modal isOpen={!!selectedBuktiUrl} onClose={() => setSelectedBuktiUrl(null)} title="Bukti Transaksi Kas Keluar">
        {selectedBuktiUrl && (
          <div className="space-y-4">
            <div className="rounded-none overflow-hidden h-96 bg-slate-50 flex items-center justify-center">
              <img src={selectedBuktiUrl} alt="Bukti Pengeluaran" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setSelectedBuktiUrl(null)} variant="outline" size="sm" className="rounded-none">
                Tutup Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Input Pengeluaran Baru">
        <KasKeluarForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      {/* SPJ Upload Modal */}
      <Modal
        isOpen={isSpjUploadOpen}
        onClose={() => { setIsSpjUploadOpen(false); setSelectedTransactionId(undefined); }}
        title="Upload Dokumen Pertanggungjawaban Baru"
      >
        <SPJUploadModal
          defaultCashTransactionId={selectedTransactionId}
          onSuccess={() => {
            setIsSpjUploadOpen(false);
            setSelectedTransactionId(undefined);
          }}
          onCancel={() => {
            setIsSpjUploadOpen(false);
            setSelectedTransactionId(undefined);
          }}
        />
      </Modal>
    </div>
  );
};

export default KasKeluarPage;
