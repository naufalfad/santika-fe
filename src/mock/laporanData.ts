export interface BKU {
    id: string;
    tanggal: string;
    keterangan: string;
    ref: string;
    masuk: number;
    keluar: number;
    saldo: number;
}

export const MOCK_BKU: BKU[] = [
    { id: '1', tanggal: '2024-03-01', keterangan: 'Saldo Awal Maret', ref: '-', masuk: 1200000000, keluar: 0, saldo: 1200000000 },
    { id: '2', tanggal: '2024-03-02', keterangan: 'Kolekte Misa Sab-Min', ref: 'KM001', masuk: 5500000, keluar: 0, saldo: 1205500000 },
    { id: '3', tanggal: '2024-03-05', keterangan: 'Bayar Listrik Paroki', ref: 'KK002', masuk: 0, keluar: 2300000, saldo: 1203200000 },
    { id: '4', tanggal: '2024-03-10', keterangan: 'Donasi Hamba Allah', ref: 'KM002', masuk: 10000000, keluar: 0, saldo: 1213200000 },
    { id: '5', tanggal: '2024-03-15', keterangan: 'Belanja Liturgi (Bunga)', ref: 'KK001', masuk: 0, keluar: 750000, saldo: 1212450000 },
];