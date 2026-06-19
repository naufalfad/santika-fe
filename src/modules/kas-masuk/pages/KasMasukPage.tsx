import { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, Download, MoreVertical,
  TrendingUp, Calendar, Target, Info
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { Badge } from '../../../shared/components/ui/Badge';
import { KasMasukForm } from '../components/KasMasukForm';
import type { KasMasukInput } from '../types/kas-masuk';
import { useActivityStore } from '../../../app/store/useActivityStore';
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import { useKasMasukQuery, useAddKasMasukMutation, useFundBalancesQuery } from '../hooks/useKasMasukQuery';

/**
 * Standardized high-contrast, high-density Kas Masuk Management page.
 * Implements optimized useMemo selectors to prevent rendering lags.
 * Integrates React Query for async Server State and AdaptiveList for responsive layouts.
 */
const KasMasukPage = () => {
  const { data: kasMasuk = [], isLoading } = useKasMasukQuery();
  const { data: fundBalances = [] } = useFundBalancesQuery();
  const addMutation = useAddKasMasukMutation();
  const addLog = useActivityStore((state) => state.addLog);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'PERMANENT' | 'SPECIAL_FUND'>('PERMANENT');

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

  // Memoize search query execution
  const filteredData = useMemo(() => {
    return currentTransactions.filter(item =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.transactionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.fundCategory?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.incomeType?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentTransactions, searchTerm]);

  // Memoize analytical calculations
  const totalBulanIni = useMemo(() => {
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

  // Target Penerimaan (bulanan): Rp 50.000.000
  const targetBulanan = 50000000;
  const progressTarget = useMemo(() => {
    return Math.min(Math.round((totalBulanIni / targetBulanan) * 100), 100);
  }, [totalBulanIni]);

  // Rata-rata special fund income
  const avgSpecialIncome = useMemo(() => {
    const specialTxsThisMonth = kasMasukSpecial.filter(item => {
      const d = new Date(item.transactionDate);
      return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    });
    if (specialTxsThisMonth.length === 0) return 0;
    const sum = specialTxsThisMonth.reduce((acc, curr) => acc + Number(curr.amount), 0);
    return Math.round(sum / specialTxsThisMonth.length);
  }, [kasMasukSpecial]);

  // Sumber Terbesar
  const sumberTerbesar = useMemo(() => {
    if (currentTransactions.length === 0) {
      return { description: 'Belum ada data', amount: 0, percentage: 0 };
    }
    const maxTx = currentTransactions.reduce((prev, current) => {
      return (Number(prev.amount) > Number(current.amount)) ? prev : current;
    });
    const total = currentTransactions.reduce((sum, item) => sum + Number(item.amount), 0);
    const percentage = total > 0 ? Math.round((Number(maxTx.amount) / total) * 100) : 0;
    return {
      description: maxTx.description,
      amount: Number(maxTx.amount),
      percentage,
    };
  }, [currentTransactions]);

  // Transaksi hari ini
  const totalHariIni = useMemo(() => {
    const todayStr = new Date().toDateString();
    return currentTransactions.reduce((sum, item) => {
      const txStr = new Date(item.transactionDate).toDateString();
      if (txStr === todayStr) {
        return sum + Number(item.amount);
      }
      return sum;
    }, 0);
  }, [currentTransactions]);

  const countHariIni = useMemo(() => {
    const todayStr = new Date().toDateString();
    return currentTransactions.filter(item => {
      return new Date(item.transactionDate).toDateString() === todayStr;
    }).length;
  }, [currentTransactions]);

  // Tren 30 hari
  const trendData = useMemo(() => {
    const dataMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      dataMap.set(key, 0);
    }
    currentTransactions.forEach((item) => {
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
  }, [currentTransactions]);

  // Komposisi Dana (PieChart)
  const categoryData = useMemo(() => {
    const colors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6', '#f43f5e'];
    const filteredBalances = fundBalances.filter(item => {
      const isSpecial = item.fund.startsWith('Dana Khusus:');
      return activeTab === 'PERMANENT' ? !isSpecial : isSpecial;
    });
    const activeBalances = filteredBalances.filter(item => item.income > 0);
    if (activeBalances.length === 0) {
      return [{ name: 'Belum ada penerimaan', value: 1, color: '#e2e8f0' }];
    }
    return activeBalances.map((item, index) => ({
      name: activeTab === 'PERMANENT' ? item.fund : item.fund.replace('Dana Khusus: ', ''),
      value: Number(item.income),
      color: colors[index % colors.length]
    }));
  }, [fundBalances, activeTab]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-medium text-slate-800 tracking-tight">Manajemen Kas Masuk</h2>
          <p className="text-sm text-gray-500">Pantau dan catat seluruh penerimaan paroki.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs border-slate-200">
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

      {/* Stats Cards Section - Compact Space Padding & Flat border styling */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-600 border-y-slate-200 border-r-slate-200">
          <p className="text-[10px] text-slate-400 font-semibold">
            {activeTab === 'PERMANENT' ? 'Total Bulan Ini' : 'Pemasukan Dana Khusus (Bulan Ini)'}
          </p>
          <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{formatIDR(totalBulanIni)}</h4>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 font-medium text-[10px]">
            <TrendingUp size={12} />
            <span>
              {activeTab === 'PERMANENT' ? `Target: ${formatIDR(targetBulanan, { notation: 'compact' })}` : 'Program Dana Khusus'}
            </span>
          </div>
        </Card>

        {activeTab === 'PERMANENT' ? (
          <Card className="p-4 border-l-4 border-l-emerald-600 border-y-slate-200 border-r-slate-200">
            <p className="text-[10px] text-slate-400 font-semibold">Pencapaian Target</p>
            <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{progressTarget}%</h4>
            <div className="w-full bg-slate-100 h-1 rounded-none mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${progressTarget}%` }}></div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 border-l-4 border-l-emerald-600 border-y-slate-200 border-r-slate-200">
            <p className="text-[10px] text-slate-400 font-semibold">Rata-rata Sumbangan</p>
            <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{formatIDR(avgSpecialIncome)}</h4>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 font-medium text-[10px]">
              <TrendingUp size={12} />
              <span>Rata-rata Bulan Ini</span>
            </div>
          </Card>
        )}

        <Card className="p-4 border-l-4 border-l-amber-500 border-y-slate-200 border-r-slate-200">
          <p className="text-[10px] text-slate-400 font-semibold">
            {activeTab === 'PERMANENT' ? 'Sumber Terbesar' : 'Sumbangan Terbesar'}
          </p>
          <h4 className="text-sm font-semibold mt-2 text-slate-800 truncate tracking-tight text-slate-800" title={sumberTerbesar.description}>
            {sumberTerbesar.description}
          </h4>
          <p className="text-[9px] text-slate-400 mt-2 font-medium">
            {sumberTerbesar.amount > 0 ? `Kontribusi ${sumberTerbesar.percentage}% (${formatIDR(sumberTerbesar.amount, { notation: 'compact' })})` : 'Belum ada transaksi'}
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600 border-y-slate-200 border-r-slate-200">
          <p className="text-[10px] text-slate-400 font-semibold">Hari Ini</p>
          <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">{formatIDR(totalHariIni)}</h4>
          <p className="text-[9px] text-slate-400 mt-2 font-medium">{countHariIni} Transaksi masuk</p>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart - Aspect containment instead of hardcoded pixels */}
        <Card className="lg:col-span-8 p-5 border-slate-200">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-500" /> Tren {activeTab === 'PERMANENT' ? 'Penerimaan' : 'Pemasukan Dana Khusus'} 30 Hari Terakhir
            </h3>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                  tickFormatter={(val) => formatIDR(val, { notation: 'compact' })}
                />
                <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }} />
                <Line type="monotone" dataKey="jumlah" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3, fill: '#0284c7' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart & Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 border-slate-200">
            <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Target size={14} className="text-emerald-500" /> {activeTab === 'PERMANENT' ? 'Komposisi Dana' : 'Penyebaran Program'}
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Sidebar Info Card - Flat, seamless, without glassmorphism */}
          <Card className="p-4 bg-blue-50 /60 text-blue-900">
            <h4 className="font-semibold text-blue-800 flex items-center gap-1.5 mb-1.5 text-xs">
              <Info size={14} /> Informasi Kas
            </h4>
            <p className="text-[11px] text-blue-700/90 leading-relaxed font-semibold">
              Jangan lupa melakukan verifikasi fisik (hitung uang cash) sebelum menekan status "Selesai" pada input Kolekte.
            </p>
            <button className="mt-3 text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-none font-semibold transition-colors">
              Baca Panduan Input
            </button>
          </Card>
        </div>
      </div>

      {/* Main Table Section - Flat & Seamless border structures */}
      <div className="space-y-4">
        <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-none w-full md:w-80">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              className="bg-transparent outline-none text-xs w-full text-slate-800 font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-1.5 text-xs border-slate-200">
            <Filter size={14} /> Filter Lanjutan
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-none shadow-sm flex items-center justify-center gap-2.5 font-semibold text-xs">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
            Loading data transaksi kas masuk...
          </div>
        ) : (
          <AdaptiveList
            data={filteredData}
            desktopHeaders={[
              'No. Transaksi',
              'Tanggal',
              'Pos Dana / Jenis',
              'Keterangan / Sumber',
              'Jumlah (IDR)',
              'Status',
              'Aksi'
            ]}
            renderDesktopRow={(item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 text-xs font-semibold text-blue-600 border-r">{item.transactionNo}</td>
                <td className="px-5 py-3 text-xs text-slate-500 font-medium border-r">
                  {new Date(item.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </td>
                <td className="px-5 py-3 border-r">
                  <div className="flex flex-col gap-0.5 items-start">
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 text-blue-600 rounded-none tracking-tight">
                      {item.fundCategory?.name}
                    </span>
                    {item.incomeType?.name && (
                      <span className="text-[10px] font-semibold text-slate-600 tracking-tight mt-0.5">
                        {item.incomeType.name}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 text-xs font-medium text-slate-700 border-r">{item.description}</td>
                <td className="px-5 py-3 text-xs font-semibold text-right text-emerald-600 border-r">{formatIDR(Number(item.amount))}</td>
                <td className="px-5 py-3 border-r">
                  <Badge variant="success">
                    Selesai
                  </Badge>
                </td>
                <td className="px-5 py-3 text-center">
                  <button className="p-1 hover:bg-slate-50 border border-transparent hover: rounded-none shadow-sm text-gray-400 hover:text-blue-600 transition-all">
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            )}
            renderMobileCard={(item) => (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-blue-600">{item.transactionNo}</span>
                  <Badge variant="success">
                    Selesai
                  </Badge>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-medium text-slate-700">{item.description}</span>
                  <span className="text-sm font-semibold text-emerald-600">{formatIDR(Number(item.amount))}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>{new Date(item.transactionDate).toLocaleDateString('id-ID')}</span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 text-blue-600 rounded-none font-medium tracking-tight">
                      {item.fundCategory?.name}
                    </span>
                    {item.incomeType?.name && (
                      <span className="px-2 py-0.5 bg-slate-100 rounded-none text-slate-600 font-medium tracking-tight">
                        {item.incomeType.name}
                      </span>
                    )}
                  </div>
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
    </div>
  );
};

export default KasMasukPage;