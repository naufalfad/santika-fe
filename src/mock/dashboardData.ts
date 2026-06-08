// src/mock/dashboardData.ts tambahan atau update
export const DASHBOARD_HERO = {
  paroki: "Paroki St. Stefanus - Sempan",
  lastUpdate: "Selasa, 20 Mei 2025 | 10:30 WIB"
};

export const ROLE_BASED_STATS = (role: string) => [
  { label: 'SALDO OPERASIONAL', val: 245000000, sub: 'Kas + Bank', color: 'blue', icon: 'wallet', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN'] },
  { label: 'DANA PEMBANGUNAN', val: 785000000, sub: 'Saldo Dana', color: 'emerald', icon: 'building', visible: ['PASTOR', 'BENDAHARA', 'TIM_PEMBANGUNAN'] },
  { label: 'DANA SOSIAL (PSE)', val: 58000000, sub: 'Saldo Dana', color: 'purple', icon: 'heart', visible: ['PASTOR', 'BENDAHARA', 'KETUA_KOMISI'] },
  { label: 'PENDAPATAN BULAN INI', val: 68000000, sub: 'Mei 2025', color: 'orange', icon: 'trending-up', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'SEKRETARIAT'] },
  { label: 'PENGELUARAN BULAN INI', val: 52000000, sub: 'Mei 2025', color: 'cyan', icon: 'trending-down', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'KETUA_KOMISI'] },
];

export const CHART_ANALYTICS = [
  { name: 'Des 24', masuk: 45000000, keluar: 22000000 },
  { name: 'Jan 25', masuk: 52000000, keluar: 35000000 },
  { name: 'Feb 25', masuk: 48000000, keluar: 28000000 },
  { name: 'Mar 25', masuk: 55000000, keluar: 42000000 },
  { name: 'Apr 25', masuk: 65000000, keluar: 48000000 },
  { name: 'Mei 25', masuk: 78000000, keluar: 52000000 },
];

export const SUMMARY_TOTALS = {
  penerimaan: 346800000,
  pengeluaran: 271400000,
  surplus: 75400000
};

export const PENDING_REQUESTS = [
  { id: 1, judul: 'Kegiatan OMK - Rekoleksi 2025', komisi: 'Komisi OMK', nominal: 5000000, tgl: '19 Mei 2025', icon: 'wallet', color: 'blue' },
  { id: 2, judul: 'Paskah 2025 - Dekorasi & Properti', komisi: 'Komisi Liturgi', nominal: 7500000, tgl: '19 Mei 2025', icon: 'gift', color: 'purple' },
  { id: 3, judul: 'Baksos Lansia - Mei 2025', komisi: 'Komisi PSE', nominal: 3000000, tgl: '20 Mei 2025', icon: 'users', color: 'emerald' },
  { id: 4, judul: 'Pemeliharaan Listrik Gereja', komisi: 'Seksi Sarpras', nominal: 2800000, tgl: '20 Mei 2025', icon: 'tool', color: 'rose' },
];

export const BUDGET_SUMMARY = [
  { id: 1, nama: 'Pastoral & Liturgi', anggaran: 120000000, realisasi: 68500000, sisa: 51500000, persen: 57 },
  { id: 2, nama: 'Pendidikan Iman', anggaran: 80000000, realisasi: 32400000, sisa: 47600000, persen: 41 },
  { id: 3, nama: 'Sosial (PSE)', anggaran: 60000000, realisasi: 28750000, sisa: 31250000, persen: 48 },
  { id: 4, nama: 'Sarana & Prasarana', anggaran: 100000000, realisasi: 45600000, sisa: 54400000, persen: 46 },
  { id: 5, nama: 'Administrasi', anggaran: 40000000, realisasi: 18200000, sisa: 21800000, persen: 46 },
];

export const BANK_BALANCES = [
  { name: 'Kas Tunai', amount: 18000000, type: 'cash' },
  { name: 'BNI - Rek. Operasional', amount: 112000000, type: 'bank' },
  { name: 'BCA - Rek. Pembangunan', amount: 785000000, type: 'bank' },
  { name: 'BRI - Rek. Dana Sosial', amount: 58000000, type: 'bank' },
  { name: 'Mandiri - Rek. Pendidikan', amount: 12500000, type: 'bank' },
];

export const RECENT_LOGS = [
  { id: 1, action: 'Penerimaan Kolekte Misa Minggu', amount: 6250000, time: '20 Mei 2025 08:45', type: 'in' },
  { id: 2, action: 'Pengeluaran Belanja ATK Sekretariat', amount: 350000, time: '19 Mei 2025 15:20', type: 'out' },
  { id: 3, action: 'Pengajuan Disetujui - Rekoleksi OMK', amount: 5000000, time: '19 Mei 2025 10:15', type: 'approve' },
  { id: 4, action: 'SPJ Diunggah - Baksos Lansia April', amount: 2750000, time: '18 Mei 2025 21:30', type: 'spj' },
  { id: 5, action: 'Penerimaan Donasi Pembangunan', amount: 10000000, time: '18 Mei 2025 09:12', type: 'in' },
];