import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Download, MoreVertical, 
  TrendingUp, Calendar, Target, Info 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MOCK_KAS_MASUK, KAS_MASUK_STATS, TREND_MASUK_DATA, CATEGORY_DATA } from '../../mock/kasMasukData';

const KasMasukPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const filteredData = MOCK_KAS_MASUK.filter(item => 
    item.sumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Kas Masuk</h2>
          <p className="text-gray-500">Pantau dan catat seluruh penerimaan paroki.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={18} /> Export Laporan
          </Button>
          <Button className="flex items-center gap-2 shadow-lg shadow-blue-200">
            <Plus size={18} /> Transaksi Baru
          </Button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500 font-medium uppercase">Total Bulan Ini</p>
          <h4 className="text-xl font-bold mt-1">{formatIDR(KAS_MASUK_STATS.totalBulanIni)}</h4>
          <div className="flex items-center gap-1 mt-2 text-emerald-600">
            <TrendingUp size={14} />
            <span className="text-xs font-bold">+{KAS_MASUK_STATS.growth}%</span>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs text-gray-500 font-medium uppercase">Target Penerimaan</p>
          <h4 className="text-xl font-bold mt-1">{formatIDR(KAS_MASUK_STATS.targetBulan)}</h4>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '90%' }}></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-gray-500 font-medium uppercase">Sumber Terbesar</p>
          <h4 className="text-lg font-bold mt-1 truncate">{KAS_MASUK_STATS.sumberTerbesar}</h4>
          <p className="text-[10px] text-gray-400 mt-2 italic">Kontribusi 55% dari total</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <p className="text-xs text-gray-500 font-medium uppercase">Hari Ini</p>
          <h4 className="text-xl font-bold mt-1">{formatIDR(1250000)}</h4>
          <p className="text-[10px] text-gray-400 mt-2 italic">3 Transaksi masuk</p>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-8 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" /> Tren Penerimaan 30 Hari Terakhir
            </h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_MASUK_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="jumlah" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, fill: '#0284c7' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart & Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Target size={18} className="text-emerald-500" /> Komposisi Dana
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Sidebar Info Card */}
          <Card className="p-4 bg-blue-600 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold flex items-center gap-2 mb-2">
                <Info size={16} /> Informasi Kas
              </h4>
              <p className="text-xs text-blue-100 leading-relaxed">
                Jangan lupa melakukan verifikasi fisik (hitung uang cash) sebelum menekan status "Selesai" pada input Kolekte.
              </p>
              <button className="mt-4 text-xs bg-white text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                Baca Panduan Input
              </button>
            </div>
            {/* Background decoration */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500 rounded-full opacity-50"></div>
          </Card>
        </div>
      </div>

      {/* Main Table Section */}
      <Card className="p-0 overflow-hidden shadow-sm border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-white">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg w-full md:w-80">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              className="bg-transparent outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 text-xs">
            <Filter size={16} /> Filter Lanjutan
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-bold">ID Transaksi</th>
                <th className="px-6 py-4 font-bold">Tanggal</th>
                <th className="px-6 py-4 font-bold">Kategori</th>
                <th className="px-6 py-4 font-bold">Keterangan Sumber</th>
                <th className="px-6 py-4 font-bold text-right">Jumlah (IDR)</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.tanggal}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 border border-gray-200">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{item.sumber}</td>
                  <td className="px-6 py-4 text-sm font-black text-right text-emerald-600">{formatIDR(item.jumlah)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.status === 'Selesai' ? 'success' : 'warning'}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1.5 hover:bg-white border border-transparent hover:border-gray-200 rounded shadow-sm text-gray-400 hover:text-blue-600 transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default KasMasukPage;