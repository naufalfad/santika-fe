import { useState } from 'react';
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

const SPJPage = () => {
  const spjDocuments = useSPJStore((state) => state.spjDocuments);
  const verifySPJDocument = useSPJStore((state) => state.verifySPJDocument);
  const addLog = useActivityStore((state) => state.addLog);
  const user = useAuthStore((state) => state.user);

  const [selectedDoc, setSelectedDoc] = useState<SPJDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Dynamically calculate stats from store
  const totalArsip = spjDocuments.length;
  const totalVerified = spjDocuments.filter((doc) => doc.status === 'Verified').length;
  const totalPending = spjDocuments.filter((doc) => doc.status === 'Pending').length;

  const filteredDocs = spjDocuments.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">SPJ Digital</h2>
          <p className="text-gray-500">Arsip surat pertanggungjawaban dan bukti transaksi.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2">
          <UploadCloud size={18} /> Upload Dokumen
        </Button>
      </div>

      {/* Stats Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 border-b-4 border-b-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FolderOpen size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Total Arsip</p>
            <h4 className="text-xl font-bold">{totalArsip} <span className="text-xs font-normal text-gray-400">File</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-b-4 border-b-emerald-500">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Terverifikasi</p>
            <h4 className="text-xl font-bold">{totalVerified} <span className="text-xs font-normal text-gray-400">File</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-b-4 border-b-amber-500">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Menunggu</p>
            <h4 className="text-xl font-bold">{totalPending} <span className="text-xs font-normal text-gray-400">File</span></h4>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg w-full md:w-96">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama dokumen atau komisi..."
              className="bg-transparent outline-none text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
              <option>Semua Kategori</option>
              <option>Liturgi</option>
              <option>Pembangunan</option>
              <option>Sosial</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} /> Filter
            </Button>
          </div>
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
            <div className="bg-slate-50 p-4 rounded-lg">
              <h5 className="font-bold text-sm text-slate-700 mb-2">Detail Dokumen</h5>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <span className="text-gray-500">ID Dokumen</span>
                <span className="font-bold text-slate-700">{selectedDoc.id}</span>
                <span className="text-gray-500">Kategori</span>
                <span className="font-bold text-slate-700">{selectedDoc.category}</span>
                <span className="text-gray-500">Nilai Transaksi</span>
                <span className="font-bold text-emerald-600">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedDoc.amount)}
                </span>
                <span className="text-gray-500">Status</span>
                <span className={`font-bold ${selectedDoc.status === 'Verified' ? 'text-emerald-600' : selectedDoc.status === 'Pending' ? 'text-amber-500' : 'text-rose-500'}`}>
                  {selectedDoc.status}
                </span>
              </div>
            </div>
            
            {/* Action buttons (only show verify if status is Pending and user is BENDAHARA/SUPER_ADMIN) */}
            {selectedDoc.status === 'Pending' && (user?.role === 'BENDAHARA' || user?.role === 'SUPER_ADMIN') && (
              <div className="flex gap-2">
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
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-100"
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