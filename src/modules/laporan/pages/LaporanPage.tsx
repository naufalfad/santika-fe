import { useState } from 'react';
import { FileSpreadsheet, FileText, Printer, Search, Calendar, Loader2 } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { useLaporanKeuangan } from '../hooks/useLaporanKeuangan';
import { LaporanBKU } from '../components/LaporanBKU';
import { LaporanArusKas } from '../components/LaporanArusKas';
import { LaporanRealisasi } from '../components/LaporanRealisasi';

type ReportType = 'BKU' | 'ARUS_KAS' | 'REALISASI';

/**
 * Standardized High-Density Financial Report Page.
 * Implements Controller pattern delegating complex maths to useLaporanKeuangan hook.
 * Uses flat, seamless, sharp-edge visual aesthetics.
 */
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
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header & Export Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Laporan Keuangan</h2>
                    <p className="text-sm text-gray-500">Cetak dan unduh laporan pertanggungjawaban paroki.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs border-slate-200 rounded-none bg-white"
                        onClick={() => handleExport('EXCEL')}
                        disabled={isExporting}
                    >
                        {isExporting ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} className="text-emerald-600" />}
                        Excel
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs border-slate-200 rounded-none bg-white"
                        onClick={() => handleExport('PDF')}
                        disabled={isExporting}
                    >
                        {isExporting ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} className="text-rose-600" />}
                        PDF
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs rounded-none bg-slate-800 hover:bg-slate-900 shadow-none"
                        onClick={() => window.print()}
                    >
                        <Printer size={16} /> Print
                    </Button>
                </div>
            </div>

            {/* Report Type Selector - Sharp Bottom Border Indicator */}
            <div className="flex gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar pb-0 text-sm font-bold text-slate-400">
                <button
                    onClick={() => {
                        setActiveTab('BKU');
                        setSearch('');
                    }}
                    className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${activeTab === 'BKU'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    Buku Kas Umum
                </button>
                <button
                    onClick={() => {
                        setActiveTab('ARUS_KAS');
                        setSearch('');
                    }}
                    className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${activeTab === 'ARUS_KAS'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    Arus Kas
                </button>
                <button
                    onClick={() => {
                        setActiveTab('REALISASI');
                        setSearch('');
                    }}
                    className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${activeTab === 'REALISASI'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    Realisasi Anggaran
                </button>
            </div>

            {/* Filter Toolbar - Flat and Seamless */}
            <Card className="p-4 bg-slate-50 border border-slate-200/60 shadow-none flex flex-col md:flex-row gap-4 items-center rounded-none">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-none w-full md:w-auto">
                    <Calendar size={16} className="text-slate-400" />
                    <select className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer">
                        <option>Mei 2025</option>
                    </select>
                </div>
                {activeTab === 'BKU' && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-none w-full md:w-80 transition-colors focus-within:border-slate-700">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari di laporan..."
                            className="bg-transparent text-xs outline-none w-full font-semibold text-slate-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}
                <div className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status: <span className="text-emerald-600 font-black">Data Final</span>
                </div>
            </Card>

            {/* Report Table Area - Print Optimized */}
            <Card className="p-0 overflow-hidden shadow-sm border border-slate-200 rounded-none">
                <div className="p-8 bg-white print:p-0">
                    {/* Header Laporan */}
                    <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
                        <h1 className="text-xl font-black uppercase tracking-widest text-slate-900">KEUSKUPAN AGUNG MERAUKE</h1>
                        <h2 className="text-lg font-bold uppercase text-slate-700 mt-1">Paroki St. Stefanus - Sempan</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1">Tahun Anggaran: 2025</p>
                        <div className="mt-5 inline-block bg-slate-900 text-white px-4 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-none">
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
                    <div className="mt-16 grid grid-cols-3 gap-8 text-center text-sm invisible print:visible">
                        <div>
                            <p className="mb-20 text-xs font-semibold text-slate-600">Mengetahui,</p>
                            <p className="font-bold border-b border-slate-800 inline-block px-6 pb-1">RP. Johannes Surono</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Pastor Paroki</p>
                        </div>
                        <div></div>
                        <div>
                            <p className="mb-20 text-xs font-semibold text-slate-600">Sempan, 20 Mei 2025</p>
                            <p className="font-bold border-b border-slate-800 inline-block px-6 pb-1">Yuliana Shanti</p>
                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Bendahara Paroki</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LaporanPage;