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
import { KAS_MASUK_STATS } from '../../../shared/mock/kasMasukData';
import type { KasMasuk } from '../../../shared/mock/kasMasukData'; // 🛠️ FIXED IMPORT PATH
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import { useKasMasukQuery, useAddKasMasukMutation } from '../hooks/useKasMasukQuery';

/**
 * Standardized high-contrast, high-density Kas Masuk Management page.
 * Implements optimized useMemo selectors to prevent rendering lags.
 * Integrates React Query for async Server State and AdaptiveList for responsive layouts.
 * Fully interactive with dynamic chart updates and sharp-edge visual styling.
 */
const KasMasukPage = () => {
  const { data: kasMasuk = [], isLoading } = useKasMasukQuery();
  const addMutation = useAddKasMasukMutation();
  const addLog = useActivityStore((state) => state.addLog);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<KasMasuk | null>(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const onFormSubmit = (data: KasMasukInput) => {
    addMutation.mutate({
      tanggal: data.tanggal,
      kategori: data.kategori as 'Kolekte' | 'Donasi' | 'Persembahan' | 'Pembangunan' | 'Lainnya',
      sumber: data.sumber,
      jumlah: data.jumlah,
      keterangan: data.keterangan || '',
    }, {
      onSuccess: () => {
        addLog(
          `Penerimaan Kas - ${data.sumber} (${data.kategori})`,
          data.jumlah,
          'in'
        );
        handleCloseModal();
      }
    });
  };

  // Memoize search query execution
  const filteredData = useMemo(() => {
    return kasMasuk.filter(item =>
      item.sumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [kasMasuk, searchTerm]);

  // Memoize analytical calculations
  const totalBulanIni = useMemo(() => {
    return kasMasuk.reduce((sum, item) => sum + item.jumlah, 0);
  }, [kasMasuk]);

  // Dynamic Trend Chart Data
  const trendData = useMemo(() => {
    const sorted = [...kasMasuk].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    const groups: { [date: string]: number } = {};
    sorted.forEach(item => {
      const dateObj = new Date(item.tanggal);
      const dateStr = isNaN(dateObj.getTime())
        ? item.tanggal
        : dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      groups[dateStr] = (groups[dateStr] || 0) + item.jumlah;
    });
    return Object.entries(groups).map(([date, jumlah]) => ({ date, jumlah }));
  }, [kasMasuk]);

  // Dynamic Category Pie Data
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {
      'Kolekte': 0,
      'Donasi': 0,
      'Persembahan': 0,
      'Pembangunan': 0,
      'Lainnya': 0,
    };
    let grandTotal = 0;
    kasMasuk.forEach(item => {
      const cat = item.kategori || 'Lainnya';
      totals[cat] = (totals[cat] || 0) + item.jumlah;
      grandTotal += item.jumlah;
    });

    const colors: Record<string, string> = {
      'Kolekte': '#0284c7', // blue
      'Donasi': '#10b981', // emerald
      'Pembangunan': '#f59e0b', // amber
      'Persembahan': '#6366f1', // purple
      'Lainnya': '#64748b', // slate
    };

    return Object.entries(totals)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value: grandTotal > 0 ? Math.round((value / grandTotal) * 100) : 0,
        color: colors[name] || '#64748b',
      }));
  }, [kasMasuk]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Kas Masuk</h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Pantau dan catat seluruh penerimaan paroki.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs border-slate-200 bg-white shadow-sm rounded-none">
            <Download size={16} /> Export Laporan
          </Button>
          <Button onClick={handleOpenModal} className="flex-1 sm:flex-none flex items-center justify-center gap-2 shadow-none text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-none">
            <Plus size={16} /> Transaksi Baru
          </Button>
        </div>
      </div>

      {/* Stats Cards Section - Compact Space Padding & Flat border styling */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-600 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Bulan Ini</p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">{formatIDR(totalBulanIni)}</h4>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 font-bold text-[10px]">
            <TrendingUp size={12} />
            <span>+{KAS_MASUK_STATS.growth}%</span>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-600 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Target Penerimaan</p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">{formatIDR(KAS_MASUK_STATS.targetBulan)}</h4>
          <div className="w-full bg-slate-100 h-1 rounded-none mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-none" style={{ width: '90%' }}></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Sumber Terbesar</p>
          <h4 className="text-sm font-black mt-2 text-slate-800 truncate tracking-tight">{KAS_MASUK_STATS.sumberTerbesar}</h4>
          <p className="text-[9px] text-slate-400 mt-2 font-bold italic">Kontribusi 55% dari total</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-600 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Hari Ini</p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">{formatIDR(1250000)}</h4>
          <p className="text-[9px] text-slate-400 mt-2 font-bold italic">3 Transaksi masuk</p>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart - Aspect containment instead of hardcoded pixels */}
        <Card className="lg:col-span-8 p-5 border-slate-200 rounded-none shadow-sm">
          <div className="mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-500" /> Tren Penerimaan Kas
            </h3>
          </div>
          <div className="h-[230px]">
            {trendData.length > 0 ? (
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
                  <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '0px', fontSize: '11px', fontWeight: 600 }} />
                  <Line type="monotone" dataKey="jumlah" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3, fill: '#0284c7' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">Belum ada data trend</div>
            )}
          </div>
        </Card>

        {/* Donut Chart & Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 border-slate-200 rounded-none shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target size={14} className="text-emerald-500" /> Komposisi Dana (%)
            </h3>
            <div className="h-[180px]">
              {categoryData.length > 0 ? (
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
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">Belum ada komposisi kategori</div>
              )}
            </div>
          </Card>

          {/* Sidebar Info Card - Flat, seamless, without glassmorphism */}
          <Card className="p-4 bg-blue-50 border-blue-100/60 text-blue-900 rounded-none shadow-none">
            <h4 className="font-black text-blue-800 flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wide">
              <Info size={14} /> Informasi Kas
            </h4>
            <p className="text-[11px] text-blue-700/90 leading-relaxed font-semibold">
              Jangan lupa melakukan verifikasi fisik (hitung uang cash) sebelum menekan status "Selesai" pada input Kolekte.
            </p>
            <button className="mt-3 text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-none font-black transition-colors uppercase tracking-wide cursor-pointer">
              Baca Panduan Input
            </button>
          </Card>
        </div>
      </div>

      {/* Main Table Section - Flat & Seamless border structures */}
      <div className="space-y-4">
        <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-none w-full md:w-80">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              className="bg-transparent outline-none text-xs w-full text-slate-800 font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-1.5 text-xs border-slate-200 rounded-none">
            <Filter size={14} /> Filter Lanjutan
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-none shadow-sm flex items-center justify-center gap-2.5 font-semibold text-xs">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
            Loading data transaksi kas masuk...
          </div>
        ) : (
          <AdaptiveList
            data={filteredData}
            desktopHeaders={[
              'ID Transaksi',
              'Tanggal',
              'Kategori',
              'Keterangan Sumber',
              'Jumlah (IDR)',
              'Status',
              'Aksi'
            ]}
            renderDesktopRow={(item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 text-xs font-black text-blue-600 border-r border-slate-100">{item.id}</td>
                <td className="px-5 py-3 text-xs text-slate-500 font-medium border-r border-slate-100">{item.tanggal}</td>
                <td className="px-5 py-3 border-r border-slate-100">
                  <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 rounded-none text-slate-600 border border-slate-200/60 uppercase tracking-tight">
                    {item.kategori}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs font-bold text-slate-700 border-r border-slate-100">{item.sumber}</td>
                <td className="px-5 py-3 text-xs font-black text-right text-emerald-600 border-r border-slate-100">{formatIDR(item.jumlah)}</td>
                <td className="px-5 py-3 border-r border-slate-100">
                  <Badge variant={item.status === 'Selesai' ? 'success' : 'warning'} className="rounded-none">
                    {item.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-center">
                  <button
                    onClick={() => setSelectedTransaction(item)}
                    className="p-1 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-none shadow-none text-slate-400 hover:text-blue-600 transition-all cursor-pointer"
                  >
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            )}
            renderMobileCard={(item) => (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-blue-600">{item.id}</span>
                  <Badge variant={item.status === 'Selesai' ? 'success' : 'warning'} className="rounded-none">
                    {item.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700">{item.sumber}</span>
                  <span className="text-sm font-black text-emerald-600">{formatIDR(item.jumlah)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>{item.tanggal}</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-none text-slate-600 font-bold uppercase tracking-tight border border-slate-200/60">
                    {item.kategori}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTransaction(item)}
                  className="mt-2 text-[10px] text-blue-600 hover:text-blue-700 font-black text-left uppercase tracking-wider cursor-pointer"
                >
                  Detail Transaksi
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title="Detail Transaksi Kas Masuk"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">ID Transaksi</span>
              <p className="text-sm font-bold text-blue-600">{selectedTransaction.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tanggal</span>
                <p className="text-xs font-bold text-slate-700">{selectedTransaction.tanggal}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Kategori</span>
                <div>
                  <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 rounded-none text-slate-600 border border-slate-200/60 uppercase tracking-tight">
                    {selectedTransaction.kategori}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Keterangan Sumber</span>
              <p className="text-xs font-bold text-slate-700">{selectedTransaction.sumber}</p>
            </div>
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jumlah</span>
              <p className="text-sm font-black text-emerald-600">{formatIDR(selectedTransaction.jumlah)}</p>
            </div>
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Keterangan Tambahan</span>
              <p className="text-xs font-medium text-slate-600">{selectedTransaction.keterangan || '-'}</p>
            </div>
            <div className="pb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</span>
              <div className="mt-1">
                <Badge variant={selectedTransaction.status === 'Selesai' ? 'success' : 'warning'} className="rounded-none">
                  {selectedTransaction.status}
                </Badge>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={() => setSelectedTransaction(null)} variant="outline" size="sm" className="rounded-none">
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Input Penerimaan Kas Baru"
      >
        <div className="mb-4 p-4 bg-blue-50 rounded-none flex gap-3 items-center">
          <div className="p-2 bg-white rounded-none text-blue-600 shadow-none border border-slate-100">
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