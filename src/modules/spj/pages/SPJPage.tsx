import { useState, useMemo } from 'react';
import { Search, Filter, UploadCloud, FolderOpen, ShieldCheck, Clock } from 'lucide-react';
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

  // Memoize static metrics calculations from SPJ query state
  const { totalArsip, totalVerified, totalPending } = useMemo(() => {
    return {
      totalArsip: spjDocuments.length,
      totalVerified: spjDocuments.filter((doc) => doc.status === 'VERIFIED').length,
      totalPending: spjDocuments.filter((doc) => doc.status === 'PENDING').length,
    };
  }, [spjDocuments]);

  // Memoize search and status query filtering
  const filteredDocs = useMemo(() => {
    return spjDocuments.filter(doc => {
      const category = doc.cashTransaction?.expenseType?.name || doc.kegiatan?.namaKegiatan || 'Umum';
      const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
        category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [spjDocuments, search, statusFilter]);

  // Extract preview file info for the selected document
  const previewInfo = useMemo(() => {
    if (!selectedDoc) return null;
    const firstLampiran = selectedDoc.lampiran?.[0]?.attachment;
    const apiAssetUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');
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
        <Card className="p-4 flex items-center gap-3.5 border-b-4 border-b-blue-600 border-x-slate-200 border-t-slate-200 shadow-none rounded-none">
          <div className="text-blue-600"><FolderOpen size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Total Arsip</p>
            <h4 className="text-lg font-semibold text-slate-800 tracking-tight mt-0.5">{totalArsip} <span className="text-[11px] font-medium text-slate-400">File</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3.5 border-b-4 border-b-emerald-600 border-x-slate-200 border-t-slate-200 shadow-none rounded-none">
          <div className="text-emerald-600"><ShieldCheck size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Terverifikasi</p>
            <h4 className="text-lg font-semibold text-slate-800 tracking-tight mt-0.5">{totalVerified} <span className="text-[11px] font-medium text-slate-400">File</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3.5 border-b-4 border-b-amber-500 border-x-slate-200 border-t-slate-200 shadow-none rounded-none">
          <div className="text-amber-600"><Clock size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Menunggu</p>
            <h4 className="text-lg font-semibold text-slate-800 tracking-tight mt-0.5">{totalPending} <span className="text-[11px] font-medium text-slate-400">File</span></h4>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="p-3.5 bg-slate-50 flex flex-col md:flex-row gap-4 items-center rounded-none shadow-none">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-none w-full md:w-96">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama dokumen atau komisi..."
            className="bg-transparent text-xs outline-none w-full font-semibold text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-none px-3 py-1.5 text-xs font-medium outline-none text-slate-600 cursor-pointer"
          >
            <option value="ALL">Semua Kategori Status</option>
            <option value="PENDING">Menunggu Verifikasi</option>
            <option value="VERIFIED">Terverifikasi</option>
            <option value="REJECTED">Ditolak</option>
          </select>
          <Button variant="outline" className="flex items-center gap-1.5 text-xs border-slate-200 bg-white" disabled>
            <Filter size={14} /> Filter
          </Button>
        </div>
      </Card>

      {/* Loading & Grid View */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-none shadow-sm flex items-center justify-center gap-2.5 font-semibold text-xs">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
          Loading dokumen SPJ...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-none shadow-sm font-semibold text-xs">
          Tidak ada dokumen SPJ ditemukan
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDocs.map(doc => (
            <SPJCard key={doc.id} doc={doc} onPreview={setSelectedDoc} />
          ))}
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
                <span className="font-semibold text-emerald-600 text-right">{formatIDR(selectedDoc.amount)}</span>
                <span className="text-slate-400">Status</span>
                <span className={`font-semibold text-right  tracking-tight text-[11px] ${selectedDoc.status === 'VERIFIED' ? 'text-emerald-600' : selectedDoc.status === 'PENDING' ? 'text-amber-500' : 'text-rose-500'}`}>
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
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-none shadow-md flex justify-center items-center gap-1.5"
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