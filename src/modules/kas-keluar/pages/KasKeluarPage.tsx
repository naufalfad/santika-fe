import { useState, useMemo } from 'react';
import {
  Plus, Search, Download,
  Info, FileImage, PieChart as PieIcon, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend
} from 'recharts';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import { KasKeluarForm } from '../components/KasKeluarForm';
import { SPJUploadModal } from '../../spj/components/SPJUploadModal';
import { CATEGORY_KELUAR_DATA, TREND_KELUAR_DATA } from '../../../shared/mock/kasKeluarData';
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

  // 1. Calculate base API asset paths dynamically
  const apiAssetUrl = useMemo(() => {
    return (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');
  }, []);

  // 2. Memoize overall cash balance (Sum of all active Pos Dana balances)
  const totalSaldoKas = useMemo(() => {
    return fundBalances.reduce((sum, item) => sum + Number(item.balance || 0), 0);
  }, [fundBalances]);

  // 3. Memoize total expense for the current month
  const totalKeluarBulanIni = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return kasKeluar.reduce((sum, item) => {
      const d = new Date(item.transactionDate);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return sum + Number(item.amount);
      }
      return sum;
    }, 0);
  }, [kasKeluar]);

  // 4. Memoize number of transactions logged this month
  const transBulanIniCount = useMemo(() => {
    const now = new Date();
    return kasKeluar.filter(item => {
      const d = new Date(item.transactionDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [kasKeluar]);

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

  // 6. Memoize search query filter logic
  const filteredData = useMemo(() => {
    return kasKeluar.filter(item =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.transactionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.fundCategory?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.expenseType?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [kasKeluar, searchTerm]);

  // 7. Memoize daily trend chart dataset
  const trendDataset = useMemo(() => {
    const dailySums: Record<string, number> = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Sort transactions chronologically
    const sorted = [...kasKeluar]
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

    return chartData.length > 0 ? chartData : TREND_KELUAR_DATA;
  }, [kasKeluar]);

  // 8. Memoize category distribution donut dataset
  const categoryDataset = useMemo(() => {
    const sums: Record<string, number> = {};
    let total = 0;

    kasKeluar.forEach(item => {
      const name = item.expenseType?.name || 'Lain-lain';
      sums[name] = (sums[name] || 0) + Number(item.amount);
      total += Number(item.amount);
    });

    if (total === 0) {
      return CATEGORY_KELUAR_DATA;
    }

    const colors = ['#e11d48', '#f59e0b', '#7c3aed', '#0284c7', '#10b981', '#94a3b8'];
    return Object.entries(sums).map(([name, sum], index) => ({
      name,
      value: Math.round((sum / total) * 100),
      color: colors[index % colors.length]
    }));
  }, [kasKeluar]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Kas Keluar</h2>
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

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-rose-500 border-y-slate-200 border-r-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Keluar (Bulan Ini)</p>
          <h4 className="text-lg font-black mt-1 text-rose-600 tracking-tight">{formatIDR(totalKeluarBulanIni)}</h4>
          <p className="text-[9px] text-emerald-600 mt-2 font-bold">✓ Terkalkulasi dari pengeluaran riil</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 border-y-slate-200 border-r-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Burn Rate Anggaran</p>
          <div className="flex items-end gap-1.5 mt-1">
            <h4 className="text-lg font-black text-slate-800 tracking-tight">{burnRate}%</h4>
            <p className="text-[9px] text-slate-400 font-bold mb-0.5">terpakai</p>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${burnRate}%` }}></div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 border-y-slate-200 border-r-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Transaksi (Bulan Ini)</p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">{transBulanIniCount}</h4>
          <p className="text-[9px] text-blue-600 mt-2 font-bold italic flex items-center gap-1">
            <Info size={10} /> Tercatat di sistem bulan berjalan
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-slate-800 border-y-slate-200 border-r-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Saldo Kas Saat Ini</p>
          <h4 className="text-lg font-black mt-1 text-slate-800 tracking-tight">{formatIDR(totalSaldoKas)}</h4>
          <p className="text-[9px] text-emerald-600 mt-2 font-bold">✓ Sinkron dengan neraca Pos Dana</p>
        </Card>
      </div>

      {/* Analytics & Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart */}
        <Card className="lg:col-span-8 p-5 border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight size={14} className="text-rose-500" /> Fluktuasi Pengeluaran Bulanan
            </h3>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendDataset}>
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
          <Card className="p-5 border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PieIcon size={14} className="text-purple-500" /> Alokasi Jenis Belanja
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryDataset}
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDataset.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 700 }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Side Info Card */}
          <Card className="p-4 bg-amber-50 border-amber-200 text-amber-950 shadow-sm">
            <h4 className="font-black text-amber-800 flex items-center gap-1.5 mb-1.5 text-xs uppercase tracking-wide">
              <Info size={14} /> Prosedur Pengeluaran
            </h4>
            <ul className="text-[11px] text-amber-800 font-semibold space-y-2 list-disc pl-4 leading-relaxed">
              <li>Setiap pengeluaran di atas <strong className="font-black text-amber-950">Rp 500.000</strong> wajib mendapatkan approval Pastor.</li>
              <li>Nota fisik harus diupload ke sistem berupa file gambar/PDF.</li>
              <li>Sistem akan otomatis meregistrasikan SPJ jika file bukti nota diupload.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-4">
        <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-none w-full md:w-80">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor transaksi, rincian, atau kategori..."
              className="bg-transparent outline-none text-xs w-full text-slate-800 font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-1.5 text-xs border-slate-200 cursor-not-allowed" disabled>
            Filter Kategori
          </Button>
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
                <td className="px-5 py-3.5 text-xs font-black text-rose-600 border-r border-slate-100">{item.transactionNo}</td>
                <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold border-r border-slate-100">
                  {new Date(item.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </td>
                <td className="px-5 py-3.5 text-xs font-bold text-slate-700 border-r border-slate-100 max-w-[280px] truncate" title={item.description}>
                  {item.description}
                </td>
                <td className="px-5 py-3.5 border-r border-slate-100">
                  <div className="flex flex-col gap-0.5 items-start">
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded border border-rose-100/50 uppercase tracking-tight">
                      {item.fundCategory?.name}
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200 uppercase tracking-tight mt-0.5">
                      {item.expenseType?.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs font-black text-right text-rose-600 border-r border-slate-100">{formatIDR(Number(item.amount))}</td>
                <td className="px-5 py-3.5 border-r border-slate-100">
                  {item.status === 'MENUNGGU_SPJ' ? (
                    <div className="flex flex-col gap-1.5 items-start">
                      <Badge variant="warning">Menunggu SPJ</Badge>
                      <button
                        onClick={() => {
                          setSelectedTransactionId(item.id);
                          setIsSpjUploadOpen(true);
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
                      >
                        Upload SPJ
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
                      className="p-1.5 inline-block hover:bg-slate-100 border border-slate-200 rounded text-rose-600 hover:text-rose-700 transition-all"
                      title={item.attachment.fileName}
                    >
                      <FileImage size={14} />
                    </a>
                  ) : (
                    <span className="text-slate-300 font-bold text-[10px]">-</span>
                  )}
                </td>
              </tr>
            )}
            renderMobileCard={(item) => (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-rose-600">{item.transactionNo}</span>
                  {item.status === 'MENUNGGU_SPJ' ? (
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="warning">Menunggu SPJ</Badge>
                      <button
                        onClick={() => {
                          setSelectedTransactionId(item.id);
                          setIsSpjUploadOpen(true);
                        }}
                        className="text-[9px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
                      >
                        Upload SPJ
                      </button>
                    </div>
                  ) : (
                    <Badge variant="success">Selesai</Badge>
                  )}
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700 max-w-[200px] truncate">{item.description}</span>
                  <span className="text-sm font-black text-rose-600">{formatIDR(Number(item.amount))}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                  <span>{new Date(item.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                  <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded border border-rose-100/50 uppercase tracking-tight text-[8px] font-black">
                      {item.fundCategory?.name}
                    </span>
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-black uppercase tracking-tight text-[8px]">
                      {item.expenseType?.name}
                    </span>
                  </div>
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