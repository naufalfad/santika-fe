import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Calendar, Folder, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useFundCategoriesQuery } from '../../kas-masuk/hooks/useKasMasukQuery';
import { useKomisiQuery, useCreateAnggaranMutation } from '../hooks/useAnggaranQuery';

const schema = z.object({
  tahun: z.number().int().min(2000, 'Tahun tidak valid').max(2100, 'Tahun tidak valid'),
  fund_category_id: z.string().uuid('Pos Dana wajib dipilih'),
  items: z.array(z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    plafon: z.number().positive('Nominal plafon harus lebih dari 0'),
    komisiId: z.string().optional().nullable().or(z.literal('')),
  })).min(1, 'Minimal harus ada 1 item anggaran'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BuatAnggaranModal = ({ onSuccess, onCancel }: Props) => {
  const { data: fundCategories = [], isLoading: isLoadingFunds } = useFundCategoriesQuery();
  const { data: komisiList = [], isLoading: isLoadingKomisi } = useKomisiQuery();
  const createMutation = useCreateAnggaranMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tahun: new Date().getFullYear(),
      fund_category_id: '',
      items: [
        { name: '', plafon: undefined as any, komisiId: '' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = async (data: FormData) => {
    // Map empty string komisiId to null
    const formattedItems = data.items.map((item) => ({
      name: item.name,
      plafon: item.plafon,
      komisiId: item.komisiId === '' ? null : item.komisiId,
    }));

    createMutation.mutate({
      tahun: data.tahun,
      fund_category_id: data.fund_category_id,
      items: formattedItems,
    }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Global Error Banner */}
      {createMutation.isError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-none flex items-start gap-2.5 shadow-sm">
          <ShieldAlert size={16} className="text-rose-700 shrink-0 mt-0.5" />
          <p className="text-[11px] font-semibold leading-normal">
            {(createMutation.error as any)?.response?.data?.message || createMutation.error?.message || 'Gagal menyimpan Anggaran.'}
          </p>
        </div>
      )}

      {/* Main Budget Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Tahun Anggaran"
            type="number"
            placeholder="Contoh: 2026"
            error={errors.tahun?.message}
            icon={<Calendar size={16} />}
            {...register('tahun', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Select
            label="Pos Dana (Fund Category)"
            placeholder="Pilih Pos Dana"
            error={errors.fund_category_id?.message}
            icon={<Folder size={16} />}
            disabled={isLoadingFunds}
            {...register('fund_category_id')}
          >
            {fundCategories.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Rincian Item Anggaran ({fields.length})
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', plafon: undefined as any, komisiId: '' })}
            className="text-[10px] px-2.5 py-1 border-slate-300 font-black rounded-none flex items-center gap-1"
          >
            <Plus size={12} /> Tambah Baris
          </Button>
        </div>

        {errors.items?.message && (
          <p className="text-[10px] text-rose-500 font-bold">{errors.items.message}</p>
        )}

        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
          {fields.map((field, index) => {
            const nameError = errors.items?.[index]?.name?.message;
            const plafonError = errors.items?.[index]?.plafon?.message;

            return (
              <div
                key={field.id}
                className="p-3 bg-slate-50/50 border border-slate-200/60 relative space-y-3 rounded-none flex flex-col md:flex-row md:items-start gap-3 md:pr-12"
              >
                <div className="flex-1">
                  <Input
                    placeholder="Nama Item (misal: Listrik)"
                    error={nameError}
                    {...register(`items.${index}.name` as const)}
                  />
                </div>

                <div className="w-full md:w-48">
                  <Input
                    type="number"
                    placeholder="Plafon (Rp)"
                    error={plafonError}
                    {...register(`items.${index}.plafon` as const, { valueAsNumber: true })}
                  />
                </div>

                <div className="w-full md:w-56">
                  <Select
                    placeholder="Pilih Komisi Pengelola (Opsional)"
                    disabled={isLoadingKomisi}
                    {...register(`items.${index}.komisiId` as const)}
                  >
                    <option value="">Umum (Tanpa Komisi)</option>
                    {komisiList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </Select>
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute right-3 top-3 md:static md:mt-2 text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 transition-colors"
                    title="Hapus baris"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex gap-3 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 py-3 text-xs font-bold rounded-none border-slate-200 text-slate-500"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="flex-1 py-3 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-none flex justify-center items-center gap-2"
        >
          {createMutation.isPending ? 'Menyimpan...' : <><CheckCircle2 size={16} /> Simpan Anggaran</>}
        </Button>
      </div>
    </form>
  );
};
