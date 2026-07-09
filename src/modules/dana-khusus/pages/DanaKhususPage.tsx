import { useState, useMemo } from 'react';
import {
  History, Plus, Search,
  CheckCircle, Play, XCircle, Trash2, ArrowRightLeft, FileSpreadsheet, FileDown, Eye
} from 'lucide-react';
import { CurrencyInput } from '../../../shared/components/ui/CurrencyInput';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { Badge } from '../../../shared/components/ui/Badge';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import { formatIDR } from '../../../shared/utils/formatter';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { useFundCategoriesQuery } from '../../kas-masuk/hooks/useKasMasukQuery';
import {
  useSpecialFundsQuery,
  useCreateSpecialFundMutation,
  useActivateSpecialFundMutation,
  useCloseSpecialFundMutation,
  useDeleteSpecialFundMutation,
  useAllocateSpecialFundMutation,
  useSpecialFundTransactionsQuery,
  useSpecialFundReportQuery
} from '../hooks/useSpecialFundQuery';
// Removed unused SpecialFund import

const DanaKhususPage = () => {
  const { user } = useAuthStore();
  const isBendahara = user?.role === 'BENDAHARA' || user?.role === 'SUPER_ADMIN';

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'AKTIF' | 'DITUTUP'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Special Funds list
  const { data: specialFunds = [], isLoading } = useSpecialFundsQuery();
  // Fetch general Pos Dana categories for allocation dropdown
  const { data: fundCategories = [] } = useFundCategoriesQuery();

  // Mutations
  const createMutation = useCreateSpecialFundMutation();
  const activateMutation = useActivateSpecialFundMutation();
  const closeMutation = useCloseSpecialFundMutation();
  const deleteMutation = useDeleteSpecialFundMutation();
  const allocateMutation = useAllocateSpecialFundMutation();

  // Selected Program for Details
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);

  // Modal open states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);

  const activeDetail = useMemo(() => {
    return specialFunds.find(f => f.id === selectedFundId) || null;
  }, [specialFunds, selectedFundId]);

  const { data: reportData } = useSpecialFundReportQuery(selectedFundId || '');
  const { data: transactions = [], isLoading: isLoadingTx } = useSpecialFundTransactionsQuery(selectedFundId || '');

  // Allocation Form State
  const [targetPosDanaId, setTargetPosDanaId] = useState('');
  const [allocationAmount, setAllocationAmount] = useState<number | undefined>(undefined);
  const [allocationNotes, setAllocationNotes] = useState('');
  const [allocationError, setAllocationError] = useState<string | null>(null);

  // Controlled state untuk field targetNominal di form Buka Program
  const [targetNominalState, setTargetNominalState] = useState<number | undefined>(undefined);

  // Filtered listing
  const filteredFunds = useMemo(() => {
    return specialFunds.filter(fund => {
      const matchesSearch =
        fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fund.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || fund.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [specialFunds, searchTerm, statusFilter]);

  // Aggregate high-level stats from all special funds
  const stats = useMemo(() => {
    let totalCollected = 0;
    let totalSpent = 0;
    let totalBalance = 0;

    specialFunds.forEach(f => {
      totalCollected += Number(f.income || 0);
      totalSpent += Number(f.expense || 0);
      totalBalance += Number(f.balance || 0);
    });

    return { totalCollected, totalSpent, totalBalance };
  }, [specialFunds]);

  // Handle Create Program
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = (formData.get('code') as string).toUpperCase();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const tujuanPenggalangan = formData.get('tujuanPenggalangan') as string;
    const targetNominal = targetNominalState ?? 0;
    const tanggalMulai = formData.get('tanggalMulai') as string;
    const tanggalSelesai = formData.get('tanggalSelesai') as string;

    if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
      alert('Tanggal mulai tidak boleh melebihi tanggal selesai!');
      return;
    }

    try {
      await createMutation.mutateAsync({
        code,
        name,
        description,
        tujuanPenggalangan,
        targetNominal: targetNominal || undefined,
        tanggalMulai,
        tanggalSelesai,
      });
      setIsAddOpen(false);
      setTargetNominalState(undefined);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Gagal membuat program dana.');
    }
  };

  // Handle Allocation Submit
  const handleAllocateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAllocationError(null);

    if (!activeDetail) return;
    if (!targetPosDanaId) {
      setAllocationError('Pilih Pos Dana tujuan alokasi.');
      return;
    }
    const amountNum = Number(allocationAmount ?? 0);
    if (!amountNum || amountNum <= 0) {
      setAllocationError('Nominal alokasi harus lebih dari 0.');
      return;
    }
    if (amountNum > Number(activeDetail.balance)) {
      setAllocationError('Nominal alokasi melebihi sisa saldo Dana Khusus.');
      return;
    }

    try {
      await allocateMutation.mutateAsync({
        id: activeDetail.id,
        payload: {
          targetPosDanaId,
          nominal: amountNum,
          keterangan: allocationNotes,
        },
      });
      // Reset form
      setTargetPosDanaId('');
      setAllocationAmount(undefined);
      setAllocationNotes('');
      setIsAllocateOpen(false);
    } catch (err: any) {
      setAllocationError(err?.response?.data?.message || err?.message || 'Gagal memproses alokasi sisa dana.');
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin mengaktifkan program Dana Khusus ini?')) return;
    try {
      await activateMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Gagal mengaktifkan.');
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menutup program Dana Khusus ini? Setelah ditutup, dana tidak dapat menerima donasi atau membiayai pengeluaran baru.')) return;
    try {
      await closeMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Gagal menutup.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus program Dana Khusus Draft ini?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Gagal menghapus.');
    }
  };

  // Simulated CSV/Excel report generation
  const exportToCSV = (report: any) => {
    if (!report) return;
    const details = report.fundDetails;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `LAPORAN DANA KHUSUS\n`;
    csvContent += `Nama Program,${details.name}\n`;
    csvContent += `Kode,${details.code}\n`;
    csvContent += `Status,${details.status}\n`;
    csvContent += `Periode,${new Date(details.tanggalMulai).toLocaleDateString('id-ID')} s/d ${new Date(details.tanggalSelesai).toLocaleDateString('id-ID')}\n`;
    csvContent += `Target Nominal,Rp ${details.target}\n`;
    csvContent += `Total Donasi Terkumpul,Rp ${details.totalIncome}\n`;
    csvContent += `Total Belanja Terpakai,Rp ${details.totalExpense}\n`;
    csvContent += `Sisa Saldo,Rp ${details.balance}\n\n`;

    csvContent += `RIWAYAT TRANSAKSI\n`;
    csvContent += `No Transaksi,Tanggal,Tipe,Jumlah,Keterangan\n`;
    report.transactions.forEach((t: any) => {
      csvContent += `${t.no},${new Date(t.tanggal).toLocaleDateString('id-ID')},${t.tipe},${t.jumlah},"${t.keterangan}"\n`;
    });

    if (report.allocations.length > 0) {
      csvContent += `\nRIWAYAT ALOKASI SISA SALDO\n`;
      csvContent += `Tanggal,Nominal,Pos Dana Tujuan,Keterangan\n`;
      report.allocations.forEach((a: any) => {
        csvContent += `${new Date(a.tanggal).toLocaleDateString('id-ID')},${a.nominal},${a.targetPos},"${a.keterangan}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_dana_khusus_${details.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print for PDF
  const triggerPrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-medium text-slate-800 tracking-tight">Dana Khusus</h2>
          <p className="text-sm text-gray-500">Pengelolaan program donasi terikat dan dana pembangunan temporer.</p>
        </div>
        {isBendahara && (
          <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 shadow-none rounded-none w-full sm:w-auto justify-center">
            <Plus size={16} /> Buka Program Dana Baru
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-slate-200">
          <p className="text-[10px] text-slate-400 font-semibold">Total Donasi Masuk</p>
          <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">
            {isLoading ? '...' : formatIDR(stats.totalCollected)}
          </h4>
          <span className="text-[10px] text-slate-400 font-medium">Akumulasi donasi terkumpul</span>
        </Card>

        <Card className="p-4 border border-slate-200">
          <p className="text-[10px] text-slate-400 font-semibold">Total Pengeluaran Dana</p>
          <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">
            {isLoading ? '...' : formatIDR(stats.totalSpent)}
          </h4>
          <span className="text-[10px] text-slate-400 font-medium">Total belanja tersalurkan</span>
        </Card>

        <Card className="p-4 border border-slate-200">
          <p className="text-[10px] text-slate-400 font-semibold">Sisa Saldo Kas Aktif</p>
          <h4 className="text-lg font-semibold mt-1 text-slate-800 tracking-tight">
            {isLoading ? '...' : formatIDR(stats.totalBalance)}
          </h4>
          <span className="text-[10px] text-slate-400 font-medium">Saldo tersisa di rekening</span>
        </Card>
      </div>

      {/* Filter and list controls */}
      <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-none w-full md:w-80">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari program dana..."
            className="bg-transparent outline-none text-xs w-full text-slate-800 font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-semibold">Filter Status:</span>
          <div className="flex border border-slate-200 rounded-none overflow-hidden">
            {(['ALL', 'DRAFT', 'AKTIF', 'DITUTUP'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === status ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status === 'ALL' ? 'Semua' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listing Programs */}
      <AdaptiveList
        data={filteredFunds}
        isLoading={isLoading}
        desktopHeaders={[
          'Kode',
          'Nama Dana Khusus',
          'Status',
          'Saldo Saat Ini',
          'Terkumpul',
          'Target Nominal',
          'Progress',
          'Tanggal Mulai',
          'Tanggal Selesai',
          'Aksi'
        ]}
        renderDesktopRow={(fund) => {
          const targetNum = Number(fund.targetNominal || 0);
          const collectedNum = Number(fund.income || 0);
          const percent = targetNum > 0 ? Math.min(Math.round((collectedNum / targetNum) * 100), 100) : 0;
          
          return (
            <tr key={fund.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-5 py-3.5 text-xs font-semibold text-blue-600 border-r font-mono">{fund.code}</td>
              <td className="px-5 py-3.5 text-xs font-medium text-slate-700 border-r max-w-[250px] truncate" title={fund.name}>{fund.name}</td>
              <td className="px-5 py-3.5 border-r text-center">
                <Badge variant={fund.status === 'AKTIF' ? 'success' : fund.status === 'DITUTUP' ? 'danger' : 'warning'}>
                  {fund.status}
                </Badge>
              </td>
              <td className="px-5 py-3.5 text-xs font-semibold text-right text-slate-800 border-r">{formatIDR(Number(fund.balance))}</td>
              <td className="px-5 py-3.5 text-xs font-medium text-right text-sky-600 border-r">{formatIDR(collectedNum)}</td>
              <td className="px-5 py-3.5 text-xs font-medium text-right text-slate-500 border-r">{targetNum > 0 ? formatIDR(targetNum) : '-'}</td>

              <td className="px-5 py-3.5 border-r">
                {targetNum > 0 ? (
                  <div className="flex items-center gap-1.5 min-w-[100px]">
                    <div className="w-16 bg-slate-100 h-1.5 rounded-none overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-none" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-[9px] font-medium text-slate-500">{percent}%</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold">Tanpa Target</span>
                )}
              </td>
              <td className="px-5 py-3.5 text-[10px] text-slate-500 font-semibold border-r">
                {new Date(fund.tanggalMulai).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </td>
              <td className="px-5 py-3.5 text-[10px] text-slate-500 font-semibold border-r">
                {new Date(fund.tanggalSelesai).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </td>
              <td className="px-5 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => setSelectedFundId(fund.id)}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors border border-transparent hover:border-slate-200"
                    title="Lihat Detail"
                  >
                    <Eye size={14} />
                  </button>
                  {isBendahara && fund.status === 'DRAFT' && (
                    <>
                      <button
                        onClick={() => handleActivate(fund.id)}
                        className="p-1 text-slate-400 hover:text-sky-600 transition-colors border border-transparent hover:border-slate-200"
                        title="Aktifkan Dana"
                      >
                        <Play size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(fund.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors border border-transparent hover:border-slate-200"
                        title="Hapus Program"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  {isBendahara && fund.status === 'AKTIF' && (
                    <button
                      onClick={() => handleClose(fund.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors border border-transparent hover:border-slate-200"
                      title="Tutup Program Dana"
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        }}
        renderMobileCard={(fund) => {
          const targetNum = Number(fund.targetNominal || 0);
          const collectedNum = Number(fund.income || 0);
          const percent = targetNum > 0 ? Math.min(Math.round((collectedNum / targetNum) * 100), 100) : 0;
          return (
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-semibold text-blue-600 font-mono">{fund.code}</span>
                  <Badge variant={fund.status === 'AKTIF' ? 'success' : fund.status === 'DITUTUP' ? 'danger' : 'warning'}>
                    {fund.status}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedFundId(fund.id)}
                    className="p-1 hover:bg-slate-100 rounded-none text-slate-500 flex items-center justify-center"
                  >
                    <Eye size={14} />
                  </button>
                  {isBendahara && fund.status === 'DRAFT' && (
                    <>
                      <button onClick={() => handleActivate(fund.id)} className="p-1 text-sky-600 hover:bg-sky-50 rounded-none">
                        <Play size={14} />
                      </button>

                      <button onClick={() => handleDelete(fund.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-none">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  {isBendahara && fund.status === 'AKTIF' && (
                    <button onClick={() => handleClose(fund.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-none">
                      <XCircle size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-800">{fund.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{fund.description || 'Tanpa deskripsi'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t pt-2 text-[10px] font-medium text-slate-500">
                <div>
                  <p className="text-[8px] text-slate-400">Saldo Aktif</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{formatIDR(Number(fund.balance))}</p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-400">Terkumpul</p>
                  <p className="text-xs font-semibold text-sky-600 mt-0.5">{formatIDR(collectedNum)}</p>

                </div>
              </div>

              {targetNum > 0 && (
                <div className="pt-1.5">
                  <div className="flex justify-between text-[8px] font-medium text-slate-400 mb-1">
                    <span>PROGRESS TARGET ({formatIDR(targetNum)})</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-none overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-none" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        }}
      />

      {/* Modal Program Dana Baru */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Buka Program Dana Baru">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">KODE DANA</label>
              <input
                type="text"
                name="code"
                required
                placeholder="Misal: DK-05"
                className="w-full px-3 py-2 bg-slate-50 rounded-none text-xs outline-none focus:border-blue-500 font-mono font-medium"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">NAMA PROGRAM DANA</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Contoh: Renovasi Atap Gereja Utama"
                className="w-full px-3 py-2 bg-slate-50 rounded-none text-xs outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">DESKRIPSI PROGRAM</label>
            <textarea
              name="description"
              placeholder="Penjelasan singkat mengenai asal-usul program..."
              className="w-full px-3 py-2 bg-slate-50 rounded-none text-xs outline-none focus:border-blue-500 h-16 resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">TUJUAN PENGGUNAAN DANA</label>
            <input
              type="text"
              name="tujuanPenggalangan"
              placeholder="Contoh: Mengganti kayu penyangga yang lapuk..."
              className="w-full px-3 py-2 bg-slate-50 rounded-none text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">TARGET PENGGALANGAN (IDR, OPSIONAL)</label>
            <CurrencyInput
              value={targetNominalState}
              onChange={(val) => setTargetNominalState(val)}
              placeholder="Misal: 150.000.000 (boleh kosong)"
              className="text-xs bg-slate-50 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">TANGGAL MULAI</label>
              <input
                type="date"
                name="tanggalMulai"
                required
                className="w-full px-3 py-2 bg-slate-50 rounded-none text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">TANGGAL SELESAI</label>
              <input
                type="date"
                name="tanggalSelesai"
                required
                className="w-full px-3 py-2 bg-slate-50 rounded-none text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)} className="rounded-none">
              Batal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-none shadow-none text-xs py-2 px-4 font-medium">
              Buat Program Dana
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Dana Khusus */}
      <Modal
        isOpen={!!selectedFundId}
        onClose={() => setSelectedFundId(null)}
        title={activeDetail ? `Detail: ${activeDetail.name} (${activeDetail.code})` : 'Detail Dana Khusus'}
        size="xl"
      >
        {activeDetail && (
          <div className="space-y-6" id="print-section">
            {/* Action Header on Detail Modal */}
            <div className="flex flex-wrap gap-2 justify-between items-center border-b pb-3 no-print">
              <div className="flex gap-2">
                <span className="text-[10px] font-semibold text-slate-400 self-center">Status saat ini:</span>
                <Badge variant={activeDetail.status === 'AKTIF' ? 'success' : activeDetail.status === 'DITUTUP' ? 'danger' : 'warning'}>
                  {activeDetail.status}
                </Badge>
              </div>

              <div className="flex gap-2">
                {reportData && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToCSV(reportData)}
                      className="text-slate-600 border-slate-200 flex items-center gap-1.5 rounded-none text-[10px]"
                    >
                      <FileSpreadsheet size={14} /> Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={triggerPrintReport}
                      className="text-slate-600 border-slate-200 flex items-center gap-1.5 rounded-none text-[10px]"
                    >
                      <FileDown size={14} /> Cetak Laporan / PDF
                    </Button>
                  </>
                )}

                {isBendahara && activeDetail.status === 'DITUTUP' && Number(activeDetail.balance) > 0 && (
                  <Button
                    onClick={() => setIsAllocateOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 rounded-none text-[10px] font-medium py-1.5 shadow-none"
                  >
                    <ArrowRightLeft size={14} /> Alokasikan Sisa Dana ({formatIDR(Number(activeDetail.balance))})
                  </Button>
                )}
              </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block text-center border-b-2 border-slate-800 pb-3 mb-4">
              <h1 className="text-xl font-medium text-slate-800">Laporan Akuntabilitas Dana Khusus</h1>
              <p className="text-xs text-slate-500 font-semibold">{activeDetail.name} ({activeDetail.code})</p>
              <p className="text-[10px] text-slate-400 mt-1">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4">
              <div className="space-y-2 text-xs font-semibold">
                <div>
                  <span className="text-[9px] font-semibold text-slate-400 block">Tujuan Penggalangan</span>
                  <span className="text-slate-800">{activeDetail.tujuanPenggalangan || '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-slate-400 block">Keterangan / Deskripsi</span>
                  <span className="text-slate-600 leading-normal block">{activeDetail.description || '-'}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs font-semibold">
                <div>
                  <span className="text-[9px] font-semibold text-slate-400 block">Periode Aktif Program</span>
                  <span className="text-slate-800 font-mono">
                    {new Date(activeDetail.tanggalMulai).toLocaleDateString('id-ID')} s/d {new Date(activeDetail.tanggalSelesai).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-slate-400 block">Target Penggalangan</span>
                  <span className="text-slate-800">{Number(activeDetail.targetNominal) > 0 ? formatIDR(Number(activeDetail.targetNominal)) : 'Tidak memiliki batasan target nominal'}</span>
                </div>
              </div>
            </div>

            {/* Detail Stats */}
            <div className="grid grid-cols-3 gap-4 border-y py-4 text-center">
              <div>
                <p className="text-[9px] text-slate-400 font-semibold">Total Donasi Masuk</p>
                <p className="text-sm font-semibold text-sky-600 mt-1">{formatIDR(Number(activeDetail.income))}</p>

              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-semibold">Total Pengeluaran / Belanja</p>
                <p className="text-sm font-semibold text-rose-500 mt-1">{formatIDR(Number(activeDetail.expense))}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-semibold">Sisa Saldo Tersedia</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{formatIDR(Number(activeDetail.balance))}</p>
              </div>
            </div>

            {/* Progress Bar Detail */}
            {Number(activeDetail.targetNominal) > 0 && (
              <div className="p-4 bg-blue-50/30">
                <div className="flex justify-between text-[10px] font-medium text-blue-700 mb-1.5">
                  <span>Pencapaian Target Penggalangan</span>
                  <span>{Math.round((Number(activeDetail.income) / Number(activeDetail.targetNominal)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-none overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-none"
                    style={{ width: `${Math.min(Math.round((Number(activeDetail.income) / Number(activeDetail.targetNominal)) * 100), 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tabs for Transactions & Allocations History */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <History size={14} /> Histori Transaksi Mutasi Kas
                </h3>
              </div>

              {isLoadingTx ? (
                <div className="text-center py-4 text-xs font-medium text-slate-500">Memuat riwayat transaksi...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-xs font-medium text-slate-400 border border-dashed">
                  Belum ada transaksi mutasi kas (pemasukan donasi atau pengeluaran belanja) untuk program ini.
                </div>
              ) : (
                <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 font-semibold text-[10px] text-slate-500 divide-x divide-slate-100 border-b border-slate-200">
                      <th className="px-4 py-2">No Transaksi</th>
                      <th className="px-4 py-2">Tanggal</th>
                      <th className="px-4 py-2">Keterangan</th>
                      <th className="px-4 py-2 text-right">Tipe</th>
                      <th className="px-4 py-2 text-right">Jumlah (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50/40">
                        <td className="px-4 py-2.5 font-medium font-mono text-blue-600">{tx.transactionNo}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-500">
                          {new Date(tx.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-slate-700 max-w-[300px] truncate" title={tx.description}>{tx.description}</td>
                        <td className="px-4 py-2.5 text-right font-semibold">
                          <span className={`px-1.5 py-0.5 rounded-none text-[8px] border font-semibold ${ tx.transactionType === 'INCOME' ? 'text-sky-600 ' : 'text-rose-500 ' }`}>
                            {tx.transactionType === 'INCOME' ? 'MASUK' : 'KELUAR'}
                          </span>
                        </td>
                        <td className={`px-4 py-2.5 text-right font-semibold ${
                          tx.transactionType === 'INCOME' ? 'text-sky-600' : 'text-rose-500'
                        }`}>
                          {tx.transactionType === 'INCOME' ? '+' : '-'}{formatIDR(Number(tx.amount))}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Allocations Table inside report data */}
              {reportData && reportData.allocations.length > 0 && (
                <div className="space-y-2 mt-4 pt-4 border-t">
                  <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <ArrowRightLeft size={14} className="text-amber-500" /> Riwayat Alokasi Sisa Saldo
                  </h3>
                  <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                    <thead>
                      <tr className="bg-slate-50 font-semibold text-[10px] text-slate-500 divide-x divide-slate-100 border-b border-slate-200">
                        <th className="px-4 py-2">Tanggal Alokasi</th>
                        <th className="px-4 py-2">Pos Dana Tujuan</th>
                        <th className="px-4 py-2">Keterangan</th>
                        <th className="px-4 py-2 text-right">Nominal (IDR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.allocations.map((alloc: any) => (
                        <tr key={alloc.id} className="hover:bg-slate-50/40">
                          <td className="px-4 py-2.5 font-medium text-slate-500">
                            {new Date(alloc.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-blue-600">{alloc.targetPos}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-600">{alloc.keterangan || '-'}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-amber-600">
                            {formatIDR(Number(alloc.nominal))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t no-print">
              <Button onClick={() => setSelectedFundId(null)} variant="outline" size="sm" className="rounded-none">
                Tutup Detail
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Alokasi Sisa Dana */}
      <Modal
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
        title="Alokasikan Sisa Saldo Dana Khusus"
      >
        {activeDetail && (
          <form onSubmit={handleAllocateSubmit} className="space-y-4">
            <div className="p-3 text-amber-800 text-xs rounded-none font-semibold space-y-1">
              <p className="font-medium">⚠️ PROSES ALOKASI SALDO AKHIR</p>
              <p>Dana Khusus <strong className="font-semibold">{activeDetail.name}</strong> telah DITUTUP. Sisa saldo akhir sebesar <strong className="font-semibold text-amber-700">{formatIDR(Number(activeDetail.balance))}</strong> wajib dipindahkan ke Pos Dana permanen.</p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">POS DANA TUJUAN (PERMANEN)</label>
              <select
                value={targetPosDanaId}
                onChange={(e) => setTargetPosDanaId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 rounded-none text-xs outline-none focus:border-blue-500 font-medium"
              >
                <option value="">-- Pilih Pos Dana Penerima --</option>
                {fundCategories.filter(f => f.isActive).map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">NOMINAL ALOKASI (IDR)</label>
              <CurrencyInput
                value={allocationAmount}
                onChange={(val) => setAllocationAmount(val)}
                placeholder={formatIDR(Number(activeDetail.balance))}
                className="text-xs bg-slate-50 font-mono font-medium text-slate-800"
              />
              <span className="text-[9px] text-slate-400 font-medium block mt-1">Maksimal: {formatIDR(Number(activeDetail.balance))}</span>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">KETERANGAN / DESKRIPSI</label>
              <textarea
                value={allocationNotes}
                onChange={(e) => setAllocationNotes(e.target.value)}
                placeholder="Contoh: Pemindahan sisa dana bencana alam ke Pos Dana Sosial Paroki"
                className="w-full px-3 py-2 bg-slate-50 rounded-none text-xs outline-none focus:border-blue-500 h-16 resize-none"
              />
            </div>

            {allocationError && (
              <p className="text-[10px] text-rose-500 font-medium">{allocationError}</p>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAllocateOpen(false)} className="rounded-none">
                Batal
              </Button>
              <Button type="submit" disabled={allocateMutation.isPending} className="bg-amber-600 hover:bg-amber-700 text-white rounded-none shadow-none text-xs py-2 px-4 font-medium flex items-center gap-1.5">
                {allocateMutation.isPending ? 'Memproses...' : <><CheckCircle size={14} /> Proses Alokasi</>}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DanaKhususPage;