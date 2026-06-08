import React, { useState } from 'react';
import {
    CheckCircle2, XCircle, Clock, Download, Eye,
    Search, Filter, ChevronRight, Gift, Users, FileText,
    Wallet, BarChart3, ShieldCheck, ArrowLeft, MoreVertical
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MOCK_APPROVALS } from '../../mock/approvalData';
import type { ApprovalRequest } from '../../mock/approvalData';
import { cn } from '../../utils/cn';

const ApprovalPage = () => {
    const [selected, setSelected] = useState<ApprovalRequest>(MOCK_APPROVALS[0]);
    const [showMobileDetail, setShowMobileDetail] = useState(false);

    const formatIDR = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">

            {/* HEADER SECTION - Responsive Stack */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">Persetujuan Pengeluaran</h2>
                    <p className="text-xs md:text-sm text-gray-500">Paroki St. Stefanus - Sempan</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm">
                        <Filter size={14} className="text-slate-400" />
                        <select className="outline-none bg-transparent w-full">
                            <option>Semua Komisi</option>
                        </select>
                    </div>
                    <div className="flex-1 sm:flex-none flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm">
                        <Clock size={14} className="text-slate-400" />
                        <span>Mei 2025</span>
                    </div>
                </div>
            </div>

            {/* TAB NAVIGATION - Scrollable on Mobile */}
            <div className="flex gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1 text-xs md:text-sm font-bold text-gray-400">
                <button className="pb-3 border-b-2 border-blue-600 text-blue-600 whitespace-nowrap">
                    Menunggu <span className="ml-1 px-2 py-0.5 bg-blue-50 rounded-full text-[10px]">4</span>
                </button>
                <button className="pb-3 hover:text-slate-600 whitespace-nowrap">Disetujui</button>
                <button className="pb-3 hover:text-slate-600 whitespace-nowrap">Ditolak</button>
                <button className="pb-3 hover:text-slate-600 whitespace-nowrap">Selesai</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* LEFT COLUMN: LIST (Hidden on Mobile if Detail is shown) */}
                <div className={cn(
                    "lg:col-span-4 space-y-4",
                    showMobileDetail ? "hidden lg:block" : "block"
                )}>
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Daftar Pengajuan</h3>
                        <span className="text-[10px] text-slate-400 italic">4 Pengajuan</span>
                    </div>

                    <div className="space-y-3">
                        {MOCK_APPROVALS.map((item) => (
                            <Card
                                key={item.id}
                                className={cn(
                                    "p-4 cursor-pointer transition-all duration-200 border-l-4",
                                    selected.id === item.id
                                        ? "border-l-blue-600 bg-blue-50/20 shadow-md ring-1 ring-blue-100"
                                        : "border-l-transparent hover:bg-white hover:shadow-sm"
                                )}
                                onClick={() => {
                                    setSelected(item);
                                    setShowMobileDetail(true);
                                }}
                            >
                                <div className="flex gap-4">
                                    {/* Icon with soft background */}
                                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl h-fit border border-indigo-100">
                                        <Gift size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="text-sm font-bold text-slate-800 leading-snug truncate">{item.judul}</h4>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.komisi}</p>

                                        <div className="flex justify-between items-end mt-4">
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{formatIDR(item.nominal)}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{item.tanggal}</p>
                                            </div>
                                            <Badge variant="warning" className="text-[9px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-tighter">
                                                Menunggu
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: DETAIL (Full Screen on Mobile if shown) */}
                <div className={cn(
                    "lg:col-span-8",
                    !showMobileDetail ? "hidden lg:block" : "block"
                )}>
                    {/* Back Button for Mobile */}
                    <button
                        onClick={() => setShowMobileDetail(false)}
                        className="lg:hidden flex items-center gap-2 text-blue-600 font-bold text-sm mb-4"
                    >
                        <ArrowLeft size={18} /> Kembali ke Daftar
                    </button>

                    <Card className="overflow-hidden border-slate-200 shadow-xl shadow-slate-200/50">
                        {/* Detail Header */}
                        <div className="p-4 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
                                <div className="flex gap-4 md:gap-6">
                                    <div className="hidden md:block p-5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 shadow-sm h-fit">
                                        <Gift size={36} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase">Liturgi</span>
                                            <span className="text-[10px] text-slate-400 font-mono tracking-tighter">{selected.id}</span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">{selected.judul}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 pt-2 text-[12px]">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><Users size={12} /></div>
                                                <span className="font-semibold">{selected.pemohon}</span>
                                                <span className="text-slate-400 text-[10px] uppercase">({selected.jabatanPemohon})</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><Clock size={12} /></div>
                                                <span className="font-semibold">{selected.tanggal} • {selected.waktu}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto">
                                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center md:text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nominal Pengajuan</p>
                                        <p className="text-2xl font-black text-blue-700 leading-none">{formatIDR(selected.nominal)}</p>
                                        <div className="flex items-center justify-center md:justify-end gap-1 mt-3 text-slate-400">
                                            <FileText size={12} />
                                            <span className="text-[10px] font-bold">5 Lampiran Dokumen</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Budget Stats - Responsive Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 my-8">
                                {[
                                    { label: 'Anggaran Program', val: selected.anggaranProgram, icon: Wallet, color: 'blue' },
                                    { label: 'Total Realisasi', val: selected.totalRealisasi, icon: BarChart3, color: 'emerald' },
                                    { label: 'Sisa Anggaran', val: selected.sisaAnggaran, icon: ShieldCheck, color: 'amber' },
                                    { label: 'Pengajuan Ini', val: selected.nominal, icon: Gift, color: 'purple' },
                                ].map((stat, i) => (
                                    <div key={i} className={cn(
                                        "p-3 rounded-2xl border flex flex-col justify-between h-24",
                                        `bg-${stat.color}-50/30 border-${stat.color}-100`
                                    )}>
                                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", `bg-${stat.color}-600 shadow-sm`)}>
                                            <stat.icon size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter truncate">{stat.label}</p>
                                            <p className="text-[13px] font-black text-slate-800">{formatIDR(stat.val)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Two Columns Section - Stack on Mobile */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                {/* Documents */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <FileText size={16} className="text-slate-400" />
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Dokumen Pendukung</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {selected.dokumen.map((doc, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white group hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-slate-50 text-slate-400 rounded group-hover:text-blue-500 transition-colors"><FileText size={14} /></div>
                                                    <span className="text-[11px] font-bold text-slate-600 truncate max-w-[120px] md:max-w-[180px]">{doc.nama}</span>
                                                </div>
                                                <Download size={14} className="text-slate-300 hover:text-blue-600" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <ShieldCheck size={16} className="text-slate-400" />
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Alur Persetujuan</h4>
                                    </div>
                                    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                        {selected.alur.map((a, i) => (
                                            <div key={i} className="relative">
                                                <div className={cn(
                                                    "absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                                                    a.status === 'done' ? "bg-emerald-500" : a.status === 'active' ? "bg-blue-600 ring-4 ring-blue-50" : "bg-slate-200"
                                                )}></div>
                                                <div className="flex justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-bold text-slate-800 truncate">{a.step}</p>
                                                        <p className="text-[10px] text-slate-500 truncate">{a.pic}</p>
                                                    </div>
                                                    <p className="text-[9px] font-medium text-slate-400 text-right whitespace-nowrap">{a.tanggal}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - Sticky on Mobile */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-12 pt-6 border-t border-slate-100">
                                <Button variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl py-6 font-bold flex justify-center items-center gap-2">
                                    <XCircle size={20} /> Tolak
                                </Button>
                                <Button variant="outline" className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-50 rounded-xl py-6 font-bold flex justify-center items-center gap-2">
                                    <FileText size={20} /> Revisi
                                </Button>
                                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 rounded-xl py-6 font-bold flex justify-center items-center gap-2 transition-all active:scale-95">
                                    <CheckCircle2 size={20} /> Setujui
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ApprovalPage;