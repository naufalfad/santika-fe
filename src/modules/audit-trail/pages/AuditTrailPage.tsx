import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, History, Calendar, Shield, FileImage } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import { useAuditLogsQuery, useSingleTransactionQuery } from '../hooks/useAuditLogsQuery';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { useAuditTransactionMutation } from '../../kas-masuk/hooks/useKasMasukQuery';
import { useActivityStore } from '../../../app/store/useActivityStore';
import { useNotificationStore } from '../../../app/store/useNotificationStore';
import { cn } from '../../../shared/utils/cn';

/**
 * Typesafe Audit Trail ledger page connected to backend.
 * Uses useAuditLogsQuery to fetch logs from the database, supporting filters and pagination.
 */
const AuditTrailPage = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogForAudit, setSelectedLogForAudit] = useState<{ id: string; type: 'INCOME' | 'EXPENSE' } | null>(null);
  const itemsPerPage = 10;

  const { user } = useAuthStore();
  const isAuditor = user?.role === 'SUPER_ADMIN' || user?.role === 'PASTOR' || user?.role === 'BENDAHARA';
  const auditMutation = useAuditTransactionMutation();
  const addLog = useActivityStore((state) => state.addLog);
  const addNotification = useNotificationStore((state) => state.addNotification);

  // States for verification form inside modal
  const [auditStatusVal, setAuditStatusVal] = useState<'TERVERIFIKASI' | 'PERLU_KLARIFIKASI' | 'TIDAK_VALID'>('TERVERIFIKASI');
  const [auditNotesVal, setAuditNotesVal] = useState('');

  // Fetch the single transaction for auditing
  const { data: transactionDetails, isLoading: isTxLoading, refetch: refetchTx } = useSingleTransactionQuery(
    selectedLogForAudit?.id,
    selectedLogForAudit?.type
  );

  // Sync audit form values when transaction details load
  useEffect(() => {
    if (transactionDetails) {
      const status = transactionDetails.auditStatus;
      if (status && status !== 'BELUM_DIAUDIT') {
        setAuditStatusVal(status as any);
      } else {
        setAuditStatusVal('TERVERIFIKASI');
      }
      setAuditNotesVal(transactionDetails.auditNotes || '');
    }
  }, [transactionDetails]);

  // Calculate api asset base URL for receipt preview
  const apiAssetUrl = useMemo(() => {
    return (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
  }, []);

  const [selectedBuktiUrl, setSelectedBuktiUrl] = useState<string | null>(null);

  const handleAuditSubmit = () => {
    if (!selectedLogForAudit || !transactionDetails) return;
    auditMutation.mutate(
      {
        id: selectedLogForAudit.id,
        status: auditStatusVal,
        notes: auditNotesVal,
      },
      {
        onSuccess: () => {
          addLog(
            `Audit Transaksi - ${transactionDetails.transactionNo}`,
            Number(transactionDetails.amount),
            selectedLogForAudit.type === 'INCOME' ? 'in' : 'out'
          );
          addNotification(
            'Audit Berhasil Disimpan',
            `Transaksi ${transactionDetails.transactionNo} berhasil diubah statusnya menjadi ${auditStatusVal}.`,
            'success'
          );
          setSelectedLogForAudit(null);
          // Refetch logs to reflect new status
          refetchTx();
        },
        onError: (err: any) => {
          addNotification(
            'Gagal Menyimpan Audit',
            err?.response?.data?.message || 'Terjadi kesalahan saat mengaudit transaksi.',
            'error'
          );
        }
      }
    );
  };

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
            ''
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
              <td className="px-5 py-2.5 text-xs text-right font-semibold border-r">
                {formatMutasi(log.amount ? Number(log.amount) : null, log.type)}
              </td>
              <td className="px-3 py-2.5 text-center">
                {(() => {
                  const txId = log.newData && typeof log.newData === 'object' && log.newData.transactionId;
                  const txType = log.newData && typeof log.newData === 'object' && log.newData.transactionType;
                  if (txId && txType) {
                    return (
                      <button
                        onClick={() => setSelectedLogForAudit({ id: txId, type: txType })}
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer outline-none whitespace-nowrap hover:underline"
                      >
                        Lihat / Audit
                      </button>
                    );
                  }
                  return <span className="text-slate-300">-</span>;
                })()}
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
              {(() => {
                const txId = log.newData && typeof log.newData === 'object' && log.newData.transactionId;
                const txType = log.newData && typeof log.newData === 'object' && log.newData.transactionType;
                if (txId && txType) {
                  return (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => setSelectedLogForAudit({ id: txId, type: txType })}
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer outline-none"
                      >
                        Lihat & Audit Transaksi
                      </button>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        />
      )}
      {/* Transaction Details & Audit Modal */}
      {selectedLogForAudit && (
        <Modal
          isOpen={!!selectedLogForAudit}
          onClose={() => setSelectedLogForAudit(null)}
          title={selectedLogForAudit.type === 'INCOME' ? "Audit Transaksi Kas Masuk" : "Audit Transaksi Kas Keluar"}
        >
          {isTxLoading ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2.5 font-semibold text-xs">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
              Memuat detail transaksi...
            </div>
          ) : !transactionDetails ? (
            <div className="p-8 text-center text-rose-500 font-semibold text-xs">
              Gagal memuat detail transaksi. Transaksi mungkin telah dihapus.
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="border border-slate-100 p-4 bg-slate-50/50 rounded-none space-y-3">
                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div className="text-slate-400 font-medium">Nomor Transaksi</div>
                  <div className="text-slate-800 font-bold font-mono">{transactionDetails.transactionNo}</div>

                  <div className="text-slate-400 font-medium">Tanggal Transaksi</div>
                  <div className="text-slate-800 font-semibold">
                    {new Date(transactionDetails.transactionDate).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>

                  <div className="text-slate-400 font-medium">Jenis Transaksi</div>
                  <div className="text-slate-800 font-semibold">
                    {transactionDetails.specialFundId ? 'Dana Khusus' : 'Pos Dana Permanen'}
                  </div>

                  <div className="text-slate-400 font-medium">Pos Dana</div>
                  <div className="text-slate-800 font-semibold">{transactionDetails.fundCategory?.name || '-'}</div>

                  {selectedLogForAudit.type === 'INCOME' ? (
                    <>
                      <div className="text-slate-400 font-medium">Jenis Penerimaan</div>
                      <div className="text-slate-800 font-semibold">{transactionDetails.incomeType?.name || '-'}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-slate-400 font-medium">Jenis Pengeluaran</div>
                      <div className="text-slate-800 font-semibold">
                        {transactionDetails.expenseType?.name || (transactionDetails.specialFund?.name ? 'Dana Khusus' : 'Lain-lain')}
                      </div>
                      <div className="text-slate-400 font-medium">Status SPJ</div>
                      <div className="text-slate-850 font-semibold text-rose-700">
                        {transactionDetails.status === 'MENUNGGU_SPJ' ? 'Menunggu Pertanggungjawaban (SPJ)' : 'Selesai'}
                      </div>
                    </>
                  )}

                  {transactionDetails.specialFund && (
                    <>
                      <div className="text-slate-400 font-medium">Program Dana Khusus</div>
                      <div className="text-slate-800 font-semibold">{transactionDetails.specialFund.name || '-'}</div>
                    </>
                  )}

                  <div className="text-slate-400 font-medium">Keterangan</div>
                  <div className="text-slate-800 font-medium whitespace-pre-wrap">{transactionDetails.description}</div>

                  <div className="text-slate-400 font-medium">Status Audit</div>
                  <div className="text-slate-800 font-semibold">
                    <Badge variant={
                      transactionDetails.auditStatus === 'TERVERIFIKASI' ? 'success' :
                      transactionDetails.auditStatus === 'PERLU_KLARIFIKASI' ? 'warning' :
                      transactionDetails.auditStatus === 'TIDAK_VALID' ? 'danger' : 'default'
                    } className="px-2 py-0.5 text-[10px]">
                      {transactionDetails.auditStatus === 'TERVERIFIKASI' ? 'Terverifikasi' :
                       transactionDetails.auditStatus === 'PERLU_KLARIFIKASI' ? 'Klarifikasi' :
                       transactionDetails.auditStatus === 'TIDAK_VALID' ? 'Tidak Valid' : 'Belum Diaudit'}
                    </Badge>
                  </div>

                  {transactionDetails.auditedBy && (
                    <>
                      <div className="text-slate-400 font-medium">Auditor</div>
                      <div className="text-slate-800 font-semibold">
                        {transactionDetails.auditedBy.name} ({transactionDetails.auditedBy.role})
                      </div>
                    </>
                  )}

                  {transactionDetails.auditedAt && (
                    <>
                      <div className="text-slate-400 font-medium">Waktu Audit</div>
                      <div className="text-slate-800 font-semibold">
                        {new Date(transactionDetails.auditedAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </>
                  )}

                  {transactionDetails.auditNotes && (
                    <>
                      <div className="text-slate-400 font-medium">Catatan Audit</div>
                      <div className="text-slate-800 font-medium italic whitespace-pre-wrap">
                        "{transactionDetails.auditNotes}"
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className={cn(
                "p-4 rounded-none flex justify-between items-center border",
                selectedLogForAudit.type === 'INCOME' 
                  ? "bg-emerald-50/50 border-emerald-100" 
                  : "bg-rose-50/50 border-rose-100"
              )}>
                <span className="text-xs font-semibold text-slate-500">
                  Nominal {selectedLogForAudit.type === 'INCOME' ? 'Penerimaan' : 'Pengeluaran'}
                </span>
                <span className={cn(
                  "text-lg font-bold",
                  selectedLogForAudit.type === 'INCOME' ? "text-emerald-600" : "text-rose-600"
                )}>
                  {formatIDR(Number(transactionDetails.amount))}
                </span>
              </div>

              {selectedLogForAudit.type === 'EXPENSE' && transactionDetails.attachment?.fileUrl && (
                <div className="p-4 border border-slate-100 rounded-none space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">Bukti Pengeluaran Lampiran:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBuktiUrl(`${apiAssetUrl}${transactionDetails.attachment!.fileUrl}`);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-xs font-semibold transition-colors rounded-none outline-none cursor-pointer"
                  >
                    <FileImage size={14} /> Lihat Bukti Fisik / Nota
                  </button>
                </div>
              )}

              {isAuditor && (
                <div className="border border-slate-200 p-4 space-y-4 rounded-none">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Panel Verifikasi Audit
                  </h4>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Pilih Status Verifikasi:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAuditStatusVal('TERVERIFIKASI')}
                        className={cn(
                          "py-2 px-3 text-xs font-semibold border text-center transition-colors cursor-pointer rounded-none outline-none",
                          auditStatusVal === 'TERVERIFIKASI'
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        Terverifikasi
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuditStatusVal('PERLU_KLARIFIKASI')}
                        className={cn(
                          "py-2 px-3 text-xs font-semibold border text-center transition-colors cursor-pointer rounded-none outline-none",
                          auditStatusVal === 'PERLU_KLARIFIKASI'
                            ? "bg-amber-50 border-amber-500 text-amber-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        Klarifikasi
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuditStatusVal('TIDAK_VALID')}
                        className={cn(
                          "py-2 px-3 text-xs font-semibold border text-center transition-colors cursor-pointer rounded-none outline-none",
                          auditStatusVal === 'TIDAK_VALID'
                            ? "bg-red-50 border-red-500 text-red-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        Tidak Valid
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="auditNotes" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Catatan Audit (Opsional):
                    </label>
                    <textarea
                      id="auditNotes"
                      placeholder="Masukkan alasan jika perlu klarifikasi atau tidak valid..."
                      value={auditNotesVal}
                      onChange={(e) => setAuditNotesVal(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2.5 outline-none focus:border-slate-800 rounded-none bg-slate-50/50 min-h-[60px]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAuditSubmit}
                    disabled={auditMutation.isPending}
                    className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold transition-colors cursor-pointer rounded-none outline-none"
                  >
                    {auditMutation.isPending ? 'Menyimpan...' : 'Simpan Hasil Verifikasi'}
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t">
                <Button
                  onClick={() => setSelectedLogForAudit(null)}
                  variant="outline"
                  size="sm"
                  className="rounded-none text-xs border-slate-200"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Bukti Preview Modal */}
      <Modal isOpen={!!selectedBuktiUrl} onClose={() => setSelectedBuktiUrl(null)} title="Bukti Transaksi Kas Keluar">
        {selectedBuktiUrl && (
          <div className="space-y-4">
            <div className="rounded-none overflow-hidden h-[500px] bg-slate-50 flex items-center justify-center border border-slate-100">
              {selectedBuktiUrl.toLowerCase().split('?')[0].endsWith('.pdf') ? (
                <iframe
                  src={selectedBuktiUrl}
                  title="Bukti Pengeluaran PDF"
                  className="w-full h-full border-none"
                />
              ) : (
                <img src={selectedBuktiUrl} alt="Bukti Pengeluaran" className="max-w-full max-h-full object-contain" />
              )}
            </div>
            <div className="flex justify-end pt-4 border-t gap-2">
              <Button onClick={() => setSelectedBuktiUrl(null)} variant="outline" size="sm" className="rounded-none text-xs border-slate-200">
                Tutup Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditTrailPage;