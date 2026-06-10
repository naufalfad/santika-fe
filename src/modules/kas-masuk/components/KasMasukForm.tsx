import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KasMasukSchema } from '../types/kas-masuk';
import type { KasMasukInput } from '../types/kas-masuk';
import { Button } from '../../../shared/components/ui/Button';
import { Wallet, Calendar, Tag, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
    onSubmit: (data: KasMasukInput) => void;
    onCancel: () => void;
}

export const KasMasukForm = ({ onSubmit, onCancel }: Props) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<KasMasukInput>({
        resolver: zodResolver(KasMasukSchema),
        defaultValues: {
            tanggal: new Date().toISOString().split('T')[0],
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tanggal */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" /> Tanggal Transaksi
                    </label>
                    <input
                        type="date"
                        {...register('tanggal')}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                    {errors.tanggal && <p className="text-[10px] text-rose-500 font-bold">{errors.tanggal.message}</p>}
                </div>

                {/* Kategori */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-2">
                        <Tag size={14} className="text-emerald-500" /> Kategori Dana
                    </label>
                    <select
                        {...register('kategori')}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                    >
                        <option value="">Pilih Kategori</option>
                        <option value="Kolekte">Kolekte</option>
                        <option value="Donasi">Donasi</option>
                        <option value="Pembangunan">Dana Pembangunan</option>
                        <option value="Persembahan">Persembahan</option>
                        <option value="Lainnya">Lain-lain</option>
                    </select>
                    {errors.kategori && <p className="text-[10px] text-rose-500 font-bold">{errors.kategori.message}</p>}
                </div>
            </div>

            {/* Sumber */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-2">
                    <FileText size={14} className="text-purple-500" /> Sumber / Keterangan Singkat
                </label>
                <input
                    type="text"
                    placeholder="Misal: Kolekte Misa Minggu Pagi"
                    {...register('sumber')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
                {errors.sumber && <p className="text-[10px] text-rose-500 font-bold">{errors.sumber.message}</p>}
            </div>

            {/* Nominal */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-2">
                    <Wallet size={14} className="text-amber-500" /> Nominal (IDR)
                </label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">Rp</div>
                    <input
                        type="number"
                        placeholder="0"
                        {...register('jumlah', { valueAsNumber: true })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-none text-lg font-black text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                {errors.jumlah && <p className="text-[10px] text-rose-500 font-bold">{errors.jumlah.message}</p>}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-none font-bold text-slate-500"
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-bold shadow-none flex justify-center items-center gap-2"
                >
                    {isSubmitting ? 'Menyimpan...' : <><CheckCircle2 size={18} /> Simpan Data</>}
                </Button>
            </div>
        </form>
    );
};