import { useState } from 'react';
import { FileSpreadsheet, FileText, Printer, Search, Calendar, Loader2 } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { useLaporanKeuangan } from '../hooks/useLaporanKeuangan';
import { LaporanBKU } from '../components/LaporanBKU';
import { LaporanArusKas } from '../components/LaporanArusKas';
import { LaporanRealisasi } from '../components/LaporanRealisasi';

type ReportType = 'BKU' | 'ARUS_KAS' | 'REALISASI';

const LaporanPage = () => {
    const [activeTab, setActiveTab] = useState<ReportType>('BKU');
    const [isExporting, setIsExporting] = useState(false);
    const [search, setSearch] = useState('');

    // Call the Information Expert hook to retrieve memoized report states
    const {
        bkuData,
        totalMasuk,
        totalKeluar,
        endingSaldo,
        arusKasSummary,
        realisasiSummary,
    } = useLaporanKeuangan(search);

    const handleExport = (format: 'PDF' | 'EXCEL') => {
        setIsExporting(true);
        // Simulate async export processing
        setTimeout(() => {
            setIsExporting(false);
            alert(`Berhasil mengekspor Laporan dalam format ${format}`);
        }, 1500);
    };

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
                    onClick={() => {
                        setActiveTab('BKU');
                        setSearch('');
                    }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'BKU' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Buku Kas Umum
                </button>
                <button
                    onClick={() => {
                        setActiveTab('ARUS_KAS');
                        setSearch('');
                    }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ARUS_KAS' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Arus Kas
                </button>
                <button
                    onClick={() => {
                        setActiveTab('REALISASI');
                        setSearch('');
                    }}
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
                        <option>Mei 2025</option>
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
                    Status: <span className="text-emerald-600 font-black">Data Final</span>
                </div>
            </Card>

            {/* Report Table Area */}
            <Card className="p-0 overflow-hidden shadow-xl border-gray-200">
                <div className="p-8 bg-white print:p-0">
                    {/* Header Laporan */}
                    <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
                        <h1 className="text-2xl font-black uppercase tracking-wide">KEUSKUPAN AGUNG MERAUKE</h1>
                        <h2 className="text-xl font-bold uppercase text-slate-800">Paroki St. Stefanus - Sempan</h2>
                        <p className="text-sm text-gray-600">Tahun Anggaran: 2025</p>
                        <div className="mt-4 inline-block bg-slate-900 text-white px-4 py-1.5 text-xs font-bold rounded">
                            {activeTab === 'BKU' ? 'LAPORAN BUKU KAS UMUM' : activeTab === 'ARUS_KAS' ? 'LAPORAN ARUS KAS' : 'LAPORAN REALISASI ANGGARAN'}
                        </div>
                    </div>

                    {/* Sub Report Render Switcher */}
                    {activeTab === 'BKU' && (
                        <LaporanBKU
                            records={bkuData}
                            totalMasuk={totalMasuk}
                            totalKeluar={totalKeluar}
                            endingSaldo={endingSaldo}
                        />
                    )}

                    {activeTab === 'ARUS_KAS' && (
                        <LaporanArusKas summary={arusKasSummary} />
                    )}

                    {activeTab === 'REALISASI' && (
                        <LaporanRealisasi realisations={realisasiSummary} />
                    )}

                    {/* Tanda Tangan */}
                    <div className="mt-12 grid grid-cols-3 gap-8 text-center text-sm invisible print:visible">
                        <div>
                            <p className="mb-16">Mengetahui,</p>
                            <p className="font-bold border-b border-black inline-block px-4">RP. Johannes Surono</p>
                            <p className="text-xs text-gray-500 mt-1">Pastor Paroki</p>
                        </div>
                        <div></div>
                        <div>
                            <p className="mb-16">Sempan, 20 Mei 2025</p>
                            <p className="font-bold border-b border-black inline-block px-4">Yuliana Shanti</p>
                            <p className="text-xs text-gray-500 mt-1">Bendahara Paroki</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LaporanPage;