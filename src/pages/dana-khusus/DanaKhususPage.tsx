import React from 'react';
import { Wallet, Users, ArrowUpRight, History, Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MOCK_DANA_KHUSUS } from '../../mock/anggaranData';

const DanaKhususPage = () => {
    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dana Khusus</h2>
                    <p className="text-gray-500">Pengelolaan dana terikat dan donasi pembangunan.</p>
                </div>
                <Button className="flex items-center gap-2">
                    <Plus size={18} /> Buka Program Dana Baru
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {MOCK_DANA_KHUSUS.map((dana) => (
                    <Card key={dana.id} className="flex flex-col h-full border-t-4 border-t-blue-600">
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Wallet size={20} />
                                </div>
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded">AKTIF</span>
                            </div>

                            <h3 className="font-bold text-lg text-slate-800 mb-1">{dana.namaDana}</h3>
                            <p className="text-xs text-gray-400 mb-6">ID: {dana.id}</p>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-gray-500 font-medium">Progress Pengumpulan</span>
                                        <span className="font-bold text-blue-600">{Math.round((dana.terkumpul / dana.target) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full"
                                            style={{ width: `${(dana.terkumpul / dana.target) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Terkumpul</p>
                                        <p className="text-sm font-bold">{formatIDR(dana.terkumpul)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Target</p>
                                        <p className="text-sm font-bold">{formatIDR(dana.target)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Users size={14} />
                                <span>124 Donatur</span>
                            </div>
                            <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                                Lihat Detail <ArrowUpRight size={14} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Aktivitas Dana Khusus */}
            <Card>
                <div className="p-4 border-b">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <History size={18} /> Riwayat Donasi Terakhir
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Donatur</th>
                                <th className="p-4">Program</th>
                                <th className="p-4 text-right">Jumlah</th>
                                <th className="p-4">Metode</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-gray-50">
                                <td className="p-4">24 Mar 2024</td>
                                <td className="p-4 font-medium">Keluarga Bpk. Santoso</td>
                                <td className="p-4">Pembangunan Gedung Karya</td>
                                <td className="p-4 text-right font-bold text-emerald-600">{formatIDR(5000000)}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-[10px]">Transfer Bank</span></td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="p-4">23 Mar 2024</td>
                                <td className="p-4 font-medium">Hamba Allah</td>
                                <td className="p-4">Beasiswa Pendidikan Anak</td>
                                <td className="p-4 text-right font-bold text-emerald-600">{formatIDR(1000000)}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-[10px]">Tunai</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DanaKhususPage;