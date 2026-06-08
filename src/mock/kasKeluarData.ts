export interface KasKeluar {
  id: string;
  tanggal: string;
  kategori: string;
  penerima: string;
  jumlah: number;
  status: 'Selesai' | 'Proses Verifikasi' | 'Ditolak';
  buktiUrl?: string;
}

export const MOCK_KAS_KELUAR: KasKeluar[] = [
  { id: 'KK001', tanggal: '2024-03-05', kategori: 'Liturgi', penerima: 'Toko Bunga ABC', jumlah: 750000, status: 'Selesai', buktiUrl: 'https://via.placeholder.com/150' },
  { id: 'KK002', tanggal: '2024-03-07', kategori: 'Operasional', penerima: 'PLN Persero', jumlah: 2300000, status: 'Selesai' },
  { id: 'KK003', tanggal: '2024-03-08', kategori: 'Kegiatan Komisi', penerima: 'Catering Enak', jumlah: 1500000, status: 'Proses Verifikasi' },
];

export const KAS_KELUAR_STATS = {
  totalBulanIni: 12500000,
  anggaranTerpakai: 45, // persentase dari total anggaran bulan ini
  pendingVerifikasi: 8,
  hematDariBulanLalu: 5.2
};

export const CATEGORY_KELUAR_DATA = [
  { name: 'Operasional', value: 40, color: '#e11d48' }, // Rose 600
  { name: 'Liturgi', value: 25, color: '#f59e0b' },    // Amber 500
  { name: 'Kegiatan', value: 20, color: '#7c3aed' },   // Violet 600
  { name: 'Lain-lain', value: 15, color: '#94a3b8' },  // Slate 400
];

export const TREND_KELUAR_DATA = [
  { date: '01 Mar', jumlah: 1200000 },
  { date: '05 Mar', jumlah: 800000 },
  { date: '10 Mar', jumlah: 2500000 },
  { date: '15 Mar', jumlah: 1500000 },
  { date: '20 Mar', jumlah: 3000000 },
  { date: '25 Mar', jumlah: 1000000 },
  { date: '30 Mar', jumlah: 2500000 },
];