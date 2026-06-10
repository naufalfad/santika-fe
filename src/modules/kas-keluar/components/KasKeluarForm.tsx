import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { useActivityStore } from '../../../app/store/useActivityStore';
import { useAddKasKeluarMutation } from '../../kas-masuk/hooks/useKasMasukQuery';

const schema = z.object({
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  kategori: z.string().min(1, 'Kategori wajib dipilih'),
  penerima: z.string().min(3, 'Nama penerima minimal 3 karakter'),
  jumlah: z.number().min(1000, 'Minimal pengeluaran Rp 1.000'),
  keterangan: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const KasKeluarForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const addMutation = useAddKasKeluarMutation();
  const addLog = useActivityStore((state) => state.addLog);

  const [preview, setPreview] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    addMutation.mutate({
      tanggal: data.tanggal,
      kategori: data.kategori,
      penerima: data.penerima,
      jumlah: data.jumlah,
      buktiUrl: preview || undefined,
    }, {
      onSuccess: () => {
        addLog(
          `Pengeluaran Kas - ${data.penerima} (${data.kategori})`,
          data.jumlah,
          'out'
        );
        onSuccess();
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">TANGGAL</label>
          <input type="date" {...register('tanggal')} className="w-full p-2 border rounded-none text-sm outline-blue-500 bg-slate-50 border-slate-200" />
          {errors.tanggal && <p className="text-red-500 text-[10px] mt-1">{errors.tanggal.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">KATEGORI</label>
          <select {...register('kategori')} className="w-full p-2 border rounded-none text-sm outline-blue-500 bg-slate-50 border-slate-200">
            <option value="">Pilih Kategori</option>
            <option value="Operasional">Operasional</option>
            <option value="Liturgi">Liturgi</option>
            <option value="Kegiatan">Kegiatan Komisi</option>
          </select>
          {errors.kategori && <p className="text-red-500 text-[10px] mt-1">{errors.kategori.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">PENERIMA / TOKO</label>
        <input type="text" {...register('penerima')} placeholder="Contoh: Toko Buku Beriman" className="w-full p-2 border rounded-none text-sm outline-blue-500 bg-slate-50 border-slate-200" />
        {errors.penerima && <p className="text-red-500 text-[10px] mt-1">{errors.penerima.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">NOMINAL (RP)</label>
        <input type="number" {...register('jumlah', { valueAsNumber: true })} placeholder="0" className="w-full p-2 border rounded-none text-sm outline-blue-500 bg-slate-50 border-slate-200" />
        {errors.jumlah && <p className="text-red-500 text-[10px] mt-1">{errors.jumlah.message}</p>}
      </div>

      {/* Mock Upload Bukti */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">UPLOAD BUKTI (NOTA/KUITANSI)</label>
        {!preview ? (
          <div className="border-2 border-dashed border-slate-200 rounded-none p-8 flex flex-col items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer relative">
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            <Upload className="text-slate-400 mb-2" size={32} />
            <p className="text-xs text-slate-500">Klik atau seret file gambar ke sini</p>
          </div>
        ) : (
          <div className="relative rounded-none overflow-hidden border border-slate-200 h-32">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button onClick={() => setPreview(null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-none cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1 flex justify-center items-center gap-2 rounded-none">
          {isSubmitting ? 'Menyimpan...' : <><CheckCircle2 size={18} /> Simpan Transaksi</>}
        </Button>
      </div>
    </form>
  );
};