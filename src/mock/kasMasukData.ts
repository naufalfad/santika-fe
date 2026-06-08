export interface KasMasuk {
  id: string;
  tanggal: string;
  kategori: 'Kolekte' | 'Donasi' | 'Persembahan' | 'Pembangunan' | 'Lainnya';
  sumber: string;
  jumlah: number;
  keterangan: string;
  status: 'Selesai' | 'Pending';
}

export const MOCK_KAS_MASUK: KasMasuk[] = [
  { id: 'KM001', tanggal: '2024-03-01', kategori: 'Kolekte', sumber: 'Misa Minggu Pagi', jumlah: 5400000, keterangan: 'Kolekte I & II', status: 'Selesai' },
  { id: 'KM002', tanggal: '2024-03-02', kategori: 'Donasi', sumber: 'Hamba Allah', jumlah: 10000000, keterangan: 'Dana Sosial', status: 'Selesai' },
  { id: 'KM003', tanggal: '2024-03-03', kategori: 'Pembangunan', sumber: 'Iuran Warga Wilayah 3', jumlah: 2500000, keterangan: 'Renovasi Plafon', status: 'Pending' },
  { id: 'KM004', tanggal: '2024-03-04', kategori: 'Persembahan', sumber: 'Keluarga Bpk. Andi', jumlah: 1500000, keterangan: 'Ujud Syukur', status: 'Selesai' },
];

export const KAS_MASUK_STATS = {
  totalBulanIni: 45000000,
  growth: 15.5,
  targetBulan: 50000000,
  sumberTerbesar: 'Kolekte Mingguan'
};

export const TREND_MASUK_DATA = [
  { date: '01 Mar', jumlah: 4000000 },
  { date: '05 Mar', jumlah: 3500000 },
  { date: '10 Mar', jumlah: 6000000 },
  { date: '15 Mar', jumlah: 4200000 },
  { date: '20 Mar', jumlah: 5500000 },
  { date: '25 Mar', jumlah: 7000000 },
  { date: '30 Mar', jumlah: 4800000 },
];

export const CATEGORY_DATA = [
  { name: 'Kolekte', value: 55, color: '#0284c7' },
  { name: 'Donasi', value: 25, color: '#10b981' },
  { name: 'Pembangunan', value: 15, color: '#f59e0b' },
  { name: 'Lainnya', value: 5, color: '#6366f1' },
];