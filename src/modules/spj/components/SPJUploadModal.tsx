import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, CheckCircle2, FileText, Image, AlertCircle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { CurrencyInput } from '../../../shared/components/ui/CurrencyInput';
import { Select } from '../../../shared/components/ui/Select';
import { useKasKeluarQuery } from '../../kas-keluar/hooks/useKasKeluarQuery';
import { useUploadSpjMutation } from '../hooks/useSpjQuery';
import { formatIDR } from '../../../shared/utils/formatter';

const schema = z.object({
  title: z.string().min(3, 'Nama dokumen minimal 3 karakter'),
  cash_transaction_id: z.string().uuid('Transaksi Kas Keluar wajib dipilih'),
  amount: z.number().min(1000, 'Minimal nilai transaksi Rp 1.000'),
  fileType: z.enum(['pdf', 'image'] as const),
});

type FormData = z.infer<typeof schema>;

interface SPJUploadModalProps {
  onSuccess: () => void;
  onCancel: () => void;
  defaultCashTransactionId?: string;
}

export const SPJUploadModal = ({ onSuccess, onCancel, defaultCashTransactionId }: SPJUploadModalProps) => {
  const { data: kasKeluar = [], isLoading: isLoadingKasKeluar } = useKasKeluarQuery();
  const uploadMutation = useUploadSpjMutation();

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const pendingTransactions = useMemo(() => {
    const filtered = kasKeluar.filter((item) => item.isUangMuka && item.status === 'MENUNGGU_SPJ');
    if (defaultCashTransactionId && !filtered.some((item) => item.id === defaultCashTransactionId)) {
      const defaultTx = kasKeluar.find((item) => item.id === defaultCashTransactionId);
      if (defaultTx) {
        filtered.push(defaultTx);
      }
    }
    return filtered;
  }, [kasKeluar, defaultCashTransactionId]);

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cash_transaction_id: defaultCashTransactionId || '',
      fileType: 'pdf',
    }
  });

  const selectedFileType = watch('fileType');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);

    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    // Size validation: 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError('Ukuran file maksimal adalah 5 MB');
      setFile(null);
      setPreview(null);
      return;
    }

    // Type validation
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(fileExt || '');
    const isPdf = fileExt === 'pdf';

    if (!isImage && !isPdf) {
      setFileError('Format file harus berupa PDF atau Gambar (PNG, JPG, JPEG)');
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    if (isImage) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!file) {
      setFileError('Dokumen fisik wajib diunggah');
      return;
    }

    uploadMutation.mutate({
      title: data.title,
      amount: data.amount,
      cash_transaction_id: data.cash_transaction_id,
      file: file,
    }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {uploadMutation.isError && (
        <div className="p-3 bg-rose-50 rounded-none text-xs text-rose-600 font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{(uploadMutation.error as any)?.response?.data?.message || 'Gagal mengunggah dokumen SPJ'}</span>
        </div>
      )}

      <Input
        label="NAMA DOKUMEN SPJ"
        placeholder="Contoh: Belanja Bunga Altar Paskah"
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="TRANSAKSI KAS KELUAR (UANG MUKA)"
          error={errors.cash_transaction_id?.message}
          {...register('cash_transaction_id')}
          disabled={isLoadingKasKeluar}
        >
          <option value="">{isLoadingKasKeluar ? 'Memuat...' : 'Pilih Transaksi Uang Muka'}</option>
          {pendingTransactions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.transactionNo} - {item.description} ({formatIDR(Number(item.amount))})
            </option>
          ))}
        </Select>

        <Select
          label="JENIS FILE"
          error={errors.fileType?.message}
          {...register('fileType')}
        >
          <option value="pdf">Dokumen PDF (.pdf)</option>
          <option value="image">Gambar (.png, .jpg, .jpeg)</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500">NILAI TRANSAKSI (RP)</label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              value={field.value ?? undefined}
              onChange={field.onChange}
              placeholder="0"
            />
          )}
        />
        {errors.amount && <p className="text-[10px] text-rose-500 font-medium mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-2">
          UNGGAH DOKUMEN FISIK
        </label>

        {!file ? (
          <div className="border-2 border-dashed border-slate-200 rounded-none p-8 flex flex-col items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept={selectedFileType === 'pdf' ? '.pdf' : 'image/*'}
            />
            <Upload className="text-slate-400 mb-2" size={32} />
            <p className="text-xs text-slate-500 font-medium">
              Klik atau seret file {selectedFileType === 'pdf' ? 'PDF' : 'Gambar'} ke sini (Maks 5MB)
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-none bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="text-blue-600">
                {selectedFileType === 'pdf' ? <FileText size={20} /> : <Image size={20} />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null); }}
              className="text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {preview && (
          <div className="mt-3 relative rounded-none overflow-hidden border border-slate-200 h-40 bg-slate-100">
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          </div>
        )}

        {fileError && <p className="text-[10px] text-rose-500 font-medium mt-1.5">{fileError}</p>}
      </div>

      <div className="pt-4 flex gap-3 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 py-3 rounded-none">
          Batal
        </Button>
        <Button
          type="submit"
          disabled={uploadMutation.isPending}
          className="flex-1 py-3 font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 flex justify-center items-center gap-2"
        >
          {uploadMutation.isPending ? 'Mengunggah...' : <><CheckCircle2 size={18} /> Simpan & Upload</>}
        </Button>
      </div>
    </form>
  );
};
