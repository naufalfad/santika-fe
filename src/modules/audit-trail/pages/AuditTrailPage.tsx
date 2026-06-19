import { useState, useEffect } from 'react';
import { Search, Filter, History, Calendar, Shield } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import { useAuditLogsQuery } from '../hooks/useAuditLogsQuery';

/**
 * Typesafe Audit Trail ledger page connected to backend.
 * Uses useAuditLogsQuery to fetch logs from the database, supporting filters and pagination.
 */
const AuditTrailPage = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // React Query Hook with server-side filters and pagination
  const { data: logsData, isLoading, error } = useAuditLogsQuery({
    search: search || undefined,
    type: filterType !== 'ALL' ? filterType : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Reset to first page when search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType]);

  const logs = logsData?.logs || [];
  const pagination = logsData?.pagination || {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: itemsPerPage,
  };

  const getBadgeVariant = (type: string) => {
    const t = type.toLowerCase();
    switch (t) {
      case 'in': return 'success';
      case 'out': return 'danger';
      case 'approve': return 'success';
      case 'spj': return 'warning';
      case 'reject': return 'danger';
      case 'revise': return 'warning';
      case 'auth': return 'info';
      default: return 'default';
    }
  };

  const getLogTypeLabel = (type: string) => {
    const t = type.toLowerCase();
    switch (t) {
      case 'in': return 'Penerimaan';
      case 'out': return 'Disbursement';
      case 'approve': return 'Disetujui';
      case 'spj': return 'SPJ';
      case 'reject': return 'Ditolak';
      case 'revise': return 'Revisi';
      case 'auth': return 'Keamanan';
      default: return type;
    }
  };

  const formatMutasi = (amount: number | null, type: string) => {
    if (!amount || amount === 0) return <span className="text-slate-400">-</span>;
    const t = type.toLowerCase();
    const isPositive = t === 'in' || t === 'approve';
    const isNegative = t === 'out';
    const colorClass = isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-700';
    const prefix = isPositive ? '+' : isNegative ? '-' : '';

    return (
      <span className={colorClass}>
        {prefix} {formatIDR(amount)}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium text-slate-800 tracking-tight flex items-center gap-2">
            <History className="text-slate-500" size={24} /> Audit Trail
          </h2>
          <p className="text-sm text-gray-500">Penelusuran historis tindakan pengguna paroki demi transparansi.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-slate-50 flex flex-col md:flex-row gap-4 items-center rounded-none shadow-sm">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-none w-full md:w-80 transition-colors focus-within:border-slate-700">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari aktivitas atau nama aktor..."
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
            <option value="IN">Penerimaan (IN)</option>
            <option value="OUT">Disbursement (OUT)</option>
            <option value="APPROVE">Persetujuan (APPROVE)</option>
            <option value="SPJ">Unggahan SPJ (SPJ)</option>
            <option value="REJECT">Penolakan (REJECT)</option>
            <option value="REVISE">Revisi (REVISE)</option>
            <option value="AUTH">Keamanan / Login (AUTH)</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <Shield size={14} className="text-slate-400" /> Kepatuhan Internal
        </div>
      </Card>

      {/* Error & Loading state */}
      {error ? (
        <div className="p-8 text-center text-rose-500 bg-white border border-rose-250 rounded-none shadow-sm font-semibold text-xs">
          Gagal mengambil data log audit dari server. Pastikan Anda masuk sebagai Super Admin, Pastor, atau Bendahara.
        </div>
      ) : (
        <AdaptiveList
          data={logs}
          isLoading={isLoading}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalItems: pagination.totalItems,
            itemsPerPage: pagination.itemsPerPage,
            onPageChange: setCurrentPage,
          }}
          desktopHeaders={[
            'Waktu',
            'Jenis Aksi',
            'Pelaku (Actor)',
            'Deskripsi Aktivitas',
            'Nilai Mutasi',
          ]}
          renderDesktopRow={(log) => (
            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-5 py-2.5 text-xs text-slate-500 font-medium border-r whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-400" />
                  {new Date(log.tanggal).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </td>
              <td className="px-5 py-2.5 border-r">
                <Badge variant={getBadgeVariant(log.type)}>
                  {getLogTypeLabel(log.type)}
                </Badge>
              </td>
              <td className="px-5 py-2.5 text-xs font-semibold text-slate-700 border-r whitespace-nowrap">
                {log.actor?.name || 'Sistem'}
                <span className="text-[10px] text-slate-400 block font-normal">
                  {log.actor?.role.replace(/_/g, ' ') || ''}
                </span>
              </td>
              <td className="px-5 py-2.5 text-xs font-semibold text-slate-800 leading-relaxed border-r">
                {log.action}
              </td>
              <td className="px-5 py-2.5 text-xs text-right font-semibold">
                {formatMutasi(log.amount ? Number(log.amount) : null, log.type)}
              </td>
            </tr>
          )}
          renderMobileCard={(log) => (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  {new Date(log.tanggal).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <Badge variant={getBadgeVariant(log.type)}>
                  {getLogTypeLabel(log.type)}
                </Badge>
              </div>
              <div className="text-xs font-semibold text-slate-800 leading-relaxed">{log.action}</div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-50">
                <span className="text-[10px] text-slate-400 font-normal">
                  Oleh: {log.actor?.name || 'Sistem'} ({log.actor?.role.replace(/_/g, ' ') || ''})
                </span>
                {log.amount && log.amount !== 0 && (
                  <div className="text-right text-xs font-semibold">
                    {formatMutasi(Number(log.amount), log.type)}
                  </div>
                )}
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default AuditTrailPage;