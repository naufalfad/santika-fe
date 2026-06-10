import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, CheckCircle2, FileText, Image } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useSPJStore } from '../../../app/store/useSPJStore';
import { useActivityStore } from '../../../app/store/useActivityStore';
import { useAuthStore } from '../../../app/store/useAuthStore';

const schema = z.object({
  title: z.string().min(3, 'Nama dokumen minimal 3 karakter'),
  category: z.string().min(1, 'Kategori wajib dipilih'),
  amount: z.number().min(1000, 'Minimal nilai transaksi Rp 1.000'),
  fileType: z.enum(['pdf', 'image'] as const),
});

type FormData = z.infer<typeof schema>;

interface SPJUploadModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const SPJUploadModal = ({ onSuccess, onCancel }: SPJUploadModalProps) => {
  const addSPJDocument = useSPJStore((state) => state.addSPJDocument);
  const addLog = useActivityStore((state) => state.addLog);
  const user = useAuthStore((state) => state.user);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
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

    const payload = {
      title: data.title,
      category: data.category,
      amount: data.amount,
      fileType: data.fileType,
      date: new Date().toISOString().split('T')[0],
      uploadedBy: user?.name || 'User Paroki',
      thumbnail: preview || undefined,
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Save to Zustand
    addSPJDocument(payload);
    
    // Log Activity
    addLog(
      `SPJ Diunggah - ${data.title} (${data.category}) oleh ${payload.uploadedBy}`,
      data.amount,
      'spj'
    );

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="NAMA DOKUMEN SPJ"
        placeholder="Contoh: Belanja Bunga Altar Paskah"
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="KATEGORI"
          error={errors.category?.message}
          {...register('category')}
        >
          <option value="">Pilih Kategori</option>
          <option value="Liturgi">Liturgi</option>
          <option value="Pembangunan">Pembangunan</option>
          <option value="Sosial">Sosial (PSE)</option>
          <option value="Sekretariat">Sekretariat</option>
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

      <Input
        label="NILAI TRANSAKSI (RP)"
        type="number"
        placeholder="0"
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />

      <div>
        <label className="block text-[11px] font-black text-slate-500 uppercase mb-2">
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
          <div className="p-4 border border-slate-200 rounded-none bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-none">
                {selectedFileType === 'pdf' ? <FileText size={20} /> : <Image size={20} />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null); }}
              className="p-1 bg-rose-50 text-rose-500 rounded-none hover:bg-rose-100 transition-colors cursor-pointer"
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

        {fileError && <p className="text-[10px] text-rose-500 font-bold mt-1.5">{fileError}</p>}
      </div>

      <div className="pt-4 flex gap-3 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 py-3 rounded-none">
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-none flex justify-center items-center gap-2 rounded-none"
        >
          {isSubmitting ? 'Mengunggah...' : <><CheckCircle2 size={18} /> Simpan & Upload</>}
        </Button>
      </div>
    </form>
  );
};
