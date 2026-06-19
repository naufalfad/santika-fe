import { formatIDR } from '../../utils/formatter';
import { cn } from '../../utils/cn';

export interface LedgerItem {
    /** Nama kategori atau nama pos dana */
    name: string;
    /** Nilai rupiah absolut */
    value: number;
    /** Nilai kontribusi persentase terhadap total keseluruhan */
    percentage: number;
    /** Warna representasi berkode heksadesimal atau kelas Tailwind */
    color: string;
}

interface MiniLedgerProps {
    /** Kumpulan data item legenda yang akan ditampilkan */
    items: LedgerItem[];
    /** Pengaturan batas tinggi scroll kontainer untuk mengantisipasi kategori yang meluap */
    maxHeightClass?: string;
    /** Kelas CSS tambahan kustom */
    className?: string;
}

/**
 * GRASP: Information Expert
 * MiniLedger memegang tanggung jawab penuh atas pemformatan data baris legenda paroki.
 *
 * DESIGN SYSTEM GUARD:
 * - `rounded-none` secara ketat pada kotak indikator warna dan bar progress mikro.
 * - Menggunakan font monospace untuk menyelaraskan digit numerik IDR di kolom kanan.
 * - Pembatas baris satu sisi menggunakan `divide-y divide-slate-100` untuk menghindari "box-inside-box".
 */
export const MiniLedger = ({
    items,
    maxHeightClass = 'max-h-[320px]',
    className,
}: MiniLedgerProps) => {
    const hasItems = items && items.length > 0;

    return (
        <div className={cn('w-full', className)}>
            {hasItems ? (
                <div className={cn('overflow-y-auto pr-1 space-y-0.5 divide-y divide-slate-100/80', maxHeightClass)}>
                    {items.map((item, index) => {
                        const formattedPercent = Math.round(item.percentage);

                        return (
                            <div
                                key={`${item.name}-${index}`}
                                className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1.5 transition-colors duration-100 hover:bg-slate-50/40"
                            >
                                {/* Baris Utama: Teks Identitas dan Nilai Mutasi */}
                                <div className="flex justify-between items-center text-xs font-semibold">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {/* Indikator Warna Tajam (DESIGN SYSTEM GUARD: rounded-none) */}
                                        <span
                                            className="w-2.5 h-2.5 shrink-0 rounded-none inline-block"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        {/* Nama Pos / Kategori */}
                                        <span className="text-slate-700 font-semibold truncate max-w-[150px] lg:max-w-[200px]" title={item.name}>
                                            {item.name}
                                        </span>
                                        {/* Persentase Ringkas */}
                                        <span className="text-slate-400 font-semibold text-[10px] shrink-0">
                                            ({formattedPercent}%)
                                        </span>
                                    </div>

                                    {/* Nominal Rupiah Riil (Format Monospace untuk Perataan Sempurna) */}
                                    <span className="text-slate-800 font-mono font-bold tracking-tight shrink-0 pl-4">
                                        {formatIDR(item.value)}
                                    </span>
                                </div>

                                {/* Baris Kedua: Mikro Progress Bar Horisontal (DESIGN SYSTEM GUARD: rounded-none) */}
                                <div className="w-full bg-slate-100 h-0.5 rounded-none overflow-hidden">
                                    <div
                                        className="h-full rounded-none transition-all duration-500 ease-out"
                                        style={{
                                            width: `${Math.min(item.percentage, 100)}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-6 text-center text-slate-400 text-[11px] font-semibold">
                    Tidak ada data legenda untuk ditampilkan.
                </div>
            )}
        </div>
    );
};