import { useState, useMemo } from 'react';
import { Search, Filter, History, Calendar, Shield } from 'lucide-react';
import { useActivityStore } from '../../../app/store/useActivityStore';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';

/**
 * Typesafe Audit Trail ledger page utilizing centralized formatters.
 * Memoizes log filtration and utilizes AdaptiveList for responsive viewport rendering.
 * Pure flat design with zero overlapping component animations.
 */
const AuditTrailPage = () => {
  const logs = useActivityStore((state) => state.logs);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Memoize state filtering logic to maintain performance under large audit history datasets
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterType === 'ALL' || log.type.toUpperCase() === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [logs, search, filterType]);

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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium text-slate-800 tracking-tight flex items-center gap-2">
            <History className="text-slate-500" size={24} /> Audit Trail
          </h2>
          <p className="text-sm text-gray-500">Penelusuran historis tindakan pengguna paroki demi transparansi.</p>
        </div>
      </div>

      {/* Filter Toolbar - Clean flat container with compact density */}
      <Card className="p-4 bg-slate-50 flex flex-col md:flex-row gap-4 items-center rounded-none shadow-sm">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-none w-full md:w-80 transition-colors focus-within:border-slate-700">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari aktivitas..."
            className="bg-transparent text-xs outline-none w-full font-semibold text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-none w-full md:w-auto transition-colors focus-within:border-slate-700">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent text-xs font-medium outline-none text-slate-600 cursor-pointer"
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
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <Shield size={14} className="text-slate-400" /> Kepatuhan Internal
        </div>
      </Card>

      {/* Logs Table - Powered by AdaptiveList */}
      <AdaptiveList
        data={filteredLogs}
        desktopHeaders={[
          'Waktu',
          'Jenis Aksi',
          'Deskripsi Aktivitas',
          'Nilai Mutasi'
        ]}
        renderDesktopRow={(log) => (
          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-5 py-2.5 text-xs text-slate-500 font-medium border-r whitespace-nowrap">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-slate-400" /> {log.time}
              </span>
            </td>
            <td className="px-5 py-2.5 border-r">
              <Badge
                variant={getBadgeVariant(log.type)}
                className={log.type === 'out' || log.type === 'reject' ? 'text-rose-600' : ''}
              >
                {getLogTypeLabel(log.type)}
              </Badge>
            </td>
            <td className="px-5 py-2.5 text-xs font-semibold text-slate-800 leading-relaxed border-r">
              {log.action}
            </td>
            <td className="px-5 py-2.5 text-xs text-right font-semibold">
              {log.amount > 0 ? (
                <span className={log.type === 'in' ? 'text-emerald-600' : log.type === 'out' ? 'text-rose-600' : 'text-slate-700'}>
                  {log.type === 'in' ? '+' : log.type === 'out' ? '-' : ''} {formatIDR(log.amount)}
                </span>
              ) : (
                <span className="text-slate-400">-</span>
              )}
            </td>
          </tr>
        )}
        renderMobileCard={(log) => (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" /> {log.time}
              </span>
              <Badge
                variant={getBadgeVariant(log.type)}
                className={log.type === 'out' || log.type === 'reject' ? 'text-rose-600' : ''}
              >
                {getLogTypeLabel(log.type)}
              </Badge>
            </div>
            <div className="text-xs font-semibold text-slate-800 leading-relaxed">{log.action}</div>
            {log.amount > 0 && (
              <div className="text-right pt-1 text-xs font-semibold">
                <span className={log.type === 'in' ? 'text-emerald-600' : log.type === 'out' ? 'text-rose-600' : 'text-slate-700'}>
                  {log.type === 'in' ? '+' : '-'} {formatIDR(log.amount)}
                </span>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default AuditTrailPage;