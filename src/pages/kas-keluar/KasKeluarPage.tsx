import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Download, MoreVertical, 
  ArrowUpRight, AlertCircle, PieChart as PieIcon, Info, FileImage 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { KasKeluarForm } from '../../components/forms/KasKeluarForm';
import { MOCK_KAS_KELUAR, KAS_KELUAR_STATS, CATEGORY_KELUAR_DATA, TREND_KELUAR_DATA } from '../../mock/kasKeluarData';

const KasKeluarPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Kas Keluar</h2>
          <p className="text-gray-500">Pantau pengeluaran operasional dan kegiatan paroki.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={18} /> Export Laporan
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shadow-lg shadow-rose-200 bg-rose-600 hover:bg-rose-700">
            <Plus size={18} /> Catat Pengeluaran
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-rose-500">
          <p className="text-xs text-gray-500 font-medium uppercase">Total Keluar (Bulan Ini)</p>
          <h4 className="text-xl font-bold mt-1 text-rose-600">{formatIDR(KAS_KELUAR_STATS.totalBulanIni)}</h4>
          <p className="text-[10px] text-emerald-600 mt-2 font-medium">↓ {KAS_KELUAR_STATS.hematDariBulanLalu}% lebih hemat dari bulan lalu</p>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500 font-medium uppercase">Burn Rate Anggaran</p>
          <div className="flex items-end gap-2 mt-1">
            <h4 className="text-xl font-bold">{KAS_KELUAR_STATS.anggaranTerpakai}%</h4>
            <p className="text-[10px] text-gray-400 mb-1">terpakai</p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${KAS_KELUAR_STATS.anggaranTerpakai}%` }}></div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500 font-medium uppercase">Menunggu Verifikasi</p>
          <h4 className="text-xl font-bold mt-1">{KAS_KELUAR_STATS.pendingVerifikasi}</h4>
          <p className="text-[10px] text-gray-400 mt-2 italic flex items-center gap-1">
            <AlertCircle size={10} /> Segera verifikasi bukti nota
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-slate-800">
          <p className="text-xs text-gray-500 font-medium uppercase">Saldo Kas Saat Ini</p>
          <h4 className="text-xl font-bold mt-1 text-slate-800">{formatIDR(150500000)}</h4>
          <p className="text-[10px] text-blue-600 mt-2 font-medium">Cukup untuk 12 bulan kedepan</p>
        </Card>
      </div>

      {/* Analytics & Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart */}
        <Card className="lg:col-span-8 p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ArrowUpRight size={18} className="text-rose-500" /> Fluktuasi Pengeluaran (Harian)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_KELUAR_DATA}>
                <defs>
                  <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                <Tooltip />
                <Area type="monotone" dataKey="jumlah" stroke="#e11d48" fillOpacity={1} fill="url(#colorKeluar)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut & Prosedur */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PieIcon size={18} className="text-purple-500" /> Alokasi Dana
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_KELUAR_DATA}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {CATEGORY_KELUAR_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Side Info Card */}
          <Card className="p-4 bg-amber-50 border-amber-200">
            <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2 text-sm">
              <Info size={16} /> Prosedur Pengeluaran
            </h4>
            <ul className="text-[11px] text-amber-700 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Setiap pengeluaran di atas <strong>Rp 500.000</strong> wajib mendapatkan approval Pastor.</li>
              <li>Nota fisik harus difoto jelas dan di-upload ke sistem.</li>
              <li>Pastikan kategori sesuai dengan Rencana Anggaran Tahunan.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Main Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b flex items-center bg-white justify-between">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 border rounded-lg w-full max-w-xs">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari transaksi keluar..." 
              className="bg-transparent outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="text-xs">Filter Kategori</Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[11px] uppercase text-gray-400 font-bold border-b">
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Penerima Dana</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Nominal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_KAS_KELUAR.map((item) => (
                <tr key={item.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-rose-600">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.tanggal}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{item.penerima}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600 uppercase border border-gray-200">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-right text-rose-600">{formatIDR(item.jumlah)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.status === 'Selesai' ? 'success' : 'warning'}>{item.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1.5 hover:bg-white border border-transparent hover:border-gray-200 rounded text-gray-400 hover:text-rose-600 transition-all">
                      <FileImage size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Input Pengeluaran Baru">
        <KasKeluarForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default KasKeluarPage;