import { useState, useMemo } from 'react';
import { Search, Filter, UploadCloud, FolderOpen, ShieldCheck, Clock } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { SPJCard } from '../components/SPJCard';
import { FilePreview } from '../components/FilePreview';
import { SPJUploadModal } from '../components/SPJUploadModal';
import { useSPJStore } from '../../../app/store/useSPJStore';
import { useActivityStore } from '../../../app/store/useActivityStore';
import { useAuthStore } from '../../../app/store/useAuthStore';
import type { SPJDocument } from '../../../shared/mock/spjData';
import { formatIDR } from '../../../shared/utils/formatter';

/**
 * Optimised SPJ Document management page.
 * Implements clean layouts, zero box-in-a-box frames, and memoized metrics.
 * 100% interactive, sharp-edge styling.
 */
const SPJPage = () => {
  const spjDocuments = useSPJStore((state) => state.spjDocuments);
  const verifySPJDocument = useSPJStore((state) => state.verifySPJDocument);
  const addLog = useActivityStore((state) => state.addLog);
  const user = useAuthStore((state) => state.user);

  const [selectedDoc, setSelectedDoc] = useState<SPJDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');

  // Memoize static metrics calculations from SPJ store state
  const { totalArsip, totalVerified, totalPending } = useMemo(() => {
    return {
      totalArsip: spjDocuments.length,
      totalVerified: spjDocuments.filter((doc) => doc.status === 'Verified').length,
      totalPending: spjDocuments.filter((doc) => doc.status === 'Pending').length,
    };
  }, [spjDocuments]);

  // Memoize search query sorting
  const filteredDocs = useMemo(() => {
    return spjDocuments.filter(doc => {
      const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
                          doc.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'Semua Kategori' || doc.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [spjDocuments, search, categoryFilter]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">SPJ Digital</h2>
          <p className="text-sm text-gray-500">Arsip surat pertanggungjawaban dan bukti transaksi.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 shadow-none rounded-none">
          <UploadCloud size={16} /> Upload Dokumen
        </Button>
      </div>

      {/* Stats Mini Cards - Seamless border flat layouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5 border-b-4 border-b-blue-600 border-x-slate-200 border-t-slate-200 shadow-none rounded-none">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-none border border-blue-100/50"><FolderOpen size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Arsip</p>
            <h4 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">{totalArsip} <span className="text-[11px] font-bold text-slate-400">File</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3.5 border-b-4 border-b-emerald-600 border-x-slate-200 border-t-slate-200 shadow-none rounded-none">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-none border border-emerald-100/50"><ShieldCheck size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Terverifikasi</p>
            <h4 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">{totalVerified} <span className="text-[11px] font-bold text-slate-400">File</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3.5 border-b-4 border-b-amber-500 border-x-slate-200 border-t-slate-200 shadow-none rounded-none">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-none border border-amber-100/50"><Clock size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Menunggu</p>
            <h4 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">{totalPending} <span className="text-[11px] font-bold text-slate-400">File</span></h4>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="p-3.5 bg-slate-50 border border-slate-200 flex flex-col md:flex-row gap-4 items-center rounded-none shadow-none">
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-none px-3 py-1.5 text-xs font-bold outline-none text-slate-600 cursor-pointer"
          >
            <option value="Semua Kategori">Semua Kategori</option>
            <option value="Liturgi">Liturgi</option>
            <option value="Pembangunan">Pembangunan</option>
            <option value="Sosial">Sosial (PSE)</option>
            <option value="Sekretariat">Sekretariat</option>
          </select>
          <Button variant="outline" className="flex items-center gap-1.5 text-xs border-slate-200 bg-white rounded-none">
            <Filter size={14} /> Filter
          </Button>
        </div>
      </Card>

      {/* Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDocs.map(doc => (
          <SPJCard key={doc.id} doc={doc} onPreview={setSelectedDoc} />
        ))}
      </div>

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
        {selectedDoc && (
          <div className="space-y-4">
            <FilePreview
              fileUrl={selectedDoc.thumbnail}
              fileName={selectedDoc.title}
              fileType={selectedDoc.fileType}
              onClose={() => setSelectedDoc(null)}
            />
            {/* Flat details section - no boxes inside a box */}
            <div className="pt-4 border-t border-slate-100">
              <h5 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-3">Detail Dokumen</h5>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold">
                <span className="text-slate-400">ID Dokumen</span>
                <span className="font-bold text-slate-700 text-right">{selectedDoc.id}</span>
                <span className="text-slate-400">Kategori</span>
                <span className="font-bold text-slate-700 text-right">{selectedDoc.category}</span>
                <span className="text-slate-400">Nilai Transaksi</span>
                <span className="font-black text-emerald-600 text-right">{formatIDR(selectedDoc.amount)}</span>
                <span className="text-slate-400">Status</span>
                <span className={`font-black text-right uppercase tracking-tight text-[11px] ${selectedDoc.status === 'Verified' ? 'text-emerald-600' : selectedDoc.status === 'Pending' ? 'text-amber-500' : 'text-rose-500'}`}>
                  {selectedDoc.status}
                </span>
              </div>
            </div>

            {/* Action buttons (only show verify if status is Pending and user is BENDAHARA/SUPER_ADMIN) */}
            {selectedDoc.status === 'Pending' && (user?.role === 'BENDAHARA' || user?.role === 'SUPER_ADMIN') && (
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <Button
                  onClick={() => {
                    verifySPJDocument(selectedDoc.id);
                    addLog(
                      `SPJ Diverifikasi - ${selectedDoc.title} oleh ${user?.name || 'Bendahara'}`,
                      selectedDoc.amount,
                      'spj'
                    );
                    setSelectedDoc(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-none shadow-none flex justify-center items-center gap-1.5"
                >
                  Verifikasi Sekarang
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