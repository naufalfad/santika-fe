import { useKasStore } from '../../../app/store/useKasStore';

export const BudgetSummary = () => {
    const kasKeluar = useKasStore((state) => state.kasKeluar);
    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const BUDGET_CATEGORIES = [
        { id: 1, nama: 'Pastoral & Liturgi', anggaran: 120000000, baseRealisasi: 68000000, matchKategori: 'Liturgi' },
        { id: 2, nama: 'Pendidikan Iman', anggaran: 80000000, baseRealisasi: 32000000, matchKategori: 'Kegiatan Komisi' },
        { id: 3, nama: 'Sosial (PSE)', anggaran: 60000000, baseRealisasi: 28000000, matchKategori: 'Sosial' },
        { id: 4, nama: 'Sarana & Prasarana', anggaran: 100000000, baseRealisasi: 45000000, matchKategori: 'Pembangunan' },
        { id: 5, nama: 'Administrasi', anggaran: 40000000, baseRealisasi: 18000000, matchKategori: 'Operasional' },
    ];

    const budgetSummary = BUDGET_CATEGORIES.map((cat) => {
        const currentSum = kasKeluar
            .filter((item) => item.kategori.toLowerCase() === cat.matchKategori.toLowerCase())
            .reduce((sum, item) => sum + item.jumlah, 0);
        const realisasi = cat.baseRealisasi + currentSum;
        const sisa = cat.anggaran - realisasi;
        const persen = Math.round((realisasi / cat.anggaran) * 100);
        return {
            id: cat.id,
            nama: cat.nama,
            anggaran: cat.anggaran,
            realisasi,
            sisa,
            persen
        };
    });

    const totalAnggaran = budgetSummary.reduce((sum, i) => sum + i.anggaran, 0);
    const totalRealisasi = budgetSummary.reduce((sum, i) => sum + i.realisasi, 0);
    const totalSisa = totalAnggaran - totalRealisasi;
    const totalPersen = Math.round((totalRealisasi / totalAnggaran) * 100);

    return (
        <div className="overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 tracking-tight">Ringkasan Anggaran Tahun 2025</h3>
            <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                        <th className="pb-3 font-bold">Program / Kegiatan</th>
                        <th className="pb-3 text-right">Anggaran</th>
                        <th className="pb-3 text-right">Realisasi</th>
                        <th className="pb-3 text-right">Sisa Anggaran</th>
                        <th className="pb-3 text-center w-24">%</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {budgetSummary.map((item) => (
                        <tr key={item.id} className="text-[11px] hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-bold text-slate-700">{item.id}. {item.nama}</td>
                            <td className="py-3 text-right text-slate-500">{formatIDR(item.anggaran)}</td>
                            <td className="py-3 text-right text-slate-500">{formatIDR(item.realisasi)}</td>
                            <td className="py-3 text-right font-bold text-slate-700">{formatIDR(item.sisa)}</td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(item.persen, 100)}%` }}></div>
                                    </div>
                                    <span className="font-bold text-slate-600 w-6 text-right">{item.persen}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="text-[11px] font-black bg-blue-50/50">
                        <td className="py-3 pl-2 text-blue-600 uppercase">Total</td>
                        <td className="py-3 text-right text-blue-600">{formatIDR(totalAnggaran)}</td>
                        <td className="py-3 text-right text-blue-600">{formatIDR(totalRealisasi)}</td>
                        <td className="py-3 text-right text-blue-600">{formatIDR(totalSisa)}</td>
                        <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full" style={{ width: `${Math.min(totalPersen, 100)}%` }}></div>
                                </div>
                                <span className="text-blue-600 w-6 text-right">{totalPersen}%</span>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};