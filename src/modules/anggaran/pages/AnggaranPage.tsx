import { useMemo } from 'react';
import { Target, ShieldAlert, Plus, Calculator } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { MOCK_ANGGARAN, MOCK_DANA_KHUSUS } from '../../../shared/mock/anggaranData';
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';

/**
 * Clean & Typesafe Anggaran and Dana Khusus dashboard page.
 * Implements high contrast typography and flat visual hierarchy.
 */
const AnggaranPage = () => {
    // Memoize static lists and computational aggregates for rendering safety
    const processedDanaKhusus = useMemo(() => {
        return MOCK_DANA_KHUSUS.map((dana) => {
            const progressKoleksi = dana.target > 0 ? (dana.terkumpul / dana.target) * 100 : 0;
            return {
                ...dana,
                progressKoleksi,
            };
        });
    }, []);

    const processedAnggaran = useMemo(() => {
        return MOCK_ANGGARAN.map((item) => {
            const percentUsed = item.plafon > 0 ? (item.terpakai / item.plafon) * 100 : 0;
            return {
                ...item,
                percentUsed,
            };
        });
    }, []);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Anggaran & Dana Khusus</h2>
                    <p className="text-sm text-gray-500">Monitoring realisasi rencana anggaran tahunan paroki.</p>
                </div>
                <Button className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 shadow-sm">
                    <Plus size={16} /> Buat Pos Anggaran
                </Button>
            </div>

            {/* SECTION 1: Dana Khusus Cards (Seamless structure, no bulky border indicators) */}
            <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Target className="text-blue-600" size={16} /> Monitoring Dana Khusus
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {processedDanaKhusus.map((dana) => (
                        <Card key={dana.id} className="p-4 border-slate-200 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-slate-800 text-sm tracking-tight">{dana.namaDana}</h4>
                                <span className="text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100/50 px-2 py-0.5 rounded uppercase">
                                    {dana.status}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                                        <span>Koleksi Dana</span>
                                        <span>{Math.round(dana.progressKoleksi)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(dana.progressKoleksi, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2.5 border-t border-slate-100/80">
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Terkumpul</p>
                                        <p className="text-xs font-black text-slate-800 tracking-tight mt-0.5">{formatIDR(dana.terkumpul)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Terpakai</p>
                                        <p className="text-xs font-black text-rose-600 tracking-tight mt-0.5">{formatIDR(dana.terpakai)}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* SECTION 2: Anggaran Tahunan Table (Seamless with proper margin densities) */}
            <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calculator className="text-emerald-600" size={16} /> Realisasi Anggaran Tahunan
                </h3>

                <div className="space-y-4">
                    <AdaptiveList
                        data={processedAnggaran}
                        desktopHeaders={[
                            'Kategori',
                            'Nama Pos Anggaran',
                            'Plafon',
                            'Terpakai',
                            'Progress',
                            'Sisa Anggaran'
                        ]}
                        renderDesktopRow={(item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-2.5 border-r border-slate-100">
                                    <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase border border-slate-200/55 tracking-tight">
                                        {item.kategori}
                                    </span>
                                </td>
                                <td className="px-5 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{item.namaPos}</td>
                                <td className="px-5 py-2.5 text-xs text-right font-medium text-slate-600 border-r border-slate-100">{formatIDR(item.plafon)}</td>
                                <td className="px-5 py-2.5 text-xs text-right font-black text-rose-600 border-r border-slate-100">{formatIDR(item.terpakai)}</td>
                                <td className="px-5 py-2.5 border-r border-slate-100">
                                    <div className="flex items-center gap-2 justify-center">
                                        <div className="flex-1 bg-slate-100 h-1.5 rounded-full w-24 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${item.percentUsed > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${item.percentUsed}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-500 w-6 text-right">{Math.round(item.percentUsed)}%</span>
                                    </div>
                                </td>
                                <td className="px-5 py-2.5 text-xs text-right font-black text-emerald-600">{formatIDR(item.sisa)}</td>
                            </tr>
                        )}
                        renderMobileCard={(item) => (
                            <div className="flex flex-col gap-2.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase border border-slate-200/55 tracking-tight">
                                        {item.kategori}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500">{Math.round(item.percentUsed)}% Terpakai</span>
                                </div>
                                <div className="text-xs font-bold text-slate-800">{item.namaPos}</div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.percentUsed > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${item.percentUsed}%` }}
                                    ></div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                                    <div>
                                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">Plafon</span>
                                        <span className="font-semibold text-slate-700">{formatIDR(item.plafon)}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">Terpakai</span>
                                        <span className="font-bold text-rose-600">{formatIDR(item.terpakai)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-400 font-bold block uppercase tracking-wider text-[8px]">Sisa</span>
                                        <span className="font-black text-emerald-600">{formatIDR(item.sisa)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    />

                    <div className="p-3.5 bg-amber-50/60 border border-amber-200/50 rounded-xl flex items-center gap-2.5 text-amber-900 shadow-sm">
                        <ShieldAlert size={16} className="text-amber-700 shrink-0" />
                        <p className="text-[11px] font-semibold leading-normal">
                            Sistem akan memberikan peringatan otomatis jika pengajuan dana melebihi sisa anggaran di setiap Pos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnggaranPage;