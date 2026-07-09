import { useState, useMemo, useEffect } from 'react';
import { Search, UploadCloud, FolderOpen, ShieldCheck, Clock } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { SPJCard } from '../components/SPJCard';
import { FilePreview } from '../components/FilePreview';
import { SPJUploadModal } from '../components/SPJUploadModal';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { useSpjsQuery, useVerifySpjMutation } from '../hooks/useSpjQuery';
import type { SpjDocument } from '../hooks/useSpjQuery';
import { formatIDR } from '../../../shared/utils/formatter';
import { Pagination } from '../../../shared/components/ui/Pagination';

/**
 * Optimised SPJ Document management page integrated with backend.
 * Implements clean layouts, zero box-in-a-box frames, and memoized metrics.
 * 100% interactive, sharp-edge styling.
 */
const SPJPage = () => {
  const { data: spjDocuments = [], isLoading } = useSpjsQuery();
  const verifyMutation = useVerifySpjMutation();
  const user = useAuthStore((state) => state.user);

  const [selectedDoc, setSelectedDoc] = useState<SpjDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH'>('ALL');
  const [sortBy, setSortBy] = useState<'LATEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('LATEST');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Memoize static metrics calculations from SPJ query state
  const { totalArsip, totalVerified, totalPending } = useMemo(() => {
    return {
      totalArsip: spjDocuments.length,
      totalVerified: spjDocuments.filter((doc) => doc.status === 'VERIFIED').length,
      totalPending: spjDocuments.filter((doc) => doc.status === 'PENDING').length,
    };
  }, [spjDocuments]);

  // Cascading data processing engine:
  // 1. Filter by status and time range
  const filteredByTimeAndStatus = useMemo(() => {
    return spjDocuments.filter(doc => {
      // Status Filter
      if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;

      // Time Range Filter
      if (timeRange !== 'ALL') {
        const d = new Date(doc.createdAt);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        if (timeRange === 'THIS_MONTH') {
          if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) {
            return false;
          }
        } else if (timeRange === 'LAST_MONTH') {
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          if (d.getMonth() !== lastMonth || d.getFullYear() !== lastMonthYear) {
            return false;
          }
        }
      }
      return true;
    });
  }, [spjDocuments, statusFilter, timeRange]);

  // 2. Filter by search term
  const searchedData = useMemo(() => {
    if (!search) return filteredByTimeAndStatus;
    const term = search.toLowerCase();
    return filteredByTimeAndStatus.filter(doc => {
      const category = doc.cashTransaction?.expenseType?.name || doc.kegiatan?.namaKegiatan || 'Umum';
      return doc.title.toLowerCase().includes(term) || category.toLowerCase().includes(term);
    });
  }, [filteredByTimeAndStatus, search]);

  // 3. Sort data
  const sortedData = useMemo(() => {
    const dataCopy = [...searchedData];
    return dataCopy.sort((a, b) => {
      if (sortBy === 'LATEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'AMOUNT_DESC') {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortBy === 'AMOUNT_ASC') {
        return Number(a.amount) - Number(b.amount);
      }
      return 0;
    });
  }, [searchedData, sortBy]);

  // 4. Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedData.length / itemsPerPage);
  }, [sortedData, itemsPerPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, timeRange, sortBy]);

  // Extract preview file info for the selected document
  const previewInfo = useMemo(() => {
    if (!selectedDoc) return null;
    const firstLampiran = selectedDoc.lampiran?.[0]?.attachment;
    const apiAssetUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    const fileUrl = firstLampiran ? `${apiAssetUrl}${firstLampiran.fileUrl}` : undefined;
    const isPdf = firstLampiran?.fileType === 'PDF';
    const fileType: 'pdf' | 'image' = isPdf ? 'pdf' : 'image';
    const category = selectedDoc.cashTransaction?.expenseType?.name || selectedDoc.kegiatan?.namaKegiatan || 'Umum';

    return {
      fileUrl,
      fileType,
      category,
    };
  }, [selectedDoc]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-medium text-slate-800 tracking-tight">SPJ Digital</h2>
          <p className="text-sm text-gray-500">Arsip surat pertanggungjawaban dan bukti transaksi.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 shadow-none rounded-none">
          <UploadCloud size={16} /> Upload Dokumen
        </Button>
      </div>

      {/* Stats Mini Cards - Seamless border flat layouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5 border border-slate-200 shadow-none rounded-none">
          <div className="text-blue-600"><FolderOpen size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Total Arsip</p>
            <h4 className="text-lg font-semibold text-slate-800 tracking-tight mt-0.5">{totalArsip} <span className="text-[11px] font-medium text-slate-400">File</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3.5 border border-slate-200 shadow-none rounded-none">
          <div className="text-sky-600"><ShieldCheck size={20} /></div>
          <div>

            <p className="text-[10px] text-slate-400 font-semibold">Terverifikasi</p>
            <h4 className="text-lg font-semibold text-slate-800 tracking-tight mt-0.5">{totalVerified} <span className="text-[11px] font-medium text-slate-400">File</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3.5 border border-slate-200 shadow-none rounded-none">
          <div className="text-amber-600"><Clock size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Menunggu</p>
            <h4 className="text-lg font-semibold text-slate-800 tracking-tight mt-0.5">{totalPending} <span className="text-[11px] font-medium text-slate-400">File</span></h4>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200/60 rounded-none w-full lg:w-96">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama dokumen atau komisi..."
            className="bg-transparent text-xs outline-none w-full font-semibold text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Rentang Waktu */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rentang Waktu:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-semibold rounded-none outline-none focus:border-slate-400 text-slate-700 cursor-pointer h-8"
            >
              <option value="ALL">Semua Waktu</option>
              <option value="THIS_MONTH">Bulan Ini</option>
              <option value="LAST_MONTH">Bulan Lalu</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-semibold rounded-none outline-none focus:border-slate-400 text-slate-700 cursor-pointer h-8"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu Verifikasi</option>
              <option value="VERIFIED">Terverifikasi</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>

          {/* Urutan */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urutan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-semibold rounded-none outline-none focus:border-slate-400 text-slate-700 cursor-pointer h-8"
            >
              <option value="LATEST">Terbaru</option>
              <option value="OLDEST">Terlama</option>
              <option value="AMOUNT_DESC">Nominal Tertinggi</option>
              <option value="AMOUNT_ASC">Nominal Terendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading & Grid View */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-none shadow-sm flex items-center justify-center gap-2.5 font-semibold text-xs">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
          Loading dokumen SPJ...
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-none shadow-sm font-semibold text-xs">
          Tidak ada dokumen SPJ ditemukan
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedData.map(doc => (
              <SPJCard key={doc.id} doc={doc} onPreview={setSelectedDoc} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            className="border border-slate-200 bg-white shadow-sm"
          />
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Dokumen Pertanggungjawaban Baru"
      >
        <SPJUploadModal
          onSuccess={() => setIsUploadOpen(false)}
          onCancel={() => setIsUploadOpen(false)}
        />
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={`Preview: ${selectedDoc?.title}`}
      >
        {selectedDoc && previewInfo && (
          <div className="space-y-4">
            <FilePreview
              fileUrl={previewInfo.fileUrl}
              fileName={selectedDoc.title}
              fileType={previewInfo.fileType}
              onClose={() => setSelectedDoc(null)}
            />
            {/* Flat details section - no boxes inside a box */}
            <div className="pt-4 border-t">
              <h5 className="font-semibold text-xs text-slate-400 mb-3">Detail Dokumen</h5>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold">
                <span className="text-slate-400">ID Dokumen</span>
                <span className="font-medium text-slate-700 text-right">{selectedDoc.id}</span>
                <span className="text-slate-400">Kategori</span>
                <span className="font-medium text-slate-700 text-right">{previewInfo.category}</span>
                <span className="text-slate-400">Nilai Transaksi</span>
                <span className="font-semibold text-sky-600 text-right">{formatIDR(selectedDoc.amount)}</span>
                <span className="text-slate-400">Status</span>
                <span className={`font-semibold text-right  tracking-tight text-[11px] ${selectedDoc.status === 'VERIFIED' ? 'text-sky-600' : selectedDoc.status === 'PENDING' ? 'text-amber-500' : 'text-rose-500'}`}>
                  {selectedDoc.status}
                </span>

              </div>
            </div>

            {/* Action buttons (only show verify if status is PENDING and user is BENDAHARA/SUPER_ADMIN) */}
            {selectedDoc.status === 'PENDING' && (user?.role === 'BENDAHARA' || user?.role === 'SUPER_ADMIN') && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    verifyMutation.mutate({
                      id: selectedDoc.id,
                      status: 'VERIFIED',
                    }, {
                      onSuccess: () => {
                        setSelectedDoc(null);
                      }
                    });
                  }}
                  disabled={verifyMutation.isPending}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-none shadow-md flex justify-center items-center gap-1.5"
                >
                  {verifyMutation.isPending ? 'Memproses...' : 'Verifikasi Sekarang'}

                </Button>
                <Button
                  onClick={() => {
                    verifyMutation.mutate({
                      id: selectedDoc.id,
                      status: 'REJECTED',
                    }, {
                      onSuccess: () => {
                        setSelectedDoc(null);
                      }
                    });
                  }}
                  disabled={verifyMutation.isPending}
                  variant="outline"
                  className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 font-medium py-3 rounded-none shadow-md flex justify-center items-center gap-1.5"
                >
                  {verifyMutation.isPending ? 'Memproses...' : 'Tolak SPJ'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SPJPage;