import * as z from 'zod';

export const KasMasukSchema = z.object({
    transaction_date: z.string().min(1, 'Tanggal wajib diisi'),
    fund_category_id: z.string().uuid('Pilih salah satu Pos Dana'),
    income_type_id: z.string().uuid('Pilih salah satu Jenis Penerimaan'),
    amount: z.number().min(100, 'Nominal minimal Rp 100'),
    description: z.string().min(3, 'Keterangan minimal 3 karakter'),
    parent_transaction_id: z.string().uuid().optional().nullable().or(z.literal('')),
    special_fund_id: z.string().uuid().optional().nullable().or(z.literal('')),
});

export type KasMasukInput = z.infer<typeof KasMasukSchema>;