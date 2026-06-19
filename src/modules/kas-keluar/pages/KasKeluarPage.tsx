import { useState, useMemo, useEffect } from 'react';
import {
  Plus, Search, Download,
  FileImage, TrendingUp,
  Info, UploadCloud, Calendar
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { ChartCard } from '../../../shared/components/ui/ChartCard';
import { MiniLedger, type LedgerItem } from '../../../shared/components/ui/MiniLedger';
import { KasKeluarForm } from '../components/KasKeluarForm';
import { SPJUploadModal } from '../../spj/components/SPJUploadModal';
import { formatIDR } from '../../../shared/utils/formatter';
import { downloadCSV, downloadExcel } from '../../../shared/utils/export';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import churchLogo from '../../../assets/church.png';
import { useKasKeluarQuery } from '../hooks/useKasKeluarQuery';
import { useFundBalancesQuery } from '../../kas-masuk/hooks/useKasMasukQuery';
import { useAnggaranQuery } from '../../anggaran/hooks/useAnggaranQuery';
import { cn } from '../../../shared/utils/cn';

/**
 * Standardized high-contrast, high-density Kas Keluar Management page.
 * Implements optimized useMemo selectors to prevent rendering lags.
 * Integrates React Query for async Server State and AdaptiveList for responsive layouts.
 * Fully interactive with dynamic chart updates, sharp-edge visual styling, and receipt preview modal.
 * Uses Single Source of Truth for Filtered Data cascading data engine.
 */
const KasKeluarPage = () => {
  const { data: kasKeluar = [], isLoading } = useKasKeluarQuery();
  const { data: fundBalances = [] } = useFundBalancesQuery();
  const { data: budgets = [] } = useAnggaranQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSpjUploadOpen, setIsSpjUploadOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | undefined>(undefined);
  const [selectedBuktiUrl, setSelectedBuktiUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PERMANENT' | 'SPECIAL_FUND'>('PERMANENT');
  const [timeRange, setTimeRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR'>('ALL');
  const [selectedFundCategoryId, setSelectedFundCategoryId] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'LATEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('LATEST');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate base API asset paths dynamically
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

  // Extract unique Pos Dana options dynamically
  const fundCategoryOptions = useMemo(() => {
    const categories = new Map<string, string>(); // id -> name
    currentTransactions.forEach(item => {
      if (item.fundCategory) {
        categories.set(item.fundCategory.id, item.fundCategory.name);
      }
    });
    return Array.from(categories.entries()).map(([id, name]) => ({ id, name }));
  }, [currentTransactions]);

  // Reset selected fund category when switching tabs
  useEffect(() => {
    setSelectedFundCategoryId('ALL');
  }, [activeTab]);

  // Memoize overall cash balance (Sum of all active Pos Dana balances for current tab)
  const totalSaldoKas = useMemo(() => {
    return fundBalances.reduce((sum, item) => {
      const isSpecial = item.fund.startsWith('Dana Khusus:');
      const shouldInclude = activeTab === 'PERMANENT' ? !isSpecial : isSpecial;
      return sum + (shouldInclude ? Number(item.balance || 0) : 0);
    }, 0);
  }, [fundBalances, activeTab]);

  // Cascading data processing engine:
  // 1. Filter by time and fund category
  const filteredByTimeAndFund = useMemo(() => {
    let result = currentTransactions;

    if (selectedFundCategoryId !== 'ALL') {
      result = result.filter(item => item.fundCategoryId === selectedFundCategoryId);
    }

    if (timeRange === 'ALL') return result;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return result.filter(item => {
      const d = new Date(item.transactionDate);
      if (timeRange === 'THIS_MONTH') {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      if (timeRange === 'LAST_MONTH') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      }
      if (timeRange === 'THIS_YEAR') {
        return d.getFullYear() === currentYear;
      }
      return true;
    });
  }, [currentTransactions, timeRange, selectedFundCategoryId]);

  // 2. Filter by search term
  const searchedData = useMemo(() => {
    if (!searchTerm) return filteredByTimeAndFund;
    const term = searchTerm.toLowerCase();
    return filteredByTimeAndFund.filter(item =>
      item.description.toLowerCase().includes(term) ||
      item.transactionNo.toLowerCase().includes(term) ||
      (item.fundCategory?.name || '').toLowerCase().includes(term) ||
      (item.expenseType?.name || '').toLowerCase().includes(term)
    );
  }, [filteredByTimeAndFund, searchTerm]);

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
  }, [activeTab, searchTerm, timeRange, sortBy, selectedFundCategoryId]);

  // Memoize total expense for the filtered searchedData
  const totalKeluarFiltered = useMemo(() => {
    return searchedData.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [searchedData]);

  // Memoize number of transactions logged in searchedData
  const transFilteredCount = useMemo(() => {
    return searchedData.length;
  }, [searchedData]);

  // Memoize entire paroki budget burn rate
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

  // Average special fund expense in searchedData
  const avgSpecialExpense = useMemo(() => {
    if (searchedData.length === 0) return 0;
    const sum = searchedData.reduce((acc, curr) => acc + Number(curr.amount), 0);
    return Math.round(sum / searchedData.length);
  }, [searchedData]);

  // Tren harian/bulanan BERSUMBER DARI searchedData
  const trendDataset = useMemo(() => {
    const dataMap = new Map<string, number>();
    const isLongRange = timeRange === 'THIS_YEAR' || timeRange === 'ALL';

    if (isLongRange) {
      // Group by months of the year
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      months.forEach(m => dataMap.set(m, 0));

      searchedData.forEach((item) => {
        const d = new Date(item.transactionDate);
        const monthIndex = d.getMonth();
        const key = months[monthIndex];
        if (dataMap.has(key)) {
          dataMap.set(key, dataMap.get(key)! + Number(item.amount));
        }
      });

      return Array.from(dataMap.entries()).map(([date, jumlah]) => ({
        date,
        jumlah,
      }));
    } else {
      // Daily grouping based on timeRange
      if (timeRange === 'LAST_MONTH') {
        const now = new Date();
        const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const numDays = new Date(ly, lm + 1, 0).getDate();

        for (let i = 0; i < numDays; i++) {
          const d = new Date(ly, lm, i + 1);
          const key = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
          dataMap.set(key, 0);
        }
      } else if (timeRange === 'THIS_MONTH') {
        const now = new Date();
        const tm = now.getMonth();
        const ty = now.getFullYear();
        const numDays = new Date(ty, tm + 1, 0).getDate();

        for (let i = 0; i < numDays; i++) {
          const d = new Date(ty, tm, i + 1);
          const key = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
          dataMap.set(key, 0);
        }
      } else {
        // Last 30 days rolling
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
          dataMap.set(key, 0);
        }
      }

      searchedData.forEach((item) => {
        const d = new Date(item.transactionDate);
        const key = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        if (dataMap.has(key)) {
          dataMap.set(key, dataMap.get(key)! + Number(item.amount));
        }
      });

      return Array.from(dataMap.entries()).map(([date, jumlah]) => ({
        date,
        jumlah,
      }));
    }
  }, [searchedData, timeRange]);

  // Dataset Alokasi Jenis Belanja untuk MiniLedger & PieChart BERSUMBER DARI searchedData
  const categoryDataset = useMemo<LedgerItem[]>(() => {
    const sums: Record<string, number> = {};
    let total = 0;

    searchedData.forEach(item => {
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
  }, [searchedData, activeTab]);

  const getPosDanaDot = (fundName: string) => {
    const key = fundName.toLowerCase();
    let dotColor = 'bg-slate-400';
    let label = fundName;

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
    } else if (key.includes('pembangunan')) {
      dotColor = 'bg-blue-500';
      label = 'Pembangunan';
    } else if (key.includes('kapel')) {
      dotColor = 'bg-indigo-600';
      label = 'Dana Khusus Kapel';
    } else if (key.includes('ambulans')) {
      dotColor = 'bg-emerald-600';
      label = 'Dana Khusus Ambulans';
    } else if (key.includes('pastoran')) {
      dotColor = 'bg-amber-600';
      label = 'Dana Khusus Pastoran';
    }

    return (
      <div className="flex items-center gap-2">
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)}></span>
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      </div>
    );
  };

  const handleExportCSV = () => {
    const filename = `laporan_kas_keluar_${activeTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    const headers = ['Tanggal', 'Deskripsi/Rincian', 'Pos Dana', 'Jenis Pengeluaran', 'Nominal (IDR)', 'Status'];
    const rows = searchedData.map(item => [
      new Date(item.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      item.description,
      item.fundCategory?.name || '',
      item.expenseType?.name || (item.specialFund?.name ? 'Dana Khusus' : 'Lain-lain'),
      String(item.amount),
      item.status === 'MENUNGGU_SPJ' ? 'Menunggu SPJ' : 'Selesai'
    ]);
    downloadCSV(filename, headers, rows);
  };

  const getBase64ImageFromUrl = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error(e);
      return '';
    }
  };

  const handleExportExcel = async () => {
    const logoBase64 = await getBase64ImageFromUrl(churchLogo);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `laporan_kas_keluar_${activeTab.toLowerCase()}_${timestamp}.xls`;
    const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeRangeLabels: Record<string, string> = {
      ALL: 'Semua Waktu',
      THIS_MONTH: 'Bulan Ini',
      LAST_MONTH: 'Bulan Lalu',
      THIS_YEAR: 'Tahun Ini'
    };
    const timeRangeLabel = timeRangeLabels[timeRange] || timeRange;
    const selectedFundLabel = selectedFundCategoryId === 'ALL'
      ? 'Semua Pos Dana'
      : fundCategoryOptions.find(f => f.id === selectedFundCategoryId)?.name || 'Terfilter';

    const rowsHtml = searchedData.map((item, idx) => {
      const statusLabel = item.status === 'MENUNGGU_SPJ' ? 'Menunggu SPJ' : 'Selesai';
      const statusColorStyle = item.status === 'MENUNGGU_SPJ' ? 'color: #b45309; font-weight: bold;' : 'color: #15803d; font-weight: bold;';
      return `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="text-align: center;">${new Date(item.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
          <td style="text-align: center; font-family: monospace;">${item.transactionNo}</td>
          <td>${item.description}</td>
          <td>${item.fundCategory?.name || ''}</td>
          <td>${item.expenseType?.name || (item.specialFund?.name ? 'Dana Khusus' : 'Lain-lain')}</td>
          <td class="text-right mso-number text-red">${item.amount}</td>
          <td style="text-align: center; ${statusColorStyle}">${statusLabel}</td>
        </tr>
      `;
    }).join('');

    const tableHtml = `
      <table>
        <tr>
          <td rowspan="4" style="border: none; text-align: center; vertical-align: middle; width: 60px;">
            ${logoBase64 ? `<img src="${logoBase64}" width="50" height="50" />` : ''}
          </td>
          <td colspan="7" style="font-size: 14pt; font-weight: bold; text-align: left; border: none; padding-left: 10px;">KEUSKUPAN AGUNG MERAUKE</td>
        </tr>
        <tr>
          <td colspan="7" style="font-size: 12pt; font-weight: bold; text-align: left; border: none; padding-left: 10px;">Paroki St. Stefanus - Sempan</td>
        </tr>
        <tr>
          <td colspan="7" style="font-size: 11pt; font-weight: bold; text-align: left; border: none; text-decoration: underline; padding-left: 10px;">LAPORAN TRANSAKSI KAS KELUAR (${activeTab === 'PERMANENT' ? 'POS DANA PERMANEN' : 'DANA KHUSUS'})</td>
        </tr>
        <tr>
          <td colspan="7" style="font-size: 9pt; text-align: left; border: none; padding-bottom: 20px; padding-left: 10px;">Rentang Waktu: ${timeRangeLabel} | Pos Dana: ${selectedFundLabel}</td>
        </tr>
        <tr><td colspan="8" style="border: none;">&nbsp;</td></tr>
        <thead>
          <tr class="bg-header">
            <th style="width: 40px; background-color: #1e293b; color: #ffffff;">No</th>
            <th style="width: 90px; background-color: #1e293b; color: #ffffff;">Tanggal</th>
            <th style="width: 130px; background-color: #1e293b; color: #ffffff;">No Transaksi</th>
            <th style="width: 250px; background-color: #1e293b; color: #ffffff;">Rincian Pengeluaran</th>
            <th style="width: 150px; background-color: #1e293b; color: #ffffff;">Pos Dana</th>
            <th style="width: 150px; background-color: #1e293b; color: #ffffff;">Jenis Pengeluaran</th>
            <th style="width: 120px; background-color: #1e293b; color: #ffffff; text-align: right;">Nominal (IDR)</th>
            <th style="width: 120px; background-color: #1e293b; color: #ffffff;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="bg-total">
            <td colspan="6" style="text-align: right; font-weight: bold;">TOTAL PENGELUARAN</td>
            <td class="text-right font-bold mso-number text-red">${totalKeluarFiltered}</td>
            <td>&nbsp;</td>
          </tr>
        </tbody>
        <tr><td colspan="8" style="border: none;">&nbsp;</td></tr>
        <tr><td colspan="8" style="border: none;">&nbsp;</td></tr>
        <tr>
          <td colspan="3" style="text-align: center; border: none; font-weight: bold;">Mengetahui,</td>
          <td colspan="2" style="border: none;">&nbsp;</td>
          <td colspan="3" style="text-align: center; border: none; font-weight: bold;">Sempan, ${todayFormatted}</td>
        </tr>
        <tr>
          <td colspan="3" style="text-align: center; border: none; font-weight: bold;">Pastor Paroki</td>
          <td colspan="2" style="border: none;">&nbsp;</td>
          <td colspan="3" style="text-align: center; border: none; font-weight: bold;">Bendahara Paroki</td>
        </tr>
         <tr><td colspan="8" style="height: 50px; border: none;">&nbsp;</td></tr>
        <tr>
          <td colspan="3" style="text-align: center; border: none; font-weight: bold; text-decoration: underline;">RP. Johannes Surono</td>
          <td colspan="2" style="border: none;">&nbsp;</td>
          <td colspan="3" style="text-align: center; border: none; font-weight: bold; text-decoration: underline;">Yuliana Shanti</td>
        </tr>
      </table>
    `.trim();

    downloadExcel(filename, tableHtml);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-medium text-slate-800 tracking-tight">Manajemen Kas Keluar</h2>
          <p className="text-sm text-gray-500">Pantau pengeluaran operasional dan kegiatan paroki secara real-time.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsExportModalOpen(true)} variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs border-slate-200 rounded-none">
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
            {activeTab === 'PERMANENT' ? 'Total Keluar (Filtered)' : 'Keluar Dana Khusus (Filtered)'}
          </p>
          <h4 className="text-lg font-semibold mt-1 text-rose-600 tracking-tight">{formatIDR(totalKeluarFiltered)}</h4>
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
              <span>Rata-rata Pengeluaran</span>
            </div>
          </Card>
        )}

        <Card className="p-4 border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-semibold">Transaksi (Dalam Filter)</p>
          <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{transFilteredCount}</h4>
          <p className="text-[9px] text-blue-600 mt-2 font-medium flex items-center gap-1">
            <Info size={10} /> Tercatat dalam filter aktif
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

      {/* Inline Toolbar (Moved above charts) */}
      <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200/60 rounded-none w-full lg:w-80">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari rincian pengeluaran, ref, pos dana..."
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
              <option value="THIS_YEAR">Tahun Ini</option>
            </select>
          </div>

          {/* Pos Dana Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pos Dana:</span>
            <select
              value={selectedFundCategoryId}
              onChange={(e) => setSelectedFundCategoryId(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-semibold rounded-none outline-none focus:border-slate-400 text-slate-700 cursor-pointer h-8"
            >
              <option value="ALL">Semua Pos Dana</option>
              {fundCategoryOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
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

      {/* Analytics & Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Trend Area Chart */}
        <Card className="lg:col-span-8 p-5 border-slate-200 shadow-sm flex flex-col justify-between rounded-none">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar size={14} className="text-rose-500" /> Tren {activeTab === 'PERMANENT' ? 'Pengeluaran' : 'Pengeluaran Dana Khusus'} ({timeRange === 'ALL' ? 'Semua Waktu' : timeRange === 'THIS_MONTH' ? 'Bulan Ini' : timeRange === 'LAST_MONTH' ? 'Bulan Lalu' : 'Tahun Ini'})
            </h3>
          </div>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendDataset} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                  tickFormatter={(val) => formatIDR(val, { notation: 'compact' })}
                />
                <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '0px', fontSize: '11px', fontWeight: 600 }} formatter={(val) => formatIDR(Number(val))} />
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
              'Tanggal',
              'Rincian Pengeluaran',
              'Pos Dana / Jenis',
              'Nominal',
              'Status',
              'Bukti'
            ]}
            renderDesktopRow={(item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold border-r text-center">
                  {new Date(item.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </td>
                <td className="px-5 py-3.5 text-xs font-medium text-slate-700 border-r max-w-[320px] truncate" title={item.description}>
                  {item.description}
                </td>
                <td className="px-5 py-3.5 border-r">
                  <div className="flex flex-col gap-1 items-start">
                    {getPosDanaDot(item.fundCategory?.name || '')}
                    <span className="text-[10px] font-semibold text-slate-500 ml-3.5">
                      {item.expenseType?.name || (item.specialFund?.name ? 'Dana Khusus' : 'Lain-lain')}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs font-mono font-medium text-right text-rose-600 border-r">{formatIDR(Number(item.amount))}</td>
                <td className="px-5 py-3.5 border-r text-center">
                  {item.status === 'MENUNGGU_SPJ' ? (
                    <div className="flex flex-col items-center gap-1.5 justify-center">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse"></span>
                        <span className="text-[11px] font-semibold text-amber-700">Menunggu SPJ</span>
                      </div>
                      <button
                        title="Upload SPJ"
                        onClick={() => {
                          setSelectedTransactionId(item.id);
                          setIsSpjUploadOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-blue-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all font-semibold rounded-none shadow-sm cursor-pointer"
                      >
                        <UploadCloud size={11} /> Upload
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="text-[11px] font-semibold text-emerald-700">Selesai</span>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5 text-center">
                  {item.attachment?.fileUrl ? (
                    <a
                      href={`${apiAssetUrl}${item.attachment.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-50 border border-slate-200 hover:border-rose-200 transition-all rounded-none shadow-sm"
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
                  <span className="text-xs text-slate-500 font-medium">{new Date(item.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                  {item.status === 'MENUNGGU_SPJ' ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-amber-700">Menunggu SPJ</span>
                      </div>
                      <button
                        title="Upload SPJ"
                        onClick={() => {
                          setSelectedTransactionId(item.id);
                          setIsSpjUploadOpen(true);
                        }}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all rounded-none"
                      >
                        <UploadCloud size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="text-[10px] font-bold text-emerald-700">Selesai</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-slate-800 max-w-[220px] truncate">
                    {item.description}
                  </span>
                  <span className="text-sm font-semibold text-rose-600">{formatIDR(Number(item.amount))}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                  {getPosDanaDot(item.fundCategory?.name || '')}
                  <span className="text-[9px] font-semibold text-slate-400">
                    {item.expenseType?.name || (item.specialFund?.name ? 'Dana Khusus' : 'Lain-lain')}
                  </span>
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

      {/* Format Selection Modal */}
      {isExportModalOpen && (
        <Modal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title="Pilih Format Export Laporan"
        >
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Silakan pilih format file laporan kas keluar yang ingin Anda unduh. Laporan yang diunduh akan otomatis terfilter sesuai dengan kata kunci, rentang waktu, dan pos dana yang aktif.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => {
                  handleExportExcel();
                  setIsExportModalOpen(false);
                }}
                className="flex flex-col items-center justify-center p-6 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-none transition-all group cursor-pointer outline-none focus:border-emerald-500"
              >
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-none group-hover:bg-emerald-100 transition-colors mb-3">
                  <Download size={24} />
                </div>
                <span className="text-xs font-bold text-slate-800">Microsoft Excel</span>
                <span className="text-[10px] text-slate-400 mt-1 font-semibold">Template Terformat (.xls)</span>
              </button>

              <button
                onClick={() => {
                  handleExportCSV();
                  setIsExportModalOpen(false);
                }}
                className="flex flex-col items-center justify-center p-6 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 rounded-none transition-all group cursor-pointer outline-none focus:border-slate-800"
              >
                <div className="p-3 bg-slate-100 text-slate-600 rounded-none group-hover:bg-slate-200 transition-colors mb-3">
                  <Download size={24} />
                </div>
                <span className="text-xs font-bold text-slate-800">Raw Data CSV</span>
                <span className="text-[10px] text-slate-400 mt-1 font-semibold">Teks Terpisah Koma (.csv)</span>
              </button>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-none text-xs border-slate-200"
                onClick={() => setIsExportModalOpen(false)}
              >
                Batal
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default KasKeluarPage;
