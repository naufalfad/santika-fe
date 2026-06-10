import { useState, useMemo } from 'react';
import {
  Plus, Search, Download,
  AlertCircle, Info, FileImage, PieChart as PieIcon, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import { KasKeluarForm } from '../components/KasKeluarForm';
import { KAS_KELUAR_STATS } from '../../../shared/mock/kasKeluarData'; // 🛠️ FIXED IMPORT: Removed unused static charts data
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import { useKasKeluarQuery } from '../../kas-masuk/hooks/useKasMasukQuery';

/**
 * Standardized high-contrast, high-density Kas Keluar Management page.
 * Implements optimized useMemo selectors to prevent rendering lags.
 * Integrates React Query for async Server State and AdaptiveList for responsive layouts.
 * Fully interactive with dynamic chart updates, sharp-edge visual styling, and receipt preview modal.
 */
const KasKeluarPage = () => {
  const { data: kasKeluar = [], isLoading } = useKasKeluarQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuktiUrl, setSelectedBuktiUrl] = useState<string | null>(null);

  // Memoize search query execution
  const filteredData = useMemo(() => {
    return kasKeluar.filter(item =>
      item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [kasKeluar, searchTerm]);

  // Memoize expenditures total calculations
  const totalKeluarBulanIni = useMemo(() => {
    return kasKeluar.reduce((sum, item) => sum + item.jumlah, 0);
  }, [kasKeluar]);

  // Dynamic Trend Area Chart Data (Replaces the unused static TREND_KELUAR_DATA)
  const trendData = useMemo(() => {
    const sorted = [...kasKeluar].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    const groups: { [date: string]: number } = {};
    sorted.forEach(item => {
      const dateObj = new Date(item.tanggal);
      const dateStr = isNaN(dateObj.getTime())
        ? item.tanggal
        : dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      groups[dateStr] = (groups[dateStr] || 0) + item.jumlah;
    });
    return Object.entries(groups).map(([date, jumlah]) => ({ date, jumlah }));
  }, [kasKeluar]);

  // Dynamic Category Pie Chart Data (Replaces the unused static CATEGORY_KELUAR_DATA)
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {
      'Operasional': 0,
      'Liturgi': 0,
      'Kegiatan': 0,
    };
    let grandTotal = 0;
    kasKeluar.forEach(item => {
      const cat = item.kategori || 'Operasional';
      totals[cat] = (totals[cat] || 0) + item.jumlah;
      grandTotal += item.jumlah;
    });

    const colors: Record<string, string> = {
      'Operasional': '#e11d48', // rose
      'Liturgi': '#6366f1', // purple
      'Kegiatan': '#f59e0b', // amber
    };

    return Object.entries(totals)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value: grandTotal > 0 ? Math.round((value / grandTotal) * 100) : 0,
        color: colors[name] || '#64748b',
      }));
  }, [kasKeluar]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Kas Keluar</h2>
          <p className="text-sm text-gray-500">Pantau pengeluaran operasional dan kegiatan paroki.</p>
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

      {/* Quick Stats Cards - Consistent padding density & Flat layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-rose-500 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Keluar (Bulan Ini)</p>
          <h4 className="text-lg font-black mt-1 text-rose-600 tracking-tight">{formatIDR(totalKeluarBulanIni)}</h4>
          <p className="text-[9px] text-emerald-600 mt-2 font-bold">↓ {KAS_KELUAR_STATS.hematDariBulanLalu}% lebih hemat</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Burn Rate Anggaran</p>
          <div className="flex items-end gap-1.5 mt-1">
            <h4 className="text-lg font-black text-slate-800 tracking-tight">{KAS_KELUAR_STATS.anggaranTerpakai}%</h4>
            <p className="text-[9px] text-slate-400 font-bold mb-0.5">terpakai</p>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-none mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-none" style={{ width: `${KAS_KELUAR_STATS.anggaranTerpakai}%` }}></div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Menunggu Verifikasi</p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">{KAS_KELUAR_STATS.pendingVerifikasi}</h4>
          <p className="text-[9px] text-slate-400 mt-2 font-bold italic flex items-center gap-1">
            <AlertCircle size={10} /> Segera verifikasi bukti nota
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-slate-800 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Saldo Kas Saat Ini</p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">{formatIDR(150500000)}</h4>
          <p className="text-[9px] text-blue-600 mt-2 font-bold">Cukup untuk 12 bulan kedepan</p>
        </Card>
      </div>

      {/* Analytics & Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart */}
        <Card className="lg:col-span-8 p-5 border-slate-200 rounded-none shadow-sm">
          <div className="mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight size={14} className="text-rose-500" /> Fluktuasi Pengeluaran Kas
            </h3>
          </div>
          <div className="h-[230px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.06} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                    tickFormatter={(val) => formatIDR(val, { notation: 'compact' })}
                  />
                  <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '0px', fontSize: '11px', fontWeight: 600 }} />
                  <Area type="monotone" dataKey="jumlah" stroke="#e11d48" fillOpacity={1} fill="url(#colorKeluar)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">Belum ada data trend pengeluaran</div>
            )}
          </div>
        </Card>

        {/* Donut & Prosedur */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 border-slate-200 rounded-none shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PieIcon size={14} className="text-purple-500" /> Alokasi Dana (%)
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
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">Belum ada alokasi kategori</div>
              )}
            </div>
          </Card>

          {/* Side Info Card - Flat, seamless, no glassmorphism */}
          <Card className="p-4 bg-amber-50 border-amber-200 text-amber-950 rounded-none shadow-none">
            <h4 className="font-black text-amber-800 flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wide">
              <Info size={14} /> Prosedur Pengeluaran
            </h4>
            <ul className="text-[11px] text-amber-800 font-semibold space-y-2 list-disc pl-4 leading-relaxed">
              <li>Setiap pengeluaran di atas <strong className="font-black text-amber-950">Rp 500.000</strong> wajib mendapatkan approval Pastor.</li>
              <li>Nota fisik harus difoto jelas dan di-upload ke sistem.</li>
              <li>Pastikan kategori sesuai dengan Rencana Anggaran Tahunan.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Main Table - Flat with zero boxed layers inside */}
      <div className="space-y-4">
        <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-none w-full md:w-80">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi keluar..."
              className="bg-transparent outline-none text-xs w-full text-slate-800 font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-1.5 text-xs border-slate-200 rounded-none bg-white">Filter Kategori</Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-none shadow-sm flex items-center justify-center gap-2.5 font-semibold text-xs">
            <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-none animate-spin"></div>
            Loading data transaksi kas keluar...
          </div>
        ) : (
          <AdaptiveList
            data={filteredData}
            desktopHeaders={[
              'ID Transaksi',
              'Tanggal',
              'Penerima Dana',
              'Kategori',
              'Nominal',
              'Status',
              'Bukti'
            ]}
            renderDesktopRow={(item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 text-xs font-black text-rose-600 border-r border-slate-100">{item.id}</td>
                <td className="px-5 py-3 text-xs text-slate-500 font-medium border-r border-slate-100">{item.tanggal}</td>
                <td className="px-5 py-3 text-xs font-bold text-slate-700 border-r border-slate-100">{item.penerima}</td>
                <td className="px-5 py-3 border-r border-slate-100">
                  <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 rounded-none text-slate-600 border border-slate-200/60 uppercase tracking-tight">
                    {item.kategori}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs font-black text-right text-rose-600 border-r border-slate-100">{formatIDR(item.jumlah)}</td>
                <td className="px-5 py-3 border-r border-slate-100">
                  <Badge variant={item.status === 'Selesai' ? 'success' : 'warning'} className="rounded-none">{item.status}</Badge>
                </td>
                <td className="px-5 py-3 text-center">
                  <button
                    onClick={() => setSelectedBuktiUrl(item.buktiUrl || 'https://via.placeholder.com/600x800?text=Nota+Pembayaran+Fisik')}
                    className="p-1 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-none shadow-none text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                  >
                    <FileImage size={14} />
                  </button>
                </td>
              </tr>
            )}
            renderMobileCard={(item) => (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-rose-600">{item.id}</span>
                  <Badge variant={item.status === 'Selesai' ? 'success' : 'warning'} className="rounded-none">{item.status}</Badge>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700">{item.penerima}</span>
                  <span className="text-sm font-black text-rose-600">{formatIDR(item.jumlah)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>{item.tanggal}</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-none text-slate-600 font-bold uppercase tracking-tight border border-slate-200/60">
                    {item.kategori}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBuktiUrl(item.buktiUrl || 'https://via.placeholder.com/600x800?text=Nota+Pembayaran+Fisik')}
                  className="mt-2 text-[10px] text-rose-600 hover:text-rose-700 font-black text-left uppercase tracking-wider cursor-pointer"
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
            <div className="border border-slate-200 rounded-none overflow-hidden h-96 bg-slate-50 flex items-center justify-center">
              <img src={selectedBuktiUrl} alt="Bukti Pengeluaran" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
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
    </div>
  );
};

export default KasKeluarPage;