import * as z from 'zod';

export const KasMasukSchema = z.object({
    tanggal: z.string().min(1, 'Tanggal wajib diisi'),
    kategori: z.string().min(1, 'Pilih salah satu kategori'),
    sumber: z.string().min(3, 'Sumber minimal 3 karakter'),
    jumlah: z.number().min(100, 'Nominal minimal Rp 100'),
    keterangan: z.string().optional(),
});

export type KasMasukInput = z.infer<typeof KasMasukSchema>;