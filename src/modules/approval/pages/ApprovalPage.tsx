import { useMemo, useState } from 'react';
import {
  CheckCircle2, XCircle, Users, FileText, ShieldCheck,
  ArrowLeft, Calendar, MapPin, Paperclip, Download, Inbox
} from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Modal } from '../../../shared/components/ui/Modal';
import { CurrencyInput } from '../../../shared/components/ui/CurrencyInput';
import { useAuthStore } from '../../../app/store/useAuthStore';
import {
  useKegiatanQuery,
  useUpdateKegiatanStatusMutation,
  usePermohonanAnggaranQuery,
  useFundCategoriesQuery
} from '../hooks/useApprovalQuery';
import { useAnggaranQuery } from '../../anggaran/hooks/useAnggaranQuery';
import { cn } from '../../../shared/utils/cn';
import { formatIDR } from '../../../shared/utils/formatter';

const ApprovalPage = () => {
  const user = useAuthStore((state) => state.user);

  // 1. Fetch data
  const { data: kegiatanList = [], isLoading: isKegiatanLoading } = useKegiatanQuery();
  const { data: anggaranList = [] } = usePermohonanAnggaranQuery();
  const { data: fundCategories = [] } = useFundCategoriesQuery();
  const { data: budgets = [] } = useAnggaranQuery();

  const updateKegiatanStatus = useUpdateKegiatanStatusMutation();


  // Navigation states
  const [activeModule] = useState<'kegiatan' | 'anggaran'>('kegiatan');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<string>('');
  const [selectedAnggaranId, setSelectedAnggaranId] = useState<string>('');
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Modal actions states
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'REVIEW' | 'APPROVE' | 'REJECT' | 'REVISE' | null>(null);
  const [reviewCatatan, setReviewCatatan] = useState('');

  // Bendahara Anggaran Review Modal State
  const [selectedPosDana, setSelectedPosDana] = useState('');
  const [approvedAmount, setApprovedAmount] = useState<number>(0);

  // Filter lists based on Tab and Role
  const filteredKegiatans = useMemo(() => {
    return kegiatanList.filter((item) => {
      if (activeTab === 'approved') return item.status === 'DISETUJUI';
      if (activeTab === 'rejected') return item.status === 'DITOLAK';

      // Tab 'pending' depends on user role
      if (user?.role === 'PASTOR') {
        return item.status === 'DIREVIEW';
      }
      if (user?.role === 'BENDAHARA') {
        return item.status === 'DIAJUKAN';
      }
      // Super admin sees both
      return item.status === 'DIAJUKAN' || item.status === 'DIREVIEW';
    });
  }, [kegiatanList, activeTab, user]);

  const filteredAnggarans = useMemo(() => {
    return anggaranList.filter((item) => {
      if (activeTab === 'approved') return item.status === 'DISETUJUI' || item.status === 'DICAIRKAN' || item.status === 'SELESAI';
      if (activeTab === 'rejected') return item.status === 'DITOLAK';

      // Tab 'pending' depends on user role
      if (user?.role === 'PASTOR') {
        return item.status === 'MENUNGGU_PERSETUJUAN';
      }
      if (user?.role === 'BENDAHARA') {
        return item.status === 'DIAJUKAN';
      }
      // Super admin sees both
      return item.status === 'DIAJUKAN' || item.status === 'MENUNGGU_PERSETUJUAN';
    });
  }, [anggaranList, activeTab, user]);

  // Selected details
  const selectedKegiatan = useMemo(() => {
    const found = kegiatanList.find((k) => k.id === selectedKegiatanId);
    return found || filteredKegiatans[0] || null;
  }, [selectedKegiatanId, kegiatanList, filteredKegiatans]);

  const selectedAnggaran = useMemo(() => {
    const found = anggaranList.find((a) => a.id === selectedAnggaranId);
    return found || filteredAnggarans[0] || null;
  }, [selectedAnggaranId, anggaranList, filteredAnggarans]);

  // Adjust selection when active selection shifts
  useMemo(() => {
    if (selectedKegiatan && selectedKegiatan.id !== selectedKegiatanId) {
      setSelectedKegiatanId(selectedKegiatan.id);
    }
  }, [selectedKegiatan, selectedKegiatanId]);

  useMemo(() => {
    if (selectedAnggaran && selectedAnggaran.id !== selectedAnggaranId) {
      setSelectedAnggaranId(selectedAnggaran.id);
      // Pre-fill Bendahara inputs
      setSelectedPosDana(selectedAnggaran.posDanaId || '');
      setApprovedAmount(Number(selectedAnggaran.jumlahDiajukan));
    }
  }, [selectedAnggaran, selectedAnggaranId]);

  // Filter budget items dynamically based on selectedPosDana for Bendahara review
  const budgetItemsForReview = useMemo(() => {
    if (!selectedPosDana) return [];
    const matchingBudgets = budgets.filter((b) => b.fundCategoryId === selectedPosDana);
    return matchingBudgets.flatMap((b) => b.items);
  }, [budgets, selectedPosDana]);

  // Pending count badges
  // Action clicks handler
  const handleActionClick = (type: 'REVIEW' | 'APPROVE' | 'REJECT' | 'REVISE') => {
    setActionType(type);
    setReviewCatatan('');
    if (type === 'REVIEW' && selectedKegiatan) {
      const budget = selectedKegiatan.anggaran?.[0];
      setSelectedPosDana(budget?.posDanaId || '');
      setApprovedAmount(Number(budget?.estimasiBiaya || 0));
    }
    setIsActionModalOpen(true);
  };

  // Confirm simple action (approve/reject activities)
  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionType) return;

    if (selectedKegiatan) {
      try {
        await updateKegiatanStatus.mutateAsync({
          id: selectedKegiatan.id,
          action: actionType as 'REVIEW' | 'APPROVE' | 'REJECT',
          catatan: reviewCatatan,
          totalAnggaran: actionType === 'REVIEW' && selectedKegiatan.anggaran?.[0] ? approvedAmount : undefined,
          posDanaId: actionType === 'REVIEW' && selectedKegiatan.anggaran?.[0] ? selectedPosDana : undefined
        });
        setIsActionModalOpen(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge className="text-slate-800 text-[10px] px-2 py-0.5 font-medium">Draft</Badge>;
      case 'DIAJUKAN': return <Badge className="text-blue-800 text-[10px] px-2 py-0.5 font-medium">Diajukan</Badge>;
      case 'DIREVIEW':
      case 'DIREVIEW_BENDAHARA': return <Badge className="text-amber-800 text-[10px] px-2 py-0.5 font-medium">Direview</Badge>;
      case 'MENUNGGU_PERSETUJUAN': return <Badge className="text-cyan-800 text-[10px] px-2 py-0.5 font-medium font-semibold">Menunggu Pastor</Badge>;
      case 'DISETUJUI': return <Badge variant="success" className="text-[10px] px-2 py-0.5 font-medium">Disetujui</Badge>;
      case 'DITOLAK': return <Badge variant="danger" className="text-[10px] px-2 py-0.5 font-medium">Ditolak</Badge>;
      case 'DICAIRKAN': return <Badge className="text-indigo-800 text-[10px] px-2 py-0.5 font-medium">Dicairkan</Badge>;
      case 'SELESAI': return <Badge variant="success" className="text-emerald-800 border-emerald-250 text-[10px] px-2 py-0.5 font-medium">Selesai</Badge>;
      default: return <Badge className="text-[10px] px-2 py-0.5 font-medium">{status}</Badge>;
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

  const isModuleLoading = isKegiatanLoading;
  const currentFilteredList = filteredKegiatans;

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-medium text-slate-800 tracking-tight">Persetujuan & Peninjauan</h2>
          <p className="text-xs md:text-sm text-gray-500">Tinjau kegiatan dan rencana anggaran belanja paroki.</p>
        </div>
      </div>

      {/* SUB TAB FILTER */}
      <div className="flex gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1 text-xs md:text-sm font-medium text-gray-400">
        <button
          onClick={() => {
            setActiveTab('pending');
            setShowMobileDetail(false);
          }}
          className={cn(
            "pb-3 border-b-2 whitespace-nowrap transition-all duration-150",
            activeTab === 'pending' ? "border-blue-600 text-blue-600" : "border-transparent hover:text-slate-600"
          )}
        >
          Menunggu Review
        </button>
        <button
          onClick={() => {
            setActiveTab('approved');
            setShowMobileDetail(false);
          }}
          className={cn(
            "pb-3 border-b-2 whitespace-nowrap transition-all duration-150",
            activeTab === 'approved' ? "border-blue-600 text-blue-600" : "border-transparent hover:text-slate-600"
          )}
        >
          Disetujui
        </button>
        <button
          onClick={() => {
            setActiveTab('rejected');
            setShowMobileDetail(false);
          }}
          className={cn(
            "pb-3 border-b-2 whitespace-nowrap transition-all duration-150",
            activeTab === 'rejected' ? "border-blue-600 text-blue-600" : "border-transparent hover:text-slate-600"
          )}
        >
          Ditolak
        </button>
      </div>

      {isModuleLoading ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-none shadow-sm flex items-center justify-center gap-3 font-semibold text-sm">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
          Memuat daftar pengajuan...
        </div>
      ) : currentFilteredList.length === 0 ? (
        // UNIFIED EMPTY STATE: Pencegahan render grid ketika data kosong
        <Card className="p-16 flex flex-col items-center justify-center text-center border-slate-200 shadow-sm rounded-none">
          <div className="mb-4 bg-slate-50 p-4 border border-slate-100 rounded-none text-slate-400">
            <Inbox size={32} />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Tidak Ada Antrean</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm">
            Tidak ada dokumen pengajuan atau kegiatan yang menunggu tinjauan pada kategori ini.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: LIST */}
          <div className={cn(
            "lg:col-span-4 space-y-4",
            showMobileDetail ? "hidden lg:block" : "block"
          )}>
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[11px] font-semibold text-slate-400">Daftar Antrean</h3>
              <span className="text-[10px] text-slate-400">{currentFilteredList.length} Ditemukan</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {currentFilteredList.map((item: any) => {
                const isSelected = selectedKegiatan?.id === item.id;
                const budgetInfo = item.anggaran?.[0];
                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 border-l",
                      isSelected
                        ? "border-l-transparent hover:bg-white hover:shadow-sm"
                        : "border-l-transparent hover:bg-white hover:shadow-sm"
                    )}
                    onClick={() => {
                      setSelectedKegiatanId(item.id);
                      setShowMobileDetail(true);
                    }}
                  >
                    <div className="flex gap-4">
                      <div className="text-indigo-600 h-fit">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-800 leading-snug truncate">
                          {item.namaKegiatan}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Komisi: {item.komisi?.nama}
                        </p>
                        {budgetInfo && (
                          <p className="text-[11px] text-emerald-650 font-medium mt-0.5">
                            Anggaran: {formatIDR(budgetInfo.estimasiBiaya)} ({budgetInfo.posDana?.name || 'Belum ada pos dana'})
                          </p>
                        )}

                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {item.nomorKegiatan}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAIL */}
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

            {/* A. KEGIATAN DETAIL PANEL */}
            {activeModule === 'kegiatan' && (
              selectedKegiatan ? (
                <Card className="overflow-hidden border border-slate-200 shadow-xl bg-white p-6 md:p-8 rounded-none space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 text-blue-800 text-[10px] font-medium rounded-none">
                          {selectedKegiatan.kategoriKegiatan}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{selectedKegiatan.nomorKegiatan}</span>
                        {getPriorityBadge(selectedKegiatan.prioritas)}
                      </div>
                      <h3 className="text-xl font-medium text-slate-800 leading-tight">{selectedKegiatan.namaKegiatan}</h3>
                      <p className="text-xs text-slate-500">
                        Pemohon: <span className="font-semibold text-slate-700">{selectedKegiatan.pemohon.name}</span> <span className="text-[10px] text-slate-400">({selectedKegiatan.komisi?.nama})</span>
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(selectedKegiatan.status)}
                    </div>
                  </div>

                  {/* Core details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 bg-slate-50 rounded-none px-4">
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <Calendar size={16} className="text-blue-500 animate-pulse" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium">Waktu Pelaksanaan</p>
                        <p className="font-medium text-slate-700 mt-0.5">
                          {new Date(selectedKegiatan.tanggalMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <MapPin size={16} className="text-rose-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium">Lokasi Kegiatan</p>
                        <p className="font-medium text-slate-700 mt-0.5">{selectedKegiatan.lokasi}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <Users size={16} className="text-emerald-500" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium">Estimasi Peserta</p>
                        <p className="font-medium text-slate-700 mt-0.5">{selectedKegiatan.jumlahPeserta} Orang</p>
                      </div>
                    </div>
                  </div>

                  {/* Anggaran Kegiatan Info Box */}
                  {selectedKegiatan.anggaran?.[0] && (
                    <div className="p-4 bg-emerald-50 rounded-none flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <p className="text-[10px] text-emerald-800 font-semibold">Anggaran Kegiatan Yang Diajukan</p>
                        <p className="text-lg font-semibold text-emerald-950 mt-1">{formatIDR(selectedKegiatan.anggaran[0].estimasiBiaya)}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-slate-500 font-medium">Pos Dana Sumber Pembiayaan</p>
                        <p className="text-xs font-medium text-slate-800 mt-1 flex items-center gap-1 sm:justify-end">
                          <ShieldCheck size={14} className="text-emerald-600 animate-pulse" />
                          {selectedKegiatan.anggaran[0].posDana?.name || 'Belum ditentukan'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-slate-800 border-b pb-1.5">Deskripsi</h4>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 border rounded-none whitespace-pre-line min-h-[100px]">
                        {selectedKegiatan.deskripsiKegiatan}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-slate-800 border-b pb-1.5">Tujuan & Output</h4>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 border rounded-none whitespace-pre-line min-h-[100px]">
                        {selectedKegiatan.tujuanKegiatan}
                      </p>
                    </div>
                  </div>

                  {/* lampiran */}
                  {selectedKegiatan.dokumen && selectedKegiatan.dokumen.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-medium text-slate-800 border-b pb-1.5">Dokumen Proposal Pendukung</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedKegiatan.dokumen.map((doc) => (
                          <div key={doc.id} className="p-3 border rounded-none bg-slate-50 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <Paperclip size={14} className="text-blue-500 shrink-0" />
                              <span className="font-semibold text-slate-700 truncate">{doc.namaDokumen}</span>
                            </div>
                            <a
                              href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${doc.pathFile}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-750 p-1 bg-white border rounded-none shadow-sm"
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* approvals log */}
                  {selectedKegiatan.approvals && selectedKegiatan.approvals.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="text-xs font-medium text-slate-800">Log Riwayat Alur Persetujuan</h4>
                      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                        {selectedKegiatan.approvals.map((a, idx) => (
                          <div key={idx} className="relative text-xs">
                            <div className="absolute -left-[22px] top-0.5 w-3 h-3 rounded-none border border-white bg-blue-600 shadow-sm"></div>
                            <div className="flex justify-between gap-4">
                              <div>
                                <p className="font-medium text-slate-800">{a.step}</p>
                                <p className="text-[10px] text-slate-400">Oleh: {a.pic.name} ({a.pic.role.replace('_', ' ')})</p>
                                {a.catatan && <p className="text-[10px] text-slate-500 p-1.5 rounded-none mt-1">"{a.catatan}"</p>}
                              </div>
                              <span className="text-[9px] font-semibold text-slate-400">{new Date(a.tanggal).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions buttons */}
                  {activeTab === 'pending' && (
                    <div className="flex gap-3 pt-6 border-t">
                      <Button
                        onClick={() => handleActionClick('REJECT')}
                        variant="outline"
                        className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-none py-6 font-medium flex justify-center items-center gap-2"
                      >
                        <XCircle size={18} /> Tolak Kegiatan
                      </Button>
                      <Button
                        onClick={() => handleActionClick(user?.role === 'BENDAHARA' ? 'REVIEW' : 'APPROVE')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none py-6 font-medium flex justify-center items-center gap-2 shadow-lg shadow-emerald-100"
                      >
                        <CheckCircle2 size={18} /> {user?.role === 'BENDAHARA' ? 'Review & Teruskan' : 'Setujui Kegiatan'}
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-8 text-center text-slate-500">
                  Tidak ada kegiatan yang dipilih.
                </Card>
              )
            )}
          </div>
        </div>
      )}

      {/* SIMPLE ACTION DIALOG MODAL (APPROVE/REJECT/REVISE) */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={
          actionType === 'REJECT' ? 'Tolak Pengajuan' :
            actionType === 'REVISE' ? 'Minta Perbaikan / Revisi' :
              'Konfirmasi Persetujuan'
        }
      >
        <form onSubmit={handleConfirmAction} className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Apakah Anda yakin ingin melakukan tindakan ini? Harap berikan catatan/alasan peninjauan di bawah.
          </p>

          {user?.role === 'BENDAHARA' && actionType === 'REVIEW' && selectedKegiatan?.anggaran?.[0] && (
            <div className="space-y-4 border border-slate-150 p-4 rounded-none bg-slate-50/50">
              <p className="text-xs font-medium text-slate-700">Penyesuaian Anggaran & Pos Dana</p>
              {/* Pos Dana Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-700">
                  Pos Dana Sumber Pembiayaan *
                </label>
                <select
                  required
                  value={selectedPosDana}
                  onChange={(e) => setSelectedPosDana(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all font-semibold cursor-pointer text-slate-700"
                >
                  <option value="">Pilih Pos Dana...</option>
                  {fundCategories.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      [{fund.code}] {fund.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Budget Items available for selected Pos Dana */}
              {selectedPosDana && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-500">
                    Referensi Plafon Anggaran Tersedia ({new Date().getFullYear()})
                  </label>
                  <div className="rounded-none p-3 bg-white space-y-2 max-h-[150px] overflow-y-auto shadow-inner">
                    {budgetItemsForReview.length === 0 ? (
                      <p className="text-[11px] text-slate-400 font-medium">
                        Tidak ada rincian anggaran tahunan untuk Pos Dana ini.
                      </p>
                    ) : (
                      budgetItemsForReview.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-[11px] border-b border-slate-50 pb-1.5 last:border-0 last:pb-0"
                        >
                          <span className="font-semibold text-slate-600 truncate max-w-[180px]" title={item.name}>
                            {item.name}
                          </span>
                          <div className="text-right">
                            <span className="font-medium text-slate-800">
                              Sisa: {formatIDR(item.sisa)}
                            </span>
                            <span className="text-[9px] text-slate-400 block">
                              Plafon: {formatIDR(item.plafon)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Approved Amount */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-700">
                  Jumlah Anggaran Disetujui (Rp) *
                </label>
                <CurrencyInput
                  value={approvedAmount || undefined}
                  onChange={(val) => setApprovedAmount(val ?? 0)}
                  placeholder="0"
                  className="text-xs bg-white font-semibold text-slate-800"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-semibold text-slate-700">
              Catatan Review {actionType === 'REJECT' || actionType === 'REVISE' ? '*' : '(Opsional)'}
            </label>
            <textarea
              rows={4}
              required={actionType === 'REJECT' || actionType === 'REVISE'}
              value={reviewCatatan}
              onChange={(e) => setReviewCatatan(e.target.value)}
              placeholder="Tuliskan alasan penolakan, instruksi revisi, atau catatan persetujuan Anda..."
              className="w-full p-3 border rounded-none text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all resize-none font-medium text-slate-700"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsActionModalOpen(false)} className="flex-1 py-3 text-xs font-medium rounded-none">
              Batal
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1 py-3 text-xs font-medium rounded-none text-white",
                actionType === 'REJECT' ? "bg-rose-600 hover:bg-rose-700" :
                  actionType === 'REVISE' ? "bg-amber-600 hover:bg-amber-700" :
                    "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              Konfirmasi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ApprovalPage;