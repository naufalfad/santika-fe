export interface AnggaranTahunan {
    id: string;
    namaPos: string;
    plafon: number;
    terpakai: number;
    sisa: number;
    kategori: 'Operasional' | 'Liturgi' | 'Pastoral' | 'Lainnya';
}

export interface DanaKhusus {
    id: string;
    namaDana: string;
    target: number;
    terkumpul: number;
    terpakai: number;
    status: 'Aktif' | 'Selesai';
    color: string;
}

export const MOCK_ANGGARAN: AnggaranTahunan[] = [
    { id: 'A24-01', namaPos: 'Listrik & Air Paroki', plafon: 60000000, terpakai: 15000000, sisa: 45000000, kategori: 'Operasional' },
    { id: 'A24-02', namaPos: 'Kegiatan OMK Paskah', plafon: 15000000, terpakai: 12000000, sisa: 3000000, kategori: 'Pastoral' },
    { id: 'A24-03', namaPos: 'Pemeliharaan Taman', plafon: 5000000, terpakai: 0, sisa: 5000000, kategori: 'Operasional' },
    { id: 'A24-04', namaPos: 'Hosti & Anggur Misa', plafon: 24000000, terpakai: 6000000, sisa: 18000000, kategori: 'Liturgi' },
];

export const MOCK_DANA_KHUSUS: DanaKhusus[] = [
    { id: 'DK-01', namaDana: 'Pembangunan Gedung Karya', target: 2000000000, terkumpul: 1200000000, terpakai: 500000000, status: 'Aktif', color: 'blue' },
    { id: 'DK-02', namaDana: 'Dana Sosial Erupsi NTT', target: 50000000, terkumpul: 52500000, terpakai: 40000000, status: 'Aktif', color: 'emerald' },
    { id: 'DK-03', namaDana: 'Beasiswa Pendidikan Anak', target: 100000000, terkumpul: 85000000, terpakai: 20000000, status: 'Aktif', color: 'purple' },
];