import { useState, useMemo, useEffect } from 'react';
import {
  Plus, Search, Download, MoreVertical,
  TrendingUp, Calendar,
  Info
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { Badge } from '../../../shared/components/ui/Badge';
import { ChartCard } from '../../../shared/components/ui/ChartCard';
import { MiniLedger, type LedgerItem } from '../../../shared/components/ui/MiniLedger';
import { KasMasukForm } from '../components/KasMasukForm';
import type { KasMasukInput } from '../types/kas-masuk';
import { useActivityStore } from '../../../app/store/useActivityStore';
import { useNotificationStore } from '../../../app/store/useNotificationStore';
import { formatIDR } from '../../../shared/utils/formatter';
import { downloadCSV, downloadExcel } from '../../../shared/utils/export';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import churchLogo from '../../../assets/church.png';
import { useKasMasukQuery, useAddKasMasukMutation, useFundBalancesQuery } from '../hooks/useKasMasukQuery';
import { cn } from '../../../shared/utils/cn';

/**
 * Standardized high-contrast, high-density Kas Masuk Management page.
 * Implements optimized useMemo selectors to prevent rendering lags.
 * Integrates React Query for async Server State and AdaptiveList for responsive layouts.
 * Uses Single Source of Truth for Filtered Data cascading data engine.
 */
const KasMasukPage = () => {
  const { data: kasMasuk = [], isLoading } = useKasMasukQuery();
  useFundBalancesQuery();
  const addMutation = useAddKasMasukMutation();
  const addLog = useActivityStore((state) => state.addLog);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'PERMANENT' | 'SPECIAL_FUND'>('PERMANENT');
  const [timeRange, setTimeRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR'>('ALL');
  const [selectedFundCategoryId, setSelectedFundCategoryId] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'LATEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('LATEST');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const onFormSubmit = (data: KasMasukInput) => {
    addMutation.mutate({
      transaction_date: data.transaction_date,
      fund_category_id: data.fund_category_id,
      income_type_id: data.income_type_id,
      amount: data.amount,
      description: data.description,
      parent_transaction_id: data.parent_transaction_id || undefined,
      special_fund_id: data.special_fund_id || undefined,
    }, {
      onSuccess: () => {
        addLog(
          `Penerimaan Kas - ${data.description}`,
          data.amount,
          'in'
        );
        addNotification(
          'Transaksi Pemasukan Baru',
          `Penerimaan kas sebesar ${formatIDR(data.amount)} untuk "${data.description}" berhasil dicatat.`,
          'success'
        );
        handleCloseModal();
      }
    });
  };

  // Split transactions
  const kasMasukPermanent = useMemo(() => {
    return kasMasuk.filter(item => !item.specialFundId);
  }, [kasMasuk]);

  const kasMasukSpecial = useMemo(() => {
    return kasMasuk.filter(item => !!item.specialFundId);
  }, [kasMasuk]);

  // Current transactions based on active tab
  const currentTransactions = useMemo(() => {
    return activeTab === 'PERMANENT' ? kasMasukPermanent : kasMasukSpecial;
  }, [activeTab, kasMasukPermanent, kasMasukSpecial]);

  // Extract Pos Dana options dynamically based on current transactions
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

  // Cascading data processing engine:
  // 1. Filter by time and fund category
  const filteredByTimeAndFund = useMemo(() => {
    let result = currentTransactions;

    // Filter by Pos Dana if not 'ALL'
    if (selectedFundCategoryId !== 'ALL') {
      result = result.filter(item => item.fundCategoryId === selectedFundCategoryId);
    }

    // Filter by time range
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
      (item.incomeType?.name || '').toLowerCase().includes(term)
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

  // Memoize analytical calculations BERSUMBER DARI searchedData (Single Source of Truth)
  const totalNominal = useMemo(() => {
    return searchedData.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [searchedData]);

  // Target Penerimaan (bulanan): Rp 50.000.000
  const targetBulanan = 50000000;
  const progressTarget = useMemo(() => {
    return Math.min(Math.round((totalNominal / targetBulanan) * 100), 100);
  }, [totalNominal]);

  // Rata-rata special fund income
  const avgSpecialIncome = useMemo(() => {
    if (searchedData.length === 0) return 0;
    const sum = searchedData.reduce((acc, curr) => acc + Number(curr.amount), 0);
    return Math.round(sum / searchedData.length);
  }, [searchedData]);

  // Sumber Terbesar
  const sumberTerbesar = useMemo(() => {
    if (searchedData.length === 0) {
      return { description: 'Belum ada data', amount: 0, percentage: 0 };
    }
    const maxTx = searchedData.reduce((prev, current) => {
      return (Number(prev.amount) > Number(current.amount)) ? prev : current;
    }, searchedData[0]);
    const percentage = totalNominal > 0 ? Math.round((Number(maxTx.amount) / totalNominal) * 100) : 0;
    return {
      description: maxTx.description,
      amount: Number(maxTx.amount),
      percentage,
    };
  }, [searchedData, totalNominal]);

  // Transaksi hari ini
  const totalHariIni = useMemo(() => {
    const todayStr = new Date().toDateString();
    return searchedData.reduce((sum, item) => {
      const txStr = new Date(item.transactionDate).toDateString();
      if (txStr === todayStr) {
        return sum + Number(item.amount);
      }
      return sum;
    }, 0);
  }, [searchedData]);

  const countHariIni = useMemo(() => {
    const todayStr = new Date().toDateString();
    return searchedData.filter(item => {
      return new Date(item.transactionDate).toDateString() === todayStr;
    }).length;
  }, [searchedData]);

  // Tren harian/bulanan BERSUMBER DARI searchedData
  const trendData = useMemo(() => {
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

  // Dataset Komposisi Dana untuk MiniLedger & PieChart BERSUMBER DARI searchedData
  const categoryDataset = useMemo<LedgerItem[]>(() => {
    const colors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6', '#f43f5e'];

    // Group sum by fundCategory name
    const sums = new Map<string, number>();
    let totalIncome = 0;

    searchedData.forEach(item => {
      const name = item.fundCategory?.name || 'Lain-lain';
      const amount = Number(item.amount);
      sums.set(name, (sums.get(name) || 0) + amount);
      totalIncome += amount;
    });

    if (sums.size === 0) {
      return [];
    }

    return Array.from(sums.entries()).map(([name, value], index) => ({
      name,
      value,
      percentage: totalIncome > 0 ? (value / totalIncome) * 100 : 0,
      color: colors[index % colors.length],
    }));
  }, [searchedData]);

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
    const filename = `laporan_kas_masuk_${activeTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    const headers = ['Tanggal', 'Nomor Transaksi (Ref)', 'Deskripsi Pemasukan', 'Pos Dana', 'Jenis Penerimaan', 'Nominal (IDR)', 'Status'];
    const rows = searchedData.map(item => [
      new Date(item.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      item.transactionNo,
      item.description,
      item.fundCategory?.name || '',
      item.incomeType?.name || '',
      String(item.amount),
      'Selesai'
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
    const filename = `laporan_kas_masuk_${activeTab.toLowerCase()}_${timestamp}.xls`;
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

    const rowsHtml = searchedData.map((item, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="text-align: center;">${new Date(item.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
        <td style="text-align: center; font-family: monospace;">${item.transactionNo}</td>
        <td>${item.description}</td>
        <td>${item.fundCategory?.name || ''}</td>
        <td>${item.incomeType?.name || ''}</td>
        <td class="text-right mso-number text-green">${item.amount}</td>
      </tr>
    `).join('');

    const tableHtml = `
      <table>
        <tr>
          <td rowspan="4" style="border: none; text-align: center; vertical-align: middle; width: 60px;">
            ${logoBase64 ? `<img src="${logoBase64}" width="50" height="50" />` : ''}
          </td>
          <td colspan="6" style="font-size: 14pt; font-weight: bold; text-align: left; border: none; padding-left: 10px;">KEUSKUPAN AGUNG MERAUKE</td>
        </tr>
        <tr>
          <td colspan="6" style="font-size: 12pt; font-weight: bold; text-align: left; border: none; padding-left: 10px;">Paroki St. Stefanus - Sempan</td>
        </tr>
        <tr>
          <td colspan="6" style="font-size: 11pt; font-weight: bold; text-align: left; border: none; text-decoration: underline; padding-left: 10px;">LAPORAN TRANSAKSI KAS MASUK (${activeTab === 'PERMANENT' ? 'POS DANA PERMANEN' : 'DANA KHUSUS'})</td>
        </tr>
        <tr>
          <td colspan="6" style="font-size: 9pt; text-align: left; border: none; padding-bottom: 20px; padding-left: 10px;">Rentang Waktu: ${timeRangeLabel} | Pos Dana: ${selectedFundLabel}</td>
        </tr>
        <tr><td colspan="7" style="border: none;">&nbsp;</td></tr>
        <thead>
          <tr class="bg-header">
            <th style="width: 40px; background-color: #1e293b; color: #ffffff;">No</th>
            <th style="width: 90px; background-color: #1e293b; color: #ffffff;">Tanggal</th>
            <th style="width: 130px; background-color: #1e293b; color: #ffffff;">No Transaksi</th>
            <th style="width: 250px; background-color: #1e293b; color: #ffffff;">Deskripsi Pemasukan</th>
            <th style="width: 150px; background-color: #1e293b; color: #ffffff;">Pos Dana</th>
            <th style="width: 150px; background-color: #1e293b; color: #ffffff;">Jenis Penerimaan</th>
            <th style="width: 120px; background-color: #1e293b; color: #ffffff; text-align: right;">Nominal (IDR)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="bg-total">
            <td colspan="6" style="text-align: right; font-weight: bold;">TOTAL PEMASUKAN</td>
            <td class="text-right font-bold mso-number text-green">${totalNominal}</td>
          </tr>
        </tbody>
        <tr><td colspan="7" style="border: none;">&nbsp;</td></tr>
        <tr><td colspan="7" style="border: none;">&nbsp;</td></tr>
        <tr>
          <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Mengetahui,</td>
          <td colspan="3" style="border: none;">&nbsp;</td>
          <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Sempan, ${todayFormatted}</td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Pastor Paroki</td>
          <td colspan="3" style="border: none;">&nbsp;</td>
          <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Bendahara Paroki</td>
        </tr>
        <tr><td colspan="7" style="height: 50px; border: none;">&nbsp;</td></tr>
        <tr>
          <td colspan="2" style="text-align: center; border: none; font-weight: bold; text-decoration: underline;">RP. Johannes Surono</td>
          <td colspan="3" style="border: none;">&nbsp;</td>
          <td colspan="2" style="text-align: center; border: none; font-weight: bold; text-decoration: underline;">Yuliana Shanti</td>
        </tr>
      </table>
    `.trim();

    downloadExcel(filename, tableHtml);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-medium text-slate-800 tracking-tight">Manajemen Kas Masuk</h2>
          <p className="text-sm text-gray-500">Pantau dan catat seluruh penerimaan paroki.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsExportModalOpen(true)} variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs border-slate-200">
            <Download size={16} /> Export Laporan
          </Button>
          <Button onClick={handleOpenModal} className="flex-1 sm:flex-none flex items-center justify-center gap-2 shadow-sm text-xs bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={16} /> Transaksi Baru
          </Button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar pb-0 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('PERMANENT')}
          className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${activeTab === 'PERMANENT'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'border-transparent hover:text-slate-700 hover:border-slate-300'
            }`}
        >
          Pos Dana Permanen
        </button>
        <button
          onClick={() => setActiveTab('SPECIAL_FUND')}
          className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${activeTab === 'SPECIAL_FUND'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'border-transparent hover:text-slate-700 hover:border-slate-300'
            }`}
        >
          Dana Khusus
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-slate-200">
          <p className="text-[10px] text-slate-400 font-semibold">
            {activeTab === 'PERMANENT' ? 'Total Pemasukan (Filtered)' : 'Pemasukan Dana Khusus (Filtered)'}
          </p>
          <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{formatIDR(totalNominal)}</h4>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 font-medium text-[10px]">
            <TrendingUp size={12} />
            <span>
              {activeTab === 'PERMANENT' ? `Target: ${formatIDR(targetBulanan, { notation: 'compact' })}` : 'Program Dana Khusus'}
            </span>
          </div>
        </Card>

        {activeTab === 'PERMANENT' ? (
          <Card className="p-4 border border-slate-200">
            <p className="text-[10px] text-slate-400 font-semibold">Pencapaian Target</p>
            <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{progressTarget}%</h4>
            <div className="w-full bg-slate-100 h-1 rounded-none mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${progressTarget}%` }}></div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 border border-slate-200">
            <p className="text-[10px] text-slate-400 font-semibold">Rata-rata Sumbangan</p>
            <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{formatIDR(avgSpecialIncome)}</h4>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 font-medium text-[10px]">
              <TrendingUp size={12} />
              <span>Rata-rata Pemasukan</span>
            </div>
          </Card>
        )}

        <Card className="p-4 border border-slate-200">
          <p className="text-[10px] text-slate-400 font-semibold">
            {activeTab === 'PERMANENT' ? 'Sumber Terbesar' : 'Sumbangan Terbesar'}
          </p>
          <h4 className="text-sm font-semibold mt-2 text-slate-800 truncate tracking-tight" title={sumberTerbesar.description}>
            {sumberTerbesar.description}
          </h4>
          <p className="text-[9px] text-slate-400 mt-2 font-medium">
            {sumberTerbesar.amount > 0 ? `Kontribusi ${sumberTerbesar.percentage}% (${formatIDR(sumberTerbesar.amount, { notation: 'compact' })})` : 'Belum ada transaksi'}
          </p>
        </Card>

        <Card className="p-4 border border-slate-200">
          <p className="text-[10px] text-slate-400 font-semibold">Hari Ini (Dalam Filter)</p>
          <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{formatIDR(totalHariIni)}</h4>
          <p className="text-[9px] text-slate-400 mt-2 font-medium">{countHariIni} Transaksi masuk</p>
        </Card>
      </div>

      {/* Inline Toolbar (Moved above charts) */}
      <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200/60 rounded-none w-full lg:w-80">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari deskripsi, ref, pos dana..."
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

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolom Kiri: Card Grafik Tren */}
        <Card className="lg:col-span-8 p-5 border-slate-200 shadow-sm flex flex-col justify-between rounded-none">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-500" /> Tren {activeTab === 'PERMANENT' ? 'Penerimaan' : 'Pemasukan Dana Khusus'} ({timeRange === 'ALL' ? 'Semua Waktu' : timeRange === 'THIS_MONTH' ? 'Bulan Ini' : timeRange === 'LAST_MONTH' ? 'Bulan Lalu' : 'Tahun Ini'})
            </h3>
          </div>

          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                  tickFormatter={(val) => formatIDR(val, { notation: 'compact' })}
                />
                <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '0px', fontSize: '11px', fontWeight: 600 }} formatter={(val) => formatIDR(Number(val))} />
                <Line type="monotone" dataKey="jumlah" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3, fill: '#0284c7' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Kolom Kanan: Donut Chart & Ledger */}
        <div className="lg:col-span-4">
          <ChartCard
            title={activeTab === 'PERMANENT' ? 'Komposisi Dana' : 'Penyebaran Program'}
            subtitle="Bulan Berjalan"
            helpText={`Informasi Kas:\n\nHarap lakukan verifikasi fisik (hitung uang cash secara manual) secara teliti sebelum mengubah status transaksi kolekte menjadi "Selesai".\n\nSeluruh mutasi kas bank wajib dicocokkan secara berkala dengan rekening koran resmi.`}
            chartElement={
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
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
                </PieChart>
              </ResponsiveContainer>
            }
          >
            <MiniLedger items={categoryDataset} maxHeightClass="max-h-[220px]" />
          </ChartCard>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-none shadow-sm flex items-center justify-center gap-2.5 font-semibold text-xs">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
            Loading data transaksi kas masuk...
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
              'Deskripsi Pemasukan',
              'Pos Dana & Jenis',
              'Nominal (IDR)',
              'Status',
              'Aksi'
            ]}
            renderDesktopRow={(item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                {/* 1. Tanggal - Rata Kiri, Format Human Readable */}
                <td className="px-5 py-4 text-xs font-medium text-slate-500 border-r border-slate-100">
                  {new Date(item.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>

                {/* 2. Deskripsi Utama - Hierarki Tertinggi (Bold, Gelap) */}
                <td className="px-5 py-4 border-r border-slate-100 max-w-[300px]">
                  <p className="text-xs font-semibold text-slate-800 truncate" title={item.description}>
                    {item.description}
                  </p>
                  {/* Tampilkan No Transaksi sebagai subtitel */}
                  <p className="text-[9.5px] font-mono text-slate-400 mt-1 tracking-tighter">
                    Ref: {item.transactionNo}
                  </p>
                </td>

                {/* 3. Pos Dana & Jenis - Identik dengan Kas Keluar */}
                <td className="px-5 py-4 border-r border-slate-100">
                  <div className="flex flex-col gap-1 items-start">
                    {getPosDanaDot(item.fundCategory?.name || '')}
                    {item.incomeType?.name && (
                      <span className="text-[10px] font-semibold text-slate-500 ml-3.5">
                        {item.incomeType.name}
                      </span>
                    )}
                  </div>
                </td>

                {/* 4. Nominal - WAJIB Rata Kanan, Warna Hijau Emerald, Font Angka Lebih Besar */}
                <td className="px-5 py-4 text-right border-r border-slate-100">
                  <span className="text-sm font-bold text-emerald-600 tracking-tight">
                    {formatIDR(Number(item.amount))}
                  </span>
                </td>

                {/* 5. Status - Rata Tengah */}
                <td className="px-5 py-4 text-center border-r border-slate-100">
                  <Badge variant="success" className="px-2.5 py-1 text-[10px]">
                    Selesai
                  </Badge>
                </td>

                {/* 6. Aksi - Ghost Button */}
                <td className="px-3 py-4 text-center">
                  <button
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors rounded-none outline-none cursor-pointer"
                    title="Opsi Lanjutan"
                  >
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            )}

            renderMobileCard={(item) => (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <span className="text-xs font-semibold text-slate-800 leading-tight block">
                      {item.description}
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-400 tracking-tighter mt-0.5 block">
                      {item.transactionNo}
                    </span>
                  </div>
                  <Badge variant="success" className="text-[9px]">Selesai</Badge>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-medium">
                      {new Date(item.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex gap-1.5 mt-1">
                      {getPosDanaDot(item.fundCategory?.name || '')}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{formatIDR(Number(item.amount))}</span>
                </div>
              </div>
            )}
          />
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Input Penerimaan Kas Baru"
      >
        <div className="mb-4 p-4 bg-blue-50 rounded-none flex gap-3 items-center">
          <div className="p-2 bg-white rounded-none text-blue-600 shadow-sm">
            <Info size={16} />
          </div>
          <p className="text-[11px] text-blue-700 leading-normal font-semibold">
            Pastikan nominal yang diinput sesuai dengan bukti fisik atau mutasi bank untuk menjaga akurasi laporan keuangan.
          </p>
        </div>

        <KasMasukForm onSubmit={onFormSubmit} onCancel={handleCloseModal} />
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
              Silakan pilih format file laporan kas masuk yang ingin Anda unduh. Laporan yang diunduh akan otomatis terfilter sesuai dengan kata kunci, rentang waktu, dan pos dana yang aktif.
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

export default KasMasukPage;