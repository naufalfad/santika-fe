import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Printer, Search, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MOCK_BKU } from '../../mock/laporanData';

type ReportType = 'BKU' | 'ARUS_KAS' | 'REALISASI';

const LaporanPage = () => {
    const [activeTab, setActiveTab] = useState<ReportType>('BKU');
    const [isExporting, setIsExporting] = useState(false);

    const formatIDR = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const handleExport = (format: 'PDF' | 'EXCEL') => {
        setIsExporting(true);
        // Simulasi proses export selama 2 detik
        setTimeout(() => {
            setIsExporting(false);
            alert(`Berhasil mengekspor Laporan dalam format ${format}`);
        }, 2000);
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
                        <option>Februari 2024</option>
                        <option>Januari 2024</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 border rounded-lg w-full md:w-auto">
                    <Search size={18} className="text-gray-400" />
                    <input type="text" placeholder="Cari di laporan..." className="bg-transparent text-sm outline-none w-full" />
                </div>
                <div className="ml-auto flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Status: <span className="text-emerald-600">Data Final</span>
                </div>
            </Card>

            {/* Report Table Area */}
            <Card className="p-0 overflow-hidden shadow-xl border-gray-200">
                <div className="p-8 bg-white print:p-0">
                    {/* Company Header (Hanya muncul di print/laporan formal) */}
                    <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
                        <h1 className="text-2xl font-black uppercase">Keuskupan Agung Jakarta</h1>
                        <h2 className="text-xl font-bold uppercase">Paroki St. Maria Regina</h2>
                        <p className="text-sm text-gray-600">Jl. Menteng Raya No. 1, Jakarta Pusat</p>
                        <div className="mt-4 inline-block bg-slate-900 text-white px-4 py-1 text-xs font-bold rounded">
                            {activeTab === 'BKU' ? 'LAPORAN BUKU KAS UMUM' : activeTab === 'ARUS_KAS' ? 'LAPORAN ARUS KAS' : 'LAPORAN REALISASI ANGGARAN'}
                        </div>
                        <p className="mt-2 text-sm font-medium">Periode: 01 Maret 2024 - 31 Maret 2024</p>
                    </div>

                    {/* Table Content */}
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
                                {MOCK_BKU.map((item, idx) => (
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
                                    <td colSpan={4} className="p-4 text-right uppercase tracking-wider">Total Mutasi Bulan Ini</td>
                                    <td className="p-4 text-right text-emerald-400">{formatIDR(15500000)}</td>
                                    <td className="p-4 text-right text-rose-400">{formatIDR(3050000)}</td>
                                    <td className="p-4 text-right bg-slate-800 underline decoration-double underline-offset-4">{formatIDR(1212450000)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Signature Area (Hanya muncul saat diprint) */}
                    <div className="mt-12 grid grid-cols-3 gap-8 text-center text-sm invisible print:visible">
                        <div>
                            <p className="mb-16">Mengetahui,</p>
                            <p className="font-bold border-b border-black inline-block px-4">RP. Johannes Surono</p>
                            <p className="text-xs">Pastor Paroki</p>
                        </div>
                        <div></div>
                        <div>
                            <p className="mb-16">Jakarta, 31 Maret 2024</p>
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