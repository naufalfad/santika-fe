import { useState } from 'react';
import { Search, Filter, History, Calendar, Shield } from 'lucide-react';
import { useActivityStore } from '../../../app/store/useActivityStore';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';

const AuditTrailPage = () => {
  const logs = useActivityStore((state) => state.logs);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'ALL' || log.type.toUpperCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'in': return 'success';
      case 'out': return 'default';
      case 'approve': return 'success';
      case 'spj': return 'warning';
      case 'reject': return 'default';
      case 'revise': return 'warning';
      default: return 'default';
    }
  };

  const getLogTypeLabel = (type: string) => {
    switch (type) {
      case 'in': return 'Penerimaan';
      case 'out': return 'Disbursement';
      case 'approve': return 'Disetujui';
      case 'spj': return 'SPJ';
      case 'reject': return 'Ditolak';
      case 'revise': return 'Revisi';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <History className="text-slate-500" size={24} /> Audit Trail
          </h2>
          <p className="text-gray-500">Penelusuran historis tindakan pengguna paroki demi transparansi.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-slate-50 border-none flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 bg-white px-3 py-2 border rounded-lg w-full md:w-80">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari aktivitas..."
            className="bg-transparent text-sm outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 border rounded-lg w-full md:w-auto">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent text-sm font-medium outline-none"
          >
            <option value="ALL">Semua Aktivitas</option>
            <option value="IN">Penerimaan</option>
            <option value="OUT">Disbursement</option>
            <option value="APPROVE">Persetujuan</option>
            <option value="SPJ">Unggahan SPJ</option>
            <option value="REJECT">Penolakan</option>
            <option value="REVISE">Revisi</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Shield size={14} className="text-slate-400" /> Kepatuhan Internal
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[11px] uppercase text-gray-400 font-bold border-b">
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Jenis Aksi</th>
                <th className="px-6 py-4">Deskripsi Aktivitas</th>
                <th className="px-6 py-4 text-right">Nilai Mutasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <Calendar size={12} /> {log.time}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant={getBadgeVariant(log.type)}
                      className={log.type === 'out' || log.type === 'reject' ? 'bg-rose-100 text-rose-700 border border-rose-200' : ''}
                    >
                      {getLogTypeLabel(log.type)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800 leading-relaxed">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-right font-black">
                    {log.amount > 0 ? (
                      <span className={log.type === 'in' ? 'text-emerald-600' : log.type === 'out' ? 'text-rose-600' : 'text-slate-700'}>
                        {log.type === 'in' ? '+' : log.type === 'out' ? '-' : ''} {formatIDR(log.amount)}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                    Tidak ada catatan aktivitas yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AuditTrailPage;
