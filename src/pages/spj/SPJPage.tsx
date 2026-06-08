import React, { useState } from 'react';
import { Search, Filter, UploadCloud, FolderOpen, ShieldCheck, Clock, FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SPJCard } from '../../components/spj/SPJCard';
import { Modal } from '../../components/ui/Modal';
import { MOCK_SPJ } from '../../mock/spjData';
import type { SPJDocument } from '../../mock/spjData';

const SPJPage = () => {
  const [selectedDoc, setSelectedDoc] = useState<SPJDocument | null>(null);
  const [search, setSearch] = useState('');

  const filteredDocs = MOCK_SPJ.filter(doc =>
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
        <Button className="flex items-center gap-2">
          <UploadCloud size={18} /> Upload Dokumen
        </Button>
      </div>

      {/* Stats Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 border-b-4 border-b-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FolderOpen size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Total Arsip</p>
            <h4 className="text-xl font-bold">1,248 <span className="text-xs font-normal text-gray-400">File</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-b-4 border-b-emerald-500">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Terverifikasi</p>
            <h4 className="text-xl font-bold">1,102 <span className="text-xs font-normal text-gray-400">File</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-b-4 border-b-amber-500">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Menunggu</p>
            <h4 className="text-xl font-bold">146 <span className="text-xs font-normal text-gray-400">File</span></h4>
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

      {/* Preview Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={`Preview: ${selectedDoc?.title}`}
      >
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden">
            {selectedDoc?.thumbnail ? (
              <img src={selectedDoc.thumbnail} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center p-8">
                <FileText size={64} className="text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-500 font-medium">Dokumen PDF tidak dapat dipreview secara langsung di mockup.</p>
                <Button variant="outline" className="mt-4 text-xs">Download File</Button>
              </div>
            )}
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h5 className="font-bold text-sm text-slate-700 mb-2">Detail Dokumen</h5>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-gray-500">ID Dokumen</span>
              <span className="font-bold text-slate-700">{selectedDoc?.id}</span>
              <span className="text-gray-500">Kategori</span>
              <span className="font-bold text-slate-700">{selectedDoc?.category}</span>
              <span className="text-gray-500">Nilai Transaksi</span>
              <span className="font-bold text-emerald-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedDoc?.amount || 0)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setSelectedDoc(null)}>Tutup</Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">Verifikasi Sekarang</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SPJPage;