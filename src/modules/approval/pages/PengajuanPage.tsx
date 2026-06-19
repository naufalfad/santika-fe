import { useState, useMemo } from 'react';
import {
  Plus, FileText, Clock,
  AlertCircle, ArrowLeft, Wallet, ShieldCheck,
  Search, Filter, Calendar, MapPin, Users, Trash2, Paperclip, Download, CheckCircle2
} from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import { CurrencyInput } from '../../../shared/components/ui/CurrencyInput';
import {
  useKegiatanQuery,
  useKegiatanByIdQuery,
  useCreateKegiatanMutation,
} from '../hooks/useApprovalQuery';
import { useKomisiQuery } from '../../anggaran/hooks/useAnggaranQuery';
import { formatIDR } from '../../../shared/utils/formatter';
import { cn } from '../../../shared/utils/cn';

const PengajuanPage = () => {
  // 1. Fetch live activities & commissions
  const { data: kegiatanList = [], isLoading: isKegiatanLoading } = useKegiatanQuery();
  const { data: komisiList = [] } = useKomisiQuery();
  const createKegiatanMutation = useCreateKegiatanMutation();

  // Selected Activity ID
  const [selectedId, setSelectedId] = useState<string>('');
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [isKegiatanModalOpen, setIsKegiatanModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch detailed info of active kegiatan
  const { data: kegiatanDetail, isLoading: isDetailLoading } = useKegiatanByIdQuery(selectedId);

  // Form State - Pengajuan Kegiatan
  const [formNama, setFormNama] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formTujuan, setFormTujuan] = useState('');
  const [formKategori, setFormKategori] = useState('OMK');
  const [formKomisiId, setFormKomisiId] = useState('');
  const [formLokasi, setFormLokasi] = useState('');
  const [formTglMulai, setFormTglMulai] = useState('');
  const [formTglSelesai, setFormTglSelesai] = useState('');
  const [formPeserta, setFormPeserta] = useState(0);
  const [formPrioritas, setFormPrioritas] = useState('SEDANG');
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [formTotalAnggaran, setFormTotalAnggaran] = useState<number | undefined>(undefined);
  const [kegiatanError, setKegiatanError] = useState('');

  // Filter and search activities
  const filteredKegiatan = useMemo(() => {
    return kegiatanList.filter((k) => {
      const matchesSearch = k.namaKegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.nomorKegiatan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || k.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [kegiatanList, searchQuery, statusFilter]);

  // Set the first item as default selection if none selected
  const activeKegiatan = useMemo(() => {
    const found = kegiatanList.find((k) => k.id === selectedId);
    return found || filteredKegiatan[0] || null;
  }, [selectedId, kegiatanList, filteredKegiatan]);

  // Trigger loading detailed info when active selection shifts
  useMemo(() => {
    if (activeKegiatan && activeKegiatan.id !== selectedId) {
      setSelectedId(activeKegiatan.id);
    }
  }, [activeKegiatan, selectedId]);

  // Dynamic calculations for stats metrics (Pemohon view)
  const metrics = useMemo(() => {
    return {
      totalSubmitted: kegiatanList.length,
      totalApproved: kegiatanList.filter((k) => k.status === 'DISETUJUI').length,
      totalPending: kegiatanList.filter((k) => k.status === 'DIAJUKAN' || k.status === 'DIREVIEW').length,
      totalRejected: kegiatanList.filter((k) => k.status === 'DITOLAK').length
    };
  }, [kegiatanList]);

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormFiles(Array.from(e.target.files));
    }
  };

  // Submit new Activity Proposal
  const handleCreateKegiatan = async (e: React.FormEvent) => {
    e.preventDefault();
    setKegiatanError('');

    if (!formNama || !formDeskripsi || !formTujuan || !formKomisiId || !formLokasi || !formTglMulai || !formTglSelesai) {
      setKegiatanError('Mohon isi semua field wajib.');
      return;
    }

    try {
      await createKegiatanMutation.mutateAsync({
        namaKegiatan: formNama,
        deskripsiKegiatan: formDeskripsi,
        tujuanKegiatan: formTujuan,
        kategoriKegiatan: formKategori,
        komisiId: formKomisiId,
        lokasi: formLokasi,
        tanggalMulai: formTglMulai,
        tanggalSelesai: formTglSelesai,
        jumlahPeserta: Number(formPeserta),
        prioritas: formPrioritas,
        status: 'DIAJUKAN',
        files: formFiles,
        totalAnggaran: formTotalAnggaran ?? undefined
      });

      // Clear Form & Close
      setFormNama('');
      setFormDeskripsi('');
      setFormTujuan('');
      setFormLokasi('');
      setFormTglMulai('');
      setFormTglSelesai('');
      setFormPeserta(0);
      setFormTotalAnggaran(undefined);
      setFormFiles([]);
      setIsKegiatanModalOpen(false);
    } catch (err: any) {
      setKegiatanError(err.response?.data?.message || 'Gagal menyimpan pengajuan kegiatan.');
    }
  };

  // Status badges formatter
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge className="text-slate-800 border-slate-200 text-[10px] px-2 py-0.5 font-medium">Draft</Badge>;
      case 'DIAJUKAN':
        return <Badge className="text-blue-800 border-blue-200 text-[10px] px-2 py-0.5 font-medium">Diajukan</Badge>;
      case 'DIREVIEW':
      case 'DIREVIEW_BENDAHARA':
        return <Badge className="text-amber-800 border-amber-200 text-[10px] px-2 py-0.5 font-medium">Direview</Badge>;
      case 'MENUNGGU_PERSETUJUAN':
        return <Badge className="text-cyan-800 border-cyan-200 text-[10px] px-2 py-0.5 font-medium">Menunggu Pastor</Badge>;
      case 'DISETUJUI':
        return <Badge variant="success" className="text-[10px] px-2 py-0.5 font-medium">Disetujui</Badge>;
      case 'DITOLAK':
        return <Badge variant="danger" className="text-[10px] px-2 py-0.5 font-medium">Ditolak</Badge>;
      case 'DICAIRKAN':
        return <Badge className="text-indigo-800 border-indigo-200 text-[10px] px-2 py-0.5 font-medium">Dicairkan</Badge>;
      case 'SELESAI':
        return <Badge variant="success" className="text-emerald-800 border-emerald-250 text-[10px] px-2 py-0.5 font-medium">Selesai</Badge>;
      default:
        return <Badge className="text-[10px] px-2 py-0.5 font-medium">{status}</Badge>;
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'RENDAH': return <Badge className="text-slate-600 border-slate-200 text-[9px] px-1.5 py-0">Rendah</Badge>;
      case 'SEDANG': return <Badge className="text-blue-600 border-blue-250 text-[9px] px-1.5 py-0">Sedang</Badge>;
      case 'TINGGI': return <Badge className="text-amber-600 border-amber-250 text-[9px] px-1.5 py-0">Tinggi</Badge>;
      case 'DARURAT': return <Badge className="text-rose-600 border-rose-250 text-[9px] px-1.5 py-0">Darurat</Badge>;
      default: return null;
    }
  };

  const isPageLoading = isKegiatanLoading;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-medium text-slate-800 tracking-tight">Pengajuan Kegiatan & Anggaran</h2>
          <p className="text-sm text-gray-500">Kelola dan rencanakan kebutuhan administrasi & keuangan program komisi paroki.</p>
        </div>
        <Button
          onClick={() => setIsKegiatanModalOpen(true)}
          className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 shadow-sm rounded-none"
        >
          <Plus size={16} /> Ajukan Kegiatan Baru
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5 border border-slate-200 shadow-sm bg-white">
          <div className="text-blue-600"><FileText size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Total Kegiatan</p>
            <h4 className="text-xl font-semibold text-slate-800 mt-0.5">{metrics.totalSubmitted} <span className="text-xs font-normal text-slate-400">Proposal</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3.5 border border-slate-200 shadow-sm bg-white">
          <div className="text-emerald-600"><CheckCircle2 size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Kegiatan Disetujui</p>
            <h4 className="text-xl font-semibold text-slate-800 mt-0.5">{metrics.totalApproved} <span className="text-xs font-normal text-slate-400">Kegiatan</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3.5 border border-slate-200 shadow-sm bg-white">
          <div className="text-amber-600"><Clock size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Menunggu Review</p>
            <h4 className="text-xl font-semibold text-slate-800 mt-0.5">{metrics.totalPending} <span className="text-xs font-normal text-slate-400">Proses</span></h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3.5 border border-slate-200 shadow-sm bg-white">
          <div className="text-rose-600"><AlertCircle size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold">Ditolak</p>
            <h4 className="text-xl font-semibold text-slate-800 mt-0.5">{metrics.totalRejected} <span className="text-xs font-normal text-slate-400">Kegiatan</span></h4>
          </div>
        </Card>
      </div>

      {/* Toolbar Filter */}
      <Card className="p-3 bg-white border border-slate-200 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-none w-full md:w-96">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari kegiatan..."
            className="bg-transparent text-xs outline-none w-full font-medium text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-none px-3 py-1.5 text-xs font-medium outline-none text-slate-600 cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="DIAJUKAN">Diajukan</option>
            <option value="DIREVIEW">Direview</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
          <Button variant="outline" className="flex items-center gap-1.5 text-xs border-slate-200 bg-white" disabled>
            <Filter size={14} /> Filter
          </Button>
        </div>
      </Card>

      {/* Main Split Grid Layout */}
      {isPageLoading ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-none shadow-sm flex items-center justify-center gap-3 font-semibold text-sm">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
          Memuat data...
        </div>
      ) : kegiatanList.length === 0 ? (
        <div className="p-16 text-center text-slate-450 bg-white rounded-none shadow-sm font-semibold text-sm">
          Belum ada data kegiatan. Klik "Ajukan Kegiatan Baru" untuk memulai.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Activity List */}
          <div className={cn(
            "lg:col-span-4 space-y-4",
            showMobileDetail ? "hidden lg:block" : "block"
          )}>
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[11px] font-semibold text-slate-400">Daftar Kegiatan</h3>
              <span className="text-[10px] text-slate-400">{filteredKegiatan.length} Ditemukan</span>
            </div>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {filteredKegiatan.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 border-l-4",
                      isSelected
                        ? "border-l-blue-600 bg-blue-50/15 shadow-md ring-1 ring-blue-100/70"
                        : "border-l-transparent hover:bg-white hover:shadow-sm"
                    )}
                    onClick={() => {
                      setSelectedId(item.id);
                      setShowMobileDetail(true);
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="text-blue-600 h-fit">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-800 leading-snug truncate">{item.namaKegiatan}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-slate-400 font-mono">{item.nomorKegiatan}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[9px] text-slate-500 font-medium">{item.kategoriKegiatan}</span>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Calendar size={12} />
                            <span>
                              {new Date(item.tanggalMulai).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {getPriorityBadge(item.prioritas)}
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Detail View */}
          <div className={cn(
            "lg:col-span-8",
            !showMobileDetail ? "hidden lg:block" : "block"
          )}>
            <button
              onClick={() => setShowMobileDetail(false)}
              className="lg:hidden flex items-center gap-2 text-blue-600 font-medium text-sm mb-4"
            >
              <ArrowLeft size={18} /> Kembali ke Daftar
            </button>

            {selectedId && isDetailLoading ? (
              <Card className="p-16 text-center text-slate-500 bg-white rounded-none flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
                Memuat detail kegiatan...
              </Card>
            ) : kegiatanDetail ? (
              <div className="space-y-6">
                {/* 1. Kegiatan Detail Card */}
                <Card className="overflow-hidden border border-slate-200 shadow-md bg-white rounded-none p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 text-blue-800 text-[10px] font-medium rounded-none">
                          {kegiatanDetail.kategoriKegiatan}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{kegiatanDetail.nomorKegiatan}</span>
                        {getPriorityBadge(kegiatanDetail.prioritas)}
                      </div>
                      <h3 className="text-xl font-medium text-slate-800 leading-tight">{kegiatanDetail.namaKegiatan}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                        <div>
                          Pemohon: <span className="font-semibold text-slate-700">{kegiatanDetail.pemohon.name}</span> <span className="text-[10px] text-slate-400">({kegiatanDetail.komisi?.nama})</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(kegiatanDetail.status)}
                    </div>
                  </div>

                  {/* Core details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 py-4 bg-slate-50 rounded-none px-4">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <Calendar size={16} className="text-blue-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium">Waktu Pelaksanaan</p>
                        <p className="font-medium text-slate-700 mt-0.5">
                          {new Date(kegiatanDetail.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <MapPin size={16} className="text-rose-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium">Lokasi Kegiatan</p>
                        <p className="font-medium text-slate-700 mt-0.5">{kegiatanDetail.lokasi}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <Users size={16} className="text-emerald-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium">Estimasi Peserta</p>
                        <p className="font-medium text-slate-700 mt-0.5">{kegiatanDetail.jumlahPeserta} Orang</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* Deskripsi */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-medium text-slate-800 border-b pb-1.5">Deskripsi Kegiatan</h4>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-none whitespace-pre-line font-medium min-h-[100px]">
                        {kegiatanDetail.deskripsiKegiatan}
                      </p>
                    </div>
                    {/* Tujuan */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-medium text-slate-800 border-b pb-1.5">Tujuan & Output</h4>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-none whitespace-pre-line font-medium min-h-[100px]">
                        {kegiatanDetail.tujuanKegiatan}
                      </p>
                    </div>
                  </div>

                  {/* Lampiran Dokumen */}
                  {kegiatanDetail.dokumen && kegiatanDetail.dokumen.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-xs font-medium text-slate-800 border-b pb-1.5">Dokumen Pendukung</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {kegiatanDetail.dokumen.map((doc) => (
                          <div key={doc.id} className="p-3 border border-slate-200 rounded-none bg-white flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <Paperclip size={14} className="text-blue-500 shrink-0" />
                              <span className="font-semibold text-slate-700 truncate">{doc.namaDokumen}</span>
                            </div>
                            <a
                              href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${doc.pathFile}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 p-1.5 bg-blue-50 rounded-none"
                              title="Download File"
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* History Review logs */}
                  {kegiatanDetail.approvals && kegiatanDetail.approvals.length > 0 && (
                    <div className="mt-8 space-y-3">
                      <h4 className="text-xs font-medium text-slate-800 border-b pb-1.5 font-semibold">Riwayat Review Kegiatan</h4>
                      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                        {kegiatanDetail.approvals.map((a, idx) => (
                          <div key={idx} className="relative text-xs">
                            <div className="absolute -left-[22px] top-0.5 w-3 h-3 rounded-none border-2 border-white bg-blue-500"></div>
                            <div className="flex justify-between gap-4">
                              <div>
                                <p className="font-medium text-slate-800">{a.step}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Oleh: {a.pic.name} ({a.pic.role.replace('_', ' ')})</p>
                                {a.catatan && (
                                  <p className="text-[10px] text-slate-600 rounded-none p-2 mt-1">
                                    "{a.catatan}"
                                  </p>
                                )}
                              </div>
                              <span className="text-[9px] font-semibold text-slate-400">{new Date(a.tanggal).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* 2. RAB / Permohonan Anggaran Section */}
                <Card className="border border-slate-200 shadow-md bg-white rounded-none p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-md font-medium text-slate-800 flex items-center gap-2">
                      <Wallet size={18} className="text-emerald-500" />
                      Permohonan Anggaran (RAB)
                    </h3>
                  </div>

                  {kegiatanDetail.anggaran.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-medium text-xs">
                      Kegiatan ini tidak mengajukan anggaran belanja paroki.
                    </div>
                  ) : (
                    kegiatanDetail.anggaran.map((anggaran: any) => (
                      <div key={anggaran.id} className="space-y-4 border border-slate-150 rounded-none p-4 md:p-6 bg-slate-50/20">
                        {/* RAB Header status info */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400">{anggaran.nomorPermohonan}</span>
                            <h4 className="text-sm font-medium text-slate-700 mt-0.5">
                              Estimasi Biaya: <span className="text-blue-700">{formatIDR(anggaran.estimasiBiaya)}</span>
                            </h4>
                            {anggaran.posDana && (
                              <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                                <ShieldCheck size={12} /> Pos Dana: {anggaran.posDana.name}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            {getStatusBadge(anggaran.status)}
                            {anggaran.status === 'DISETUJUI' && (
                              <span className="text-[11px] font-medium text-slate-600">
                                Disetujui: <strong className="text-emerald-700">{formatIDR(anggaran.jumlahDisetujui)}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* RAB item table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-medium text-slate-600 border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 text-[10px]">
                                <th className="py-2">Uraian</th>
                                <th className="py-2 text-center">Qty</th>
                                <th className="py-2">Satuan</th>
                                <th className="py-2 text-right">Harga Satuan</th>
                                <th className="py-2 text-right">Subtotal</th>
                                <th className="py-2 pl-4">Keterangan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {anggaran.details.map((row: any) => (
                                <tr key={row.id} className="border-b border-slate-150">
                                  <td className="py-2.5 font-medium text-slate-800">{row.uraian}</td>
                                  <td className="py-2.5 text-center">{row.qty}</td>
                                  <td className="py-2.5">{row.satuan}</td>
                                  <td className="py-2.5 text-right">{formatIDR(row.hargaSatuan)}</td>
                                  <td className="py-2.5 text-right font-semibold text-slate-800">{formatIDR(row.subtotal)}</td>
                                  <td className="py-2.5 pl-4 text-slate-400 text-[11px]">{row.keterangan || '-'}</td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={4} className="py-3 text-right font-medium text-slate-500 text-[10px]">Total Kebutuhan:</td>
                                <td className="py-3 text-right font-semibold text-blue-700 text-sm">{formatIDR(anggaran.estimasiBiaya)}</td>
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Budget review history logs */}
                        {anggaran.approvals && anggaran.approvals.length > 0 && (
                          <div className="mt-4 pt-4 border-t space-y-2.5">
                            <p className="text-[10px] font-medium text-slate-400">Langkah Persetujuan Anggaran</p>
                            <div className="relative pl-6 space-y-3 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-150">
                              {anggaran.approvals.map((al: any, alIdx: number) => (
                                <div key={alIdx} className="text-[11px] relative">
                                  <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-none bg-emerald-500 border border-white"></div>
                                  <div className="flex justify-between gap-4">
                                    <div>
                                      <span className="font-medium text-slate-700">{al.step}</span>
                                      <span className="text-slate-400 ml-1">({al.pic.name} - {al.pic.role.replace('_', ' ')})</span>
                                      {al.catatan && <p className="text-[10px] text-slate-500 mt-0.5 bg-white p-1 rounded-none">"{al.catatan}"</p>}
                                    </div>
                                    <span className="text-[9px] text-slate-455">{new Date(al.tanggal).toLocaleDateString('id-ID')}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </Card>
              </div>
            ) : (
              <Card className="p-10 text-center text-slate-500 bg-white rounded-none">
                Silakan pilih salah satu kegiatan dari daftar di sebelah kiri untuk melihat rincian alur persetujuan.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* MODAL: AJUKAN KEGIATAN BARU */}
      <Modal
        isOpen={isKegiatanModalOpen}
        onClose={() => {
          setIsKegiatanModalOpen(false);
          setKegiatanError('');
        }}
        title="Formulir Pengajuan Kegiatan Paroki"
      >
        <form onSubmit={handleCreateKegiatan} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
          {kegiatanError && (
            <div className="p-3 text-rose-700 text-xs font-medium rounded-none flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{kegiatanError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Kegiatan */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-700">Nama Kegiatan *</label>
              <input
                type="text"
                required
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="Contoh: Rekoleksi OMK Paroki 2026"
                className="w-full px-3 py-2 text-xs rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-semibold"
              />
            </div>

            {/* Komisi */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-700">Komisi / Unit Pengaju *</label>
              <select
                required
                value={formKomisiId}
                onChange={(e) => setFormKomisiId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-semibold cursor-pointer text-slate-700"
              >
                <option value="">Pilih Komisi...</option>
                {komisiList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Kategori */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-700">Kategori Kegiatan *</label>
              <select
                value={formKategori}
                onChange={(e) => setFormKategori(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-semibold cursor-pointer text-slate-700"
              >
                {['OMK', 'LITURGI', 'SOSIAL', 'PENDIDIKAN', 'PASTORAL', 'LINGKUNGAN', 'PEMELIHARAAN', 'OPERASIONAL', 'LAINNYA'].map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Prioritas */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-700">Skala Prioritas *</label>
              <select
                value={formPrioritas}
                onChange={(e) => setFormPrioritas(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-semibold cursor-pointer text-slate-700"
              >
                {['RENDAH', 'SEDANG', 'TINGGI', 'DARURAT'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Jumlah Peserta */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-700">Jumlah Peserta Estimasi</label>
              <input
                type="number"
                min={0}
                value={formPeserta || ''}
                onChange={(e) => setFormPeserta(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-xs rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lokasi */}
            <div className="space-y-1 md:col-span-1">
              <label className="block text-[10px] font-semibold text-slate-700">Lokasi / Tempat *</label>
              <input
                type="text"
                required
                value={formLokasi}
                onChange={(e) => setFormLokasi(e.target.value)}
                placeholder="Contoh: Gedung Aula Paroki"
                className="w-full px-3 py-2 text-xs rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-semibold"
              />
            </div>

            {/* Tanggal Mulai */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-700">Tanggal Mulai *</label>
              <input
                type="date"
                required
                value={formTglMulai}
                onChange={(e) => setFormTglMulai(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-semibold text-slate-700"
              />
            </div>

            {/* Tanggal Selesai */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-700">Tanggal Selesai *</label>
              <input
                type="date"
                required
                value={formTglSelesai}
                onChange={(e) => setFormTglSelesai(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-semibold text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Total Anggaran */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-700">Total Anggaran yang Diajukan (Rp)</label>
              <CurrencyInput
                value={formTotalAnggaran}
                onChange={(val) => setFormTotalAnggaran(val)}
                placeholder="Contoh: 5.000.000"
                className="text-xs bg-slate-50 font-semibold"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1">
            <label className="block text-[10px] font-semibold text-slate-700">Deskripsi Penjelasan Kegiatan *</label>
            <textarea
              rows={3}
              required
              value={formDeskripsi}
              onChange={(e) => setFormDeskripsi(e.target.value)}
              placeholder="Deskripsikan latar belakang dan rencana pelaksanaan kegiatan secara ringkas..."
              className="w-full p-3 rounded-none text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all resize-none font-medium text-slate-700"
            />
          </div>

          {/* Tujuan */}
          <div className="space-y-1">
            <label className="block text-[10px] font-semibold text-slate-700">Tujuan & Output Kegiatan *</label>
            <textarea
              rows={2}
              required
              value={formTujuan}
              onChange={(e) => setFormTujuan(e.target.value)}
              placeholder="Tuliskan sasaran atau output konkret yang ingin dicapai..."
              className="w-full p-3 rounded-none text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all resize-none font-medium text-slate-700"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-slate-700">Dokumen Pendukung (Proposal/Surat/Jadwal)</label>
            <div className="p-4 border border-dashed border-slate-300 bg-slate-50/50 rounded-none text-center">
              <input
                type="file"
                multiple
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Paperclip size={24} className="text-slate-400 animate-bounce" />
                <span className="text-xs font-medium text-blue-600 hover:underline">Pilih file untuk diupload</span>
                <span className="text-[10px] text-slate-455 font-medium">Mendukung PDF, Word, Excel, Gambar (Max 10 file)</span>
              </label>
            </div>
            {formFiles.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {formFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border border-slate-200 rounded-none text-xs bg-white">
                    <span className="truncate font-semibold text-slate-700 max-w-[85%]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFormFiles(formFiles.filter((_, i) => i !== idx))}
                      className="text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsKegiatanModalOpen(false)}
              className="flex-1 py-3 text-xs font-medium rounded-none"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createKegiatanMutation.isPending}
              className="flex-1 py-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-200 rounded-none flex items-center justify-center gap-1.5 transition-all"
            >
              {createKegiatanMutation.isPending ? 'Mengirim...' : 'Kirim Pengajuan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PengajuanPage;
