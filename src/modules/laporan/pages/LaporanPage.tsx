import { useState } from 'react';
import { FileSpreadsheet, FileText, Printer, Search, Calendar, Loader2 } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { useKasStore } from '../../../app/store/useKasStore';

type ReportType = 'BKU' | 'ARUS_KAS' | 'REALISASI';

const LaporanPage = () => {
    const kasMasuk = useKasStore((state) => state.kasMasuk);
    const kasKeluar = useKasStore((state) => state.kasKeluar);

    const [activeTab, setActiveTab] = useState<ReportType>('BKU');
    const [isExporting, setIsExporting] = useState(false);
    const [search, setSearch] = useState('');

    const formatIDR = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const handleExport = (format: 'PDF' | 'EXCEL') => {
        setIsExporting(true);
        // Simulate export process
        setTimeout(() => {
            setIsExporting(false);
            alert(`Berhasil mengekspor Laporan dalam format ${format}`);
        }, 1500);
    };

    // ----------------------------------------------------
    // 1. DATA PREPARATION: BUKU KAS UMUM (BKU)
    // ----------------------------------------------------
    let runningSaldo = 1200000000; // Saldo awal Rp 1.200.000.000
    const bkuData = [
        ...kasMasuk.map(item => ({ ...item, type: 'in' as const })),
        ...kasKeluar.map(item => ({ ...item, type: 'out' as const }))
    ]
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
    .map(item => {
        const masuk = item.type === 'in' ? item.jumlah : 0;
        const keluar = item.type === 'out' ? item.jumlah : 0;
        runningSaldo = runningSaldo + masuk - keluar;
        return {
            id: item.id,
            tanggal: item.tanggal,
            keterangan: item.type === 'in' 
                ? `${item.sumber} - ${item.keterangan}` 
                : `${item.penerima} - ${item.kategori}`,
            ref: item.id,
            masuk,
            keluar,
            saldo: runningSaldo
        };
    });

    const filteredBKU = bkuData.filter(item => 
        item.keterangan.toLowerCase().includes(search.toLowerCase()) ||
        item.ref.toLowerCase().includes(search.toLowerCase())
    );

    const totalMasuk = filteredBKU.reduce((sum, i) => sum + i.masuk, 0);
    const totalKeluar = filteredBKU.reduce((sum, i) => sum + i.keluar, 0);
    const endingSaldo = filteredBKU[filteredBKU.length - 1]?.saldo || 1200000000;

    // ----------------------------------------------------
    // 2. DATA PREPARATION: ARUS KAS
    // ----------------------------------------------------
    const inboundKolekte = 25000000 + kasMasuk.filter(i => i.kategori === 'Kolekte').reduce((sum, i) => sum + i.jumlah, 0);
    const inboundDonasi = 15000000 + kasMasuk.filter(i => i.kategori === 'Donasi').reduce((sum, i) => sum + i.jumlah, 0);
    const inboundPembangunan = 10000000 + kasMasuk.filter(i => i.kategori === 'Pembangunan').reduce((sum, i) => sum + i.jumlah, 0);
    const inboundLainnya = 2000000 + kasMasuk.filter(i => i.kategori === 'Lainnya' || i.kategori === 'Persembahan').reduce((sum, i) => sum + i.jumlah, 0);
    
    const outboundOperasional = 8000000 + kasKeluar.filter(i => i.kategori === 'Operasional').reduce((sum, i) => sum + i.jumlah, 0);
    const outboundLiturgi = 3500000 + kasKeluar.filter(i => i.kategori === 'Liturgi').reduce((sum, i) => sum + i.jumlah, 0);
    const outboundKegiatan = 2000000 + kasKeluar.filter(i => i.kategori === 'Kegiatan' || i.kategori === 'Kegiatan Komisi').reduce((sum, i) => sum + i.jumlah, 0);
    
    const totalPenerimaanKas = inboundKolekte + inboundDonasi + inboundPembangunan + inboundLainnya;
    const totalPengeluaranKas = outboundOperasional + outboundLiturgi + outboundKegiatan;
    const kenaikanBersihKas = totalPenerimaanKas - totalPengeluaranKas;

    // ----------------------------------------------------
    // 3. DATA PREPARATION: REALISASI ANGGARAN
    // ----------------------------------------------------
    const BUDGET_CATEGORIES = [
        { id: 1, nama: 'Pastoral & Liturgi', anggaran: 120000000, baseRealisasi: 68000000, matchKategori: 'Liturgi' },
        { id: 2, nama: 'Pendidikan Iman', anggaran: 80000000, baseRealisasi: 32000000, matchKategori: 'Kegiatan Komisi' },
        { id: 3, nama: 'Sosial (PSE)', anggaran: 60000000, baseRealisasi: 28000000, matchKategori: 'Sosial' },
        { id: 4, nama: 'Sarana & Prasarana', anggaran: 100000000, baseRealisasi: 45000000, matchKategori: 'Pembangunan' },
        { id: 5, nama: 'Administrasi & Ops', anggaran: 40000000, baseRealisasi: 18000000, matchKategori: 'Operasional' },
    ];

    const budgetData = BUDGET_CATEGORIES.map(cat => {
        const currentSum = kasKeluar
            .filter(i => i.kategori.toLowerCase() === cat.matchKategori.toLowerCase())
            .reduce((sum, i) => sum + i.jumlah, 0);
        const realisasi = cat.baseRealisasi + currentSum;
        const sisa = cat.anggaran - realisasi;
        const persen = (realisasi / cat.anggaran) * 100;
        return {
            ...cat,
            realisasi,
            sisa,
            persen
        };
    });

    return (
        <div className="space-y-6">
            {/* Header & Export Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Laporan Keuangan</h2>
                    <p className="text-gray-500">Cetak dan unduh laporan pertanggungjawaban paroki.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        className="flex-1 md:flex-none flex items-center gap-2"
                        onClick={() => handleExport('EXCEL')}
                        disabled={isExporting}
                    >
                        {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} className="text-emerald-600" />}
                        Excel
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 md:flex-none flex items-center gap-2"
                        onClick={() => handleExport('PDF')}
                        disabled={isExporting}
                    >
                        {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} className="text-rose-600" />}
                        PDF
                    </Button>
                    <Button variant="secondary" className="flex-1 md:flex-none flex items-center gap-2" onClick={() => window.print()}>
                        <Printer size={18} /> Print
                    </Button>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-fit">
                <button
                    onClick={() => setActiveTab('BKU')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'BKU' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Buku Kas Umum
                </button>
                <button
                    onClick={() => setActiveTab('ARUS_KAS')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ARUS_KAS' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Arus Kas
                </button>
                <button
                    onClick={() => setActiveTab('REALISASI')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'REALISASI' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Realisasi Anggaran
                </button>
            </div>

            {/* Filter Toolbar */}
            <Card className="p-4 bg-slate-50 border-none flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 bg-white px-3 py-2 border rounded-lg w-full md:w-auto">
                    <Calendar size={18} className="text-gray-400" />
                    <select className="bg-transparent text-sm font-medium outline-none">
                        <option>Maret 2024</option>
                    </select>
                </div>
                {activeTab === 'BKU' && (
                    <div className="flex items-center gap-2 bg-white px-3 py-2 border rounded-lg w-full md:w-auto">
                        <Search size={18} className="text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari di laporan..." 
                            className="bg-transparent text-sm outline-none w-full" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}
                <div className="ml-auto flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Status: <span className="text-emerald-600">Data Final</span>
                </div>
            </Card>

            {/* Report Table Area */}
            <Card className="p-0 overflow-hidden shadow-xl border-gray-200">
                <div className="p-8 bg-white print:p-0">
                    {/* Header Laporan */}
                    <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
                        <h1 className="text-2xl font-black uppercase">KEUSKUPAN AGUNG MERAUKE</h1>
                        <h2 className="text-xl font-bold uppercase">Paroki St. Stefanus - Sempan</h2>
                        <p className="text-sm text-gray-600">Tahun Anggaran: 2025</p>
                        <div className="mt-4 inline-block bg-slate-900 text-white px-4 py-1 text-xs font-bold rounded">
                            {activeTab === 'BKU' ? 'LAPORAN BUKU KAS UMUM' : activeTab === 'ARUS_KAS' ? 'LAPORAN ARUS KAS' : 'LAPORAN REALISASI ANGGARAN'}
                        </div>
                    </div>

                    {/* 1. BUKU KAS UMUM */}
                    {activeTab === 'BKU' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-800 text-[11px] font-black uppercase border border-gray-300">
                                        <th className="p-3 border border-gray-300">No</th>
                                        <th className="p-3 border border-gray-300">Tanggal</th>
                                        <th className="p-3 border border-gray-300">Keterangan</th>
                                        <th className="p-3 border border-gray-300 text-center">Ref</th>
                                        <th className="p-3 border border-gray-300 text-right">Masuk (Dr)</th>
                                        <th className="p-3 border border-gray-300 text-right">Keluar (Cr)</th>
                                        <th className="p-3 border border-gray-300 text-right bg-slate-200">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBKU.map((item, idx) => (
                                        <tr key={item.id} className="text-sm border border-gray-300 hover:bg-gray-50">
                                            <td className="p-3 border border-gray-300 text-center text-gray-500">{idx + 1}</td>
                                            <td className="p-3 border border-gray-300 whitespace-nowrap">{item.tanggal}</td>
                                            <td className="p-3 border border-gray-300 font-medium">{item.keterangan}</td>
                                            <td className="p-3 border border-gray-300 text-center font-mono text-xs text-blue-600">{item.ref}</td>
                                            <td className="p-3 border border-gray-300 text-right text-emerald-600 font-semibold">
                                                {item.masuk > 0 ? formatIDR(item.masuk) : '-'}
                                            </td>
                                            <td className="p-3 border border-gray-300 text-right text-rose-600 font-semibold">
                                                {item.keluar > 0 ? formatIDR(item.keluar) : '-'}
                                            </td>
                                            <td className="p-3 border border-gray-300 text-right font-black bg-slate-50">
                                                {formatIDR(item.saldo)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-900 text-white font-bold">
                                        <td colSpan={4} className="p-4 text-right uppercase tracking-wider">Total Mutasi Periode Ini</td>
                                        <td className="p-4 text-right text-emerald-400">{formatIDR(totalMasuk)}</td>
                                        <td className="p-4 text-right text-rose-400">{formatIDR(totalKeluar)}</td>
                                        <td className="p-4 text-right bg-slate-800 underline decoration-double underline-offset-4">{formatIDR(endingSaldo)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* 2. ARUS KAS */}
                    {activeTab === 'ARUS_KAS' && (
                        <div className="overflow-x-auto space-y-6">
                            <table className="w-full text-left border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-800 text-[12px] font-black uppercase border border-gray-300">
                                        <th className="p-4 border border-gray-300">Aktivitas Arus Kas</th>
                                        <th className="p-4 border border-gray-300 text-right">Jumlah (IDR)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {/* MASUK */}
                                    <tr className="bg-slate-50 font-bold border-t border-gray-300">
                                        <td className="p-3 pl-4">Arus Kas Masuk (Penerimaan)</td>
                                        <td className="p-3 text-right"></td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 pl-8 text-gray-600">Penerimaan Kolekte</td>
                                        <td className="p-3 text-right text-emerald-600 font-medium">{formatIDR(inboundKolekte)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 pl-8 text-gray-600">Penerimaan Donasi / Aksi Sosial</td>
                                        <td className="p-3 text-right text-emerald-600 font-medium">{formatIDR(inboundDonasi)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 pl-8 text-gray-600">Dana Pembangunan Altar / Gedung</td>
                                        <td className="p-3 text-right text-emerald-600 font-medium">{formatIDR(inboundPembangunan)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 pl-8 text-gray-600">Persembahan & Pendapatan Lain-lain</td>
                                        <td className="p-3 text-right text-emerald-600 font-medium">{formatIDR(inboundLainnya)}</td>
                                    </tr>
                                    <tr className="font-bold border-b bg-emerald-50 text-emerald-800">
                                        <td className="p-3 pl-4">Total Penerimaan Kas</td>
                                        <td className="p-3 text-right">{formatIDR(totalPenerimaanKas)}</td>
                                    </tr>

                                    {/* KELUAR */}
                                    <tr className="bg-slate-50 font-bold border-t border-gray-300">
                                        <td className="p-3 pl-4">Arus Kas Keluar (Pengeluaran)</td>
                                        <td className="p-3 text-right"></td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 pl-8 text-gray-600">Pengeluaran Administrasi & Operasional Kantor</td>
                                        <td className="p-3 text-right text-rose-600 font-medium">{formatIDR(outboundOperasional)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 pl-8 text-gray-600">Pengeluaran Liturgi & Perayaan Hari Raya</td>
                                        <td className="p-3 text-right text-rose-600 font-medium">{formatIDR(outboundLiturgi)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 pl-8 text-gray-600">Belanja Kegiatan Komisi & Pembinaan Iman</td>
                                        <td className="p-3 text-right text-rose-600 font-medium">{formatIDR(outboundKegiatan)}</td>
                                    </tr>
                                    <tr className="font-bold border-b bg-rose-50 text-rose-800">
                                        <td className="p-3 pl-4">Total Pengeluaran Kas</td>
                                        <td className="p-3 text-right">{formatIDR(totalPengeluaranKas)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-900 text-white font-bold text-base">
                                        <td className="p-4 pl-4 uppercase">Kenaikan / (Penurunan) Bersih Kas</td>
                                        <td className="p-4 text-right underline decoration-double underline-offset-4">
                                            {formatIDR(kenaikanBersihKas)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* 3. REALISASI ANGGARAN */}
                    {activeTab === 'REALISASI' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-800 text-[11px] font-black uppercase border border-gray-300">
                                        <th className="p-3 border border-gray-300">Pos Anggaran</th>
                                        <th className="p-3 border border-gray-300 text-right">Plafon Anggaran</th>
                                        <th className="p-3 border border-gray-300 text-right">Realisasi Pengeluaran</th>
                                        <th className="p-3 border border-gray-300 text-center">Serapan (%)</th>
                                        <th className="p-3 border border-gray-300 text-right">Sisa Pagu</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {budgetData.map((item) => (
                                        <tr key={item.id} className="border border-gray-300 hover:bg-gray-50">
                                            <td className="p-3 border border-gray-300 font-semibold text-slate-700">{item.nama}</td>
                                            <td className="p-3 border border-gray-300 text-right">{formatIDR(item.anggaran)}</td>
                                            <td className="p-3 border border-gray-300 text-right text-rose-600 font-semibold">{formatIDR(item.realisasi)}</td>
                                            <td className="p-3 border border-gray-300 text-center font-bold">
                                                <span className={`px-2 py-0.5 rounded text-xs ${item.persen > 80 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                    {Math.round(item.persen)}%
                                                </span>
                                            </td>
                                            <td className="p-3 border border-gray-300 text-right text-emerald-600 font-bold bg-slate-50">{formatIDR(item.sisa)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-900 text-white font-bold">
                                        <td className="p-4 uppercase">Total Pagu Anggaran Paroki</td>
                                        <td className="p-4 text-right">{formatIDR(budgetData.reduce((s, i) => s + i.anggaran, 0))}</td>
                                        <td className="p-4 text-right text-rose-300">{formatIDR(budgetData.reduce((s, i) => s + i.realisasi, 0))}</td>
                                        <td className="p-4 text-center">
                                            {Math.round((budgetData.reduce((s, i) => s + i.realisasi, 0) / budgetData.reduce((s, i) => s + i.anggaran, 0)) * 100)}%
                                        </td>
                                        <td className="p-4 text-right bg-slate-800 text-emerald-400">{formatIDR(budgetData.reduce((s, i) => s + i.sisa, 0))}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* Tanda Tangan */}
                    <div className="mt-12 grid grid-cols-3 gap-8 text-center text-sm invisible print:visible">
                        <div>
                            <p className="mb-16">Mengetahui,</p>
                            <p className="font-bold border-b border-black inline-block px-4">RP. Johannes Surono</p>
                            <p className="text-xs">Pastor Paroki</p>
                        </div>
                        <div></div>
                        <div>
                            <p className="mb-16">Sempan, 20 Mei 2025</p>
                            <p className="font-bold border-b border-black inline-block px-4">Yuliana Shanti</p>
                            <p className="text-xs">Bendahara Paroki</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LaporanPage;