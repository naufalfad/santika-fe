import { useState, useMemo } from 'react';
import { Wallet, Users, ArrowUpRight, History, Plus } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { MOCK_DANA_KHUSUS } from '../../../shared/mock/anggaranData';
import { formatIDR } from '../../../shared/utils/formatter';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';

const MOCK_HISTORY = [
    {
        id: 1,
        tanggal: '24 Mar 2024',
        donatur: 'Keluarga Bpk. Santoso',
        program: 'Pembangunan Gedung Karya',
        jumlah: 5000000,
        metode: 'Transfer Bank'
    },
    {
        id: 2,
        tanggal: '23 Mar 2024',
        donatur: 'Hamba Allah',
        program: 'Beasiswa Pendidikan Anak',
        jumlah: 1000000,
        metode: 'Tunai'
    }
];

// Mock donors by program id
const MOCK_DONORS_BY_PROGRAM: Record<string, { nama: string; jumlah: number; tanggal: string }[]> = {
    'DK-01': [
        { nama: 'Keluarga Bpk. Santoso', jumlah: 500000000, tanggal: '10 Mar 2024' },
        { nama: 'Ibu Maria Lucia', jumlah: 300000000, tanggal: '15 Mar 2024' },
        { nama: 'Kolekte Pembangunan', jumlah: 400000000, tanggal: '20 Mar 2024' }
    ],
    'DK-02': [
        { nama: 'Hamba Allah', jumlah: 12500000, tanggal: '12 Mar 2024' },
        { nama: 'Bapak FX. Bambang', jumlah: 20000000, tanggal: '14 Mar 2024' },
        { nama: 'Donasi OMK Wilayah 2', jumlah: 20000000, tanggal: '18 Mar 2024' }
    ],
    'DK-03': [
        { nama: 'Keluarga Bpk. Andi', jumlah: 35000000, tanggal: '05 Mar 2024' },
        { nama: 'Ibu Susanti Semarang', jumlah: 30000000, tanggal: '08 Mar 2024' },
        { nama: 'Dewan Paroki', jumlah: 20000000, tanggal: '15 Mar 2024' }
    ]
};

/**
 * Typesafe Dana Khusus page showing dedicated donation programs.
 * Formatted with tight density spacing and standard flat borders.
 * Fully interactive with simulated form submissions, sharp-edge styling, and donor details modal.
 */
