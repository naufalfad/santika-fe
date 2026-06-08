// src/mock/approvalData.ts

export interface Dokumen {
    nama: string;
    ukuran: string;
}

export interface ApprovalRequest {
    id: string;
    judul: string;
    komisi: string;
    pemohon: string;
    jabatanPemohon: string;
    tanggal: string;
    waktu: string;
    nominal: number;
    tujuan: string;
    status: string;
    anggaranProgram: number;
    totalRealisasi: number;
    sisaAnggaran: number;
    dokumen: Dokumen[];
    alur: {
        step: string;
        pic: string;
        tanggal: string;
        status: 'done' | 'active' | 'pending';
    }[];
}

export const MOCK_APPROVALS: ApprovalRequest[] = [
    {
        id: 'PG-2025-0519-001',
        judul: 'Paskah 2025 - Dekorasi & Properti',
        komisi: 'Komisi Liturgi',
        pemohon: 'Maria Magdalena',
        jabatanPemohon: 'Ketua Komisi',
        tanggal: '19 Mei 2025',
        waktu: '09:15 WIB',
        nominal: 15000000,
        tujuan: 'Pengadaan dekorasi altar, bunga, lilin paskah, dan properti untuk perayaan Paskah 2025.',
        status: 'Menunggu',
        anggaranProgram: 50000000,
        totalRealisasi: 28500000,
        sisaAnggaran: 21500000,
        dokumen: [
            { nama: 'RAB Dekorasi Paskah 2025.pdf', ukuran: '280 KB' },
            { nama: 'Proposal Kegiatan Paskah 2025.pdf', ukuran: '420 KB' },
            { nama: 'Surat Permohonan Dana.pdf', ukuran: '180 KB' },
            { nama: 'Desain Dekorasi Paskah.jpg', ukuran: '1.2 MB' },
            { nama: 'Penawaran Harga Vendor.pdf', ukuran: '350 KB' },
        ],
        alur: [
            { step: 'Pengajuan', pic: 'Maria Magdalena (Komisi Liturgi)', tanggal: '19 Mei 2025 09:15', status: 'done' },
            { step: 'Verifikasi Bendahara', pic: 'Natalia (Bendahara Paroki)', tanggal: '19 Mei 2025 10:20', status: 'done' },
            { step: 'Persetujuan Pastor', pic: 'Pastor Paroki', tanggal: 'Menunggu Persetujuan', status: 'active' },
            { step: 'Pencairan Dana', pic: 'Belum Dilakukan', tanggal: '', status: 'pending' },
        ]
    },
    // Tambahkan data dummy lain jika perlu
];