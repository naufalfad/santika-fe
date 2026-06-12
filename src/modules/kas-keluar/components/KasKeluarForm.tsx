import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { useActivityStore } from '../../../app/store/useActivityStore';
import { useFundCategoriesQuery } from '../../kas-masuk/hooks/useKasMasukQuery';
import { useExpenseTypesQuery, useApprovalsQuery, useAddKasKeluarMutation } from '../hooks/useKasKeluarQuery';
import { useAnggaranQuery } from '../../anggaran/hooks/useAnggaranQuery';

const schema = z.object({
  transaction_date: z.string().min(1, 'Tanggal wajib diisi'),
  fund_category_id: z.string().uuid('Pos Dana wajib dipilih'),
  expense_type_id: z.string().uuid('Jenis Pengeluaran wajib dipilih'),
  budget_item_id: z.string().optional(),
  permohonan_anggaran_id: z.string().optional(),
  is_uang_muka: z.boolean().optional(),
  penerima: z.string().min(3, 'Nama penerima/toko minimal 3 karakter'),
  amount: z.number().min(1000, 'Minimal pengeluaran Rp 1.000'),
  keterangan: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const KasKeluarForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const addMutation = useAddKasKeluarMutation();
  const addLog = useActivityStore((state) => state.addLog);

  const { data: fundCategories = [] } = useFundCategoriesQuery();
  const { data: expenseTypes = [] } = useExpenseTypesQuery();
  const { data: budgets = [] } = useAnggaranQuery();
  const { data: approvals = [] } = useApprovalsQuery({ status: 'DISETUJUI' });

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      transaction_date: new Date().toISOString().substring(0, 10),
      budget_item_id: '',
      permohonan_anggaran_id: '',
      is_uang_muka: false,
    }
  });

  const selectedFundCategoryId = watch('fund_category_id');
  const selectedPermohonanId = watch('permohonan_anggaran_id');

  // Filter budget items dynamically based on the selected Pos Dana
  const budgetItems = useMemo(() => {
    if (!selectedFundCategoryId) return [];
    const matchingBudgets = budgets.filter(b => b.fundCategoryId === selectedFundCategoryId);
    return matchingBudgets.flatMap(b => b.items);
  }, [budgets, selectedFundCategoryId]);

  // Find selected budget request details
  const selectedPermohonan = useMemo(() => {
    if (!selectedPermohonanId) return null;
    return approvals.find(a => a.id === selectedPermohonanId);
  }, [approvals, selectedPermohonanId]);

  // Auto-populate when budget request is selected
  useEffect(() => {
    if (selectedPermohonan) {
      if (selectedPermohonan.posDanaId) {
        setValue('fund_category_id', selectedPermohonan.posDanaId);
      }
      setValue('amount', Number(selectedPermohonan.jumlahDisetujui));
      setValue('penerima', selectedPermohonan.kegiatan?.komisi?.nama || 'Ketua Komisi');
      setValue('is_uang_muka', true); // Activities are typically cash advances requiring SPJ
      setValue('keterangan', `Pencarian dana kegiatan: ${selectedPermohonan.kegiatan?.namaKegiatan} (${selectedPermohonan.nomorPermohonan})`);
    }
  }, [selectedPermohonan, setValue]);

  const onSubmit = async (data: FormData) => {
    addMutation.mutate({
      transaction_date: new Date(data.transaction_date).toISOString(),
      fund_category_id: data.fund_category_id,
      expense_type_id: data.expense_type_id,
      budget_item_id: data.budget_item_id || undefined,
      permohonan_anggaran_id: data.permohonan_anggaran_id || undefined,
      is_uang_muka: data.is_uang_muka,
      amount: data.amount,
      description: data.keterangan ? `${data.penerima} - ${data.keterangan}` : data.penerima,
      file: file,
    }, {
      onSuccess: () => {
        addLog(
          `Pengeluaran Kas - ${data.penerima}`,
          data.amount,
          'out'
        );
        onSuccess();
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {addMutation.isError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{(addMutation.error as any)?.response?.data?.message || 'Gagal menyimpan transaksi kas keluar'}</span>
        </div>
      )}

      {/* Tautan Permohonan Anggaran (RAB) */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
          TAUTKAN KE PERMOHONAN ANGGARAN DISETUJUI (OPSIONAL)
          <span title="Menghubungkan transaksi pengeluaran dengan permohonan anggaran kegiatan yang sudah disetujui">
            <HelpCircle size={13} className="text-slate-400" />
          </span>
        </label>
        <select 
          {...register('permohonan_anggaran_id')} 
          className="w-full p-2 border rounded-lg text-sm outline-blue-500 font-semibold text-slate-800 cursor-pointer"
        >
          <option value="">-- Bukan Pengeluaran Kegiatan / Proposal --</option>
          {approvals.map(a => (
            <option key={a.id} value={a.id}>
              {a.kegiatan?.namaKegiatan} - {a.nomorPermohonan} (Plafon Disetujui: Rp {Number(a.jumlahDisetujui).toLocaleString('id-ID')})
            </option>
          ))}
        </select>
        {errors.permohonan_anggaran_id && <p className="text-red-500 text-[10px] mt-1">{errors.permohonan_anggaran_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">TANGGAL TRANSAKSI</label>
          <input type="date" {...register('transaction_date')} className="w-full p-2 border rounded-lg text-sm outline-blue-500 font-semibold text-slate-800" />
          {errors.transaction_date && <p className="text-red-500 text-[10px] mt-1">{errors.transaction_date.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">POS DANA (KAS ASAL)</label>
          <select 
            {...register('fund_category_id')} 
            className="w-full p-2 border rounded-lg text-sm outline-blue-500 font-semibold text-slate-800"
            disabled={!!selectedPermohonanId}
            onChange={(e) => {
              register('fund_category_id').onChange(e);
              setValue('budget_item_id', '');
            }}
          >
            <option value="">Pilih Pos Dana</option>
            {fundCategories.filter(f => f.isActive).map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {errors.fund_category_id && <p className="text-red-500 text-[10px] mt-1">{errors.fund_category_id.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">JENIS PENGELUARAN</label>
          <select {...register('expense_type_id')} className="w-full p-2 border rounded-lg text-sm outline-blue-500 font-semibold text-slate-800">
            <option value="">Pilih Jenis Pengeluaran</option>
            {expenseTypes.filter(e => e.isActive).map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          {errors.expense_type_id && <p className="text-red-500 text-[10px] mt-1">{errors.expense_type_id.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">ITEM ANGGARAN TAHUNAN (OPSIONAL)</label>
          <select 
            {...register('budget_item_id')} 
            className="w-full p-2 border rounded-lg text-sm outline-blue-500 font-semibold text-slate-800"
            disabled={!selectedFundCategoryId || budgetItems.length === 0}
          >
            <option value="">{!selectedFundCategoryId ? 'Pilih Pos Dana Dahulu' : budgetItems.length === 0 ? 'Tidak Ada Item Anggaran' : 'Pilih Item Anggaran'}</option>
            {budgetItems.map(item => (
              <option key={item.id} value={item.id}>{item.name} (Sisa: Rp {Number(item.sisa).toLocaleString('id-ID')})</option>
            ))}
          </select>
          {errors.budget_item_id && <p className="text-red-500 text-[10px] mt-1">{errors.budget_item_id.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 py-1">
        <input 
          type="checkbox" 
          id="is_uang_muka" 
          {...register('is_uang_muka')} 
          disabled={!!selectedPermohonanId}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="is_uang_muka" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
          GUNAKAN UANG MUKA KEGIATAN (MEMBUTUHKAN PERTANGGUNGJAWABAN SPJ)
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">PENERIMA / UNIT PENGAJU</label>
          <input type="text" {...register('penerima')} disabled={!!selectedPermohonanId} placeholder="Contoh: Toko Buku Beriman" className="w-full p-2 border rounded-lg text-sm outline-blue-500 font-semibold text-slate-800" />
          {errors.penerima && <p className="text-red-500 text-[10px] mt-1">{errors.penerima.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">NOMINAL (RP)</label>
          <input type="number" {...register('amount', { valueAsNumber: true })} disabled={!!selectedPermohonanId} placeholder="0" className="w-full p-2 border rounded-lg text-sm outline-blue-500 font-semibold text-slate-800" />
          {errors.amount && <p className="text-red-500 text-[10px] mt-1">{errors.amount.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">KETERANGAN / RINCIAN (OPSIONAL)</label>
        <textarea {...register('keterangan')} disabled={!!selectedPermohonanId} placeholder="Tulis rincian pengeluaran..." className="w-full p-2 border rounded-lg text-sm outline-blue-500 font-semibold text-slate-800 h-16 resize-none" />
        {errors.keterangan && <p className="text-red-500 text-[10px] mt-1">{errors.keterangan.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">UPLOAD BUKTI (NOTA/KUITANSI/PDF)</label>
        {!preview ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer relative">
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf" />
            <Upload className="text-gray-400 mb-2" size={24} />
            <p className="text-xs text-gray-500">Klik atau seret file gambar/PDF ke sini</p>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 h-28 flex items-center justify-between px-4 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 font-bold text-xs">
                {file?.type.includes('pdf') ? 'PDF' : 'IMAGE'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{file?.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">{(Number(file?.size || 0) / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button type="button" onClick={handleRemoveFile} className="p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="pt-2 flex gap-3">
        <Button type="submit" disabled={isSubmitting || addMutation.isPending} className="flex-1 flex justify-center items-center gap-2 py-2.5">
          {isSubmitting || addMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Menyimpan...
            </span>
          ) : (
            <><CheckCircle2 size={16} /> Simpan Transaksi</>
          )}
        </Button>
      </div>
    </form>
  );
};