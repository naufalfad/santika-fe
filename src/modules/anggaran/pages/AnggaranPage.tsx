import { Target, ShieldAlert, Plus, Calculator } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { MOCK_ANGGARAN, MOCK_DANA_KHUSUS } from '../../../shared/mock/anggaranData';

const AnggaranPage = () => {
    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Anggaran & Dana Khusus</h2>
                    <p className="text-gray-500">Monitoring realisasi rencana anggaran tahunan paroki.</p>
                </div>
                <Button className="flex items-center gap-2">
                    <Plus size={18} /> Buat Pos Anggaran
                </Button>
            </div>

            {/* SECTION 1: Dana Khusus Cards */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Target className="text-blue-600" size={20} /> Monitoring Dana Khusus
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {MOCK_DANA_KHUSUS.map((dana) => {
                        const progressKoleksi = (dana.terkumpul / dana.target) * 100;
                        return (
                            <Card key={dana.id} className="p-5 border-t-4 border-t-blue-500">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-slate-800">{dana.namaDana}</h4>
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase">{dana.status}</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500">Koleksi Dana</span>
                                            <span className="font-bold">{Math.round(progressKoleksi)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(progressKoleksi, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Terkumpul</p>
                                            <p className="text-sm font-bold text-slate-700">{formatIDR(dana.terkumpul)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Terpakai</p>
                                            <p className="text-sm font-bold text-rose-600">{formatIDR(dana.terpakai)}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 2: Anggaran Tahunan Table */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calculator className="text-emerald-600" size={20} /> Realisasi Anggaran Tahunan 2024
                </h3>
                <Card className="overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-[11px] uppercase text-gray-500 font-bold border-b">
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Nama Pos Anggaran</th>
                                <th className="px-6 py-4 text-right">Plafon</th>
                                <th className="px-6 py-4 text-right">Terpakai</th>
                                <th className="px-6 py-4 text-center">Progress</th>
                                <th className="px-6 py-4 text-right">Sisa Anggaran</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {MOCK_ANGGARAN.map((item) => {
                                const percentUsed = (item.terpakai / item.plafon) * 100;
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                                {item.kategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">{item.namaPos}</td>
                                        <td className="px-6 py-4 text-sm text-right font-medium">{formatIDR(item.plafon)}</td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-rose-600">{formatIDR(item.terpakai)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-100 h-1.5 rounded-full w-24">
                                                    <div
                                                        className={`h-1.5 rounded-full ${percentUsed > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${percentUsed}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-500">{Math.round(percentUsed)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-black text-emerald-600">{formatIDR(item.sisa)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="p-4 bg-amber-50 flex items-center gap-3 text-amber-800">
                        <ShieldAlert size={20} />
                        <p className="text-xs font-medium">
                            Sistem akan memberikan peringatan otomatis jika pengajuan dana melebihi sisa anggaran di setiap Pos.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AnggaranPage;