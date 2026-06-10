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
import { KAS_KELUAR_STATS, CATEGORY_KELUAR_DATA, TREND_KELUAR_DATA } from '../../../shared/mock/kasKeluarData';
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import { useKasKeluarQuery } from '../../kas-masuk/hooks/useKasMasukQuery';

/**
 * Standardized high-contrast, high-density Kas Keluar Management page.
 * Implements optimized useMemo selectors to prevent rendering lags.
 * Integrates React Query for async Server State and AdaptiveList for responsive layouts.
 */
const KasKeluarPage = () => {
  const { data: kasKeluar = [], isLoading } = useKasKeluarQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Kas Keluar</h2>
          <p className="text-sm text-gray-500">Pantau pengeluaran operasional dan kegiatan paroki.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs border-slate-200">
            <Download size={16} /> Export Laporan
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 shadow-sm text-xs bg-rose-600 hover:bg-rose-700 text-white">
            <Plus size={16} /> Catat Pengeluaran
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards - Consistent padding density & Flat layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-rose-500 border-y-slate-200 border-r-slate-200">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Keluar (Bulan Ini)</p>
          <h4 className="text-lg font-black mt-1 text-rose-600 tracking-tight">{formatIDR(totalKeluarBulanIni)}</h4>
          <p className="text-[9px] text-emerald-600 mt-2 font-bold">↓ {KAS_KELUAR_STATS.hematDariBulanLalu}% lebih hemat</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 border-y-slate-200 border-r-slate-200">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Burn Rate Anggaran</p>
          <div className="flex items-end gap-1.5 mt-1">
            <h4 className="text-lg font-black text-slate-800 tracking-tight">{KAS_KELUAR_STATS.anggaranTerpakai}%</h4>
            <p className="text-[9px] text-slate-400 font-bold mb-0.5">terpakai</p>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: `${KAS_KELUAR_STATS.anggaranTerpakai}%` }}></div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 border-y-slate-200 border-r-slate-200">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Menunggu Verifikasi</p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">{KAS_KELUAR_STATS.pendingVerifikasi}</h4>
          <p className="text-[9px] text-slate-400 mt-2 font-bold italic flex items-center gap-1">
            <AlertCircle size={10} /> Segera verifikasi bukti nota
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-slate-800 border-y-slate-200 border-r-slate-200">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Saldo Kas Saat Ini</p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">{formatIDR(150500000)}</h4>
          <p className="text-[9px] text-blue-600 mt-2 font-bold">Cukup untuk 12 bulan kedepan</p>
        </Card>
      </div>

      {/* Analytics & Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart */}
        <Card className="lg:col-span-8 p-5 border-slate-200">
          <div className="mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight size={14} className="text-rose-500" /> Fluktuasi Pengeluaran (Harian)
            </h3>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_KELUAR_DATA}>
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
                <Tooltip contentStyle={{ border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }} />
                <Area type="monotone" dataKey="jumlah" stroke="#e11d48" fillOpacity={1} fill="url(#colorKeluar)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut & Prosedur */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 border-slate-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PieIcon size={14} className="text-purple-500" /> Alokasi Dana
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_KELUAR_DATA}
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {CATEGORY_KELUAR_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Side Info Card - Flat, seamless, no glassmorphism */}
          <Card className="p-4 bg-amber-50 border-amber-200 text-amber-950">
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
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-full md:w-80">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi keluar..."
              className="bg-transparent outline-none text-xs w-full text-slate-800 font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-1.5 text-xs border-slate-200">Filter Kategori</Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center gap-2.5 font-semibold text-xs">
            <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
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
                  <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200 uppercase tracking-tight">
                    {item.kategori}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs font-black text-right text-rose-600 border-r border-slate-100">{formatIDR(item.jumlah)}</td>
                <td className="px-5 py-3 border-r border-slate-100">
                  <Badge variant={item.status === 'Selesai' ? 'success' : 'warning'}>{item.status}</Badge>
                </td>
                <td className="px-5 py-3 text-center">
                  <button className="p-1 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded text-gray-400 hover:text-rose-600 transition-all">
                    <FileImage size={14} />
                  </button>
                </td>
              </tr>
            )}
            renderMobileCard={(item) => (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-rose-600">{item.id}</span>
                  <Badge variant={item.status === 'Selesai' ? 'success' : 'warning'}>{item.status}</Badge>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700">{item.penerima}</span>
                  <span className="text-sm font-black text-rose-600">{formatIDR(item.jumlah)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>{item.tanggal}</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold uppercase tracking-tight">
                    {item.kategori}
                  </span>
                </div>
              </div>
            )}
          />
        )}
      </div>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Input Pengeluaran Baru">
        <KasKeluarForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default KasKeluarPage;