const DanaKhususPage = () => {
    const [programs, setPrograms] = useState(MOCK_DANA_KHUSUS);
    const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<typeof MOCK_DANA_KHUSUS[0] | null>(null);

    const processedPrograms = useMemo(() => {
        return programs.map((dana) => {
            const collectionPercent = dana.target > 0 ? (dana.terkumpul / dana.target) * 100 : 0;
            return {
                ...dana,
                collectionPercent,
            };
        });
    }, [programs]);

    const handleAddProgramSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const namaDana = formData.get('namaDana') as string;
        const target = Number(formData.get('target'));

        if (!namaDana || !target) return;

        const newProgram = {
            id: `DK-${String(programs.length + 1).padStart(2, '0')}`,
            namaDana,
            target,
            terkumpul: 0,
            terpakai: 0,
            status: 'Aktif' as const,
            color: 'blue',
        };

        setPrograms([newProgram, ...programs]);
        setIsAddProgramOpen(false);
    };

    const activeDonors = useMemo(() => {
        if (!selectedProgram) return [];
        return MOCK_DONORS_BY_PROGRAM[selectedProgram.id] || [
            { nama: 'Donatur Awal', jumlah: selectedProgram.terkumpul, tanggal: '01 Mar 2024' }
        ];
    }, [selectedProgram]);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dana Khusus</h2>
                    <p className="text-sm text-gray-500">Pengelolaan dana terikat dan donasi pembangunan.</p>
                </div>
                <Button onClick={() => setIsAddProgramOpen(true)} className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 shadow-none rounded-none">
                    <Plus size={16} /> Buka Program Dana Baru
                </Button>
            </div>

            {/* Program cards - Seamless flat surfaces */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {processedPrograms.map((dana) => (
                    <Card key={dana.id} className="flex flex-col h-full border-slate-200 shadow-none rounded-none hover:border-slate-300 transition-colors">
                        <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-none border border-blue-100/50">
                                    <Wallet size={16} />
                                </div>
                                <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-2 py-0.5 rounded-none uppercase">
                                    {dana.status}
                                </span>
                            </div>

                            <h3 className="font-bold text-sm text-slate-800 leading-snug tracking-tight">{dana.namaDana}</h3>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-tighter">ID: {dana.id}</p>

                            <div className="space-y-3 mt-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                                        <span>Progress Pengumpulan</span>
                                        <span className="text-blue-600">{Math.round(dana.collectionPercent)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-none overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-none"
                                            style={{ width: `${Math.min(dana.collectionPercent, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="py-2.5 border-r border-slate-100">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Terkumpul</p>
                                        <p className="text-xs font-black text-slate-800 tracking-tight mt-0.5">{formatIDR(dana.terkumpul)}</p>
                                    </div>
                                    <div className="py-2.5 pl-1">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Target</p>
                                        <p className="text-xs font-black text-slate-800 tracking-tight mt-0.5">{formatIDR(dana.target)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-[11px]">
                            <div className="flex items-center gap-1.5 font-bold text-slate-400">
                                <Users size={12} />
                                <span>{activeDonors.length} Donatur</span>
                            </div>
                            <button
                                onClick={() => setSelectedProgram(dana)}
                                className="font-black text-blue-600 flex items-center gap-0.5 hover:text-blue-700 transition-colors uppercase tracking-tight text-[10px] cursor-pointer"
                            >
                                Lihat Detail <ArrowUpRight size={12} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Aktivitas Dana Khusus - Responsive Table using AdaptiveList */}
            <div className="space-y-4">
                <div className="p-4 bg-white border border-slate-200 rounded-none shadow-none flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <History size={14} /> Riwayat Donasi Terakhir
                    </h3>
                </div>

                <AdaptiveList
                    data={MOCK_HISTORY}
                    desktopHeaders={[
                        'Tanggal',
                        'Donatur',
                        'Program',
                        'Jumlah',
                        'Metode'
                    ]}
                    renderDesktopRow={(item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-2.5 text-xs text-slate-500 font-medium border-r border-slate-100">{item.tanggal}</td>
                            <td className="px-5 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{item.donatur}</td>
                            <td className="px-5 py-2.5 text-xs font-semibold text-slate-600 border-r border-slate-100">{item.program}</td>
                            <td className="px-5 py-2.5 text-xs font-black text-right text-emerald-600 border-r border-slate-100">{formatIDR(item.jumlah)}</td>
                            <td className="px-5 py-2.5 text-center">
                                <span className="px-2 py-0.5 bg-slate-100 rounded-none text-[9px] font-black uppercase text-slate-500 border border-slate-200/50">
                                    {item.metode}
                                </span>
                            </td>
                        </tr>
                    )}
                    renderMobileCard={(item) => (
                        <div className="flex flex-col gap-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-700">{item.donatur}</span>
                                <span className="px-2 py-0.5 bg-slate-100 rounded-none text-[9px] font-black uppercase text-slate-500 border border-slate-200/50">
                                    {item.metode}
                                </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-600">{item.program}</div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-1">
                                <span>{item.tanggal}</span>
                                <span className="font-black text-emerald-600 text-xs">{formatIDR(item.jumlah)}</span>
                            </div>
                        </div>
                    )}
                />
            </div>

            {/* Modal Program Dana Baru */}
            <Modal
                isOpen={isAddProgramOpen}
                onClose={() => setIsAddProgramOpen(false)}
                title="Buka Program Dana Baru"
            >
                <form onSubmit={handleAddProgramSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase mb-1">NAMA PROGRAM DANA</label>
                        <input
                            type="text"
                            name="namaDana"
                            required
                            placeholder="Contoh: Dana Kemanusiaan Bencana Banjir"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-xs outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase mb-1">TARGET DANA (IDR)</label>
                        <input
                            type="number"
                            name="target"
                            required
                            placeholder="0"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-none text-xs outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsAddProgramOpen(false)} className="rounded-none">
                            Batal
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-none shadow-none text-xs py-2 px-4">
                            Buat Program Dana
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detail Program Dana & Donatur */}
            <Modal
                isOpen={!!selectedProgram}
                onClose={() => setSelectedProgram(null)}
                title={selectedProgram ? `Rincian: ${selectedProgram.namaDana}` : 'Detail Dana Khusus'}
            >
                {selectedProgram && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">ID PROGRAM</span>
                                <span className="text-xs font-black text-blue-600">{selectedProgram.id}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">STATUS</span>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-none uppercase">{selectedProgram.status}</span>
                            </div>
                        </div>

                        <div className="border-b border-slate-100 pb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">TARGET PENGUMPULAN</span>
                            <span className="text-sm font-black text-slate-800">{formatIDR(selectedProgram.target)}</span>
                        </div>

                        <div className="border-b border-slate-100 pb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">DANA TERKUMPUL</span>
                            <span className="text-sm font-black text-emerald-600">{formatIDR(selectedProgram.terkumpul)}</span>
                        </div>

                        <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">DAFTAR DONATUR TERBARU</span>
                            <div className="divide-y divide-slate-100 border border-slate-200 bg-slate-50 max-h-48 overflow-y-auto">
                                {activeDonors.map((donor, idx) => (
                                    <div key={idx} className="p-2.5 flex justify-between items-center text-xs font-semibold">
                                        <div>
                                            <p className="text-slate-800">{donor.nama}</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{donor.tanggal}</p>
                                        </div>
                                        <span className="font-black text-emerald-600">{formatIDR(donor.jumlah)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <Button onClick={() => setSelectedProgram(null)} variant="outline" size="sm" className="rounded-none">
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DanaKhususPage;