import { useMemo } from 'react';
import { useKasStore } from '../../../app/store/useKasStore';

export interface BkuRecord {
    id: string;
    tanggal: string;
    keterangan: string;
    ref: string;
    masuk: number;
    keluar: number;
    saldo: number;
}

export interface CashFlowSummary {
    inboundKolekte: number;
    inboundDonasi: number;
    inboundPembangunan: number;
    inboundLainnya: number;
    totalPenerimaanKas: number;
    outboundOperasional: number;
    outboundLiturgi: number;
    outboundKegiatan: number;
    totalPengeluaranKas: number;
    kenaikanBersihKas: number;
}

export interface BudgetRealisation {
    id: number;
    nama: string;
    anggaran: number;
    realisasi: number;
    sisa: number;
    persen: number;
}

/**
 * Custom hook managing the analytical calculations for financial reports.
 * Decouples computational logic from visual presentation components.
 */
export const useLaporanKeuangan = (searchQuery: string = '') => {
    const kasMasuk = useKasStore((state) => state.kasMasuk);
    const kasKeluar = useKasStore((state) => state.kasKeluar);

    // Base initial balance as defined in the domain specifications
    const BASE_SALDO_AWAL = 1200000000; // Rp 1.200.000.000

    // 1. Buku Kas Umum (BKU) Memoized Computation
    const bkuResult = useMemo(() => {
        // Merge income and expenditures into one chronological feed
        const rawRecords = [
            ...kasMasuk.map((item) => ({ ...item, type: 'in' as const })),
            ...kasKeluar.map((item) => ({ ...item, type: 'out' as const })),
        ];

        // Chronological ascending sort
        rawRecords.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

        // Compute running balance
        let runningSaldo = BASE_SALDO_AWAL;
        const allBku = rawRecords.map((item) => {
            const masuk = item.type === 'in' ? item.jumlah : 0;
            const keluar = item.type === 'out' ? item.jumlah : 0;
            runningSaldo = runningSaldo + masuk - keluar;

            return {
                id: item.id,
                tanggal: item.tanggal,
                keterangan:
                    item.type === 'in'
                        ? `${(item as any).sumber} - ${(item as any).keterangan || ''}`
                        : `${(item as any).penerima} - ${(item as any).kategori}`,
                ref: item.id,
                masuk,
                keluar,
                saldo: runningSaldo,
            };
        });

        // Apply text-based searching on descriptions or refs
        const filteredBKU = allBku.filter(
            (item) =>
                item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.ref.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const totalMasuk = filteredBKU.reduce((sum, i) => sum + i.masuk, 0);
        const totalKeluar = filteredBKU.reduce((sum, i) => sum + i.keluar, 0);
        const endingSaldo = filteredBKU[filteredBKU.length - 1]?.saldo || BASE_SALDO_AWAL;

        return {
            filteredBKU,
            totalMasuk,
            totalKeluar,
            endingSaldo,
        };
    }, [kasMasuk, kasKeluar, searchQuery]);

    // 2. Arus Kas (Cash Flow) Memoized Summary
    const arusKasSummary = useMemo((): CashFlowSummary => {
        const inboundKolekte =
            25000000 +
            kasMasuk.filter((i) => i.kategori === 'Kolekte').reduce((sum, i) => sum + i.jumlah, 0);
        const inboundDonasi =
            15000000 +
            kasMasuk.filter((i) => i.kategori === 'Donasi').reduce((sum, i) => sum + i.jumlah, 0);
        const inboundPembangunan =
            10000000 +
            kasMasuk.filter((i) => i.kategori === 'Pembangunan').reduce((sum, i) => sum + i.jumlah, 0);
        const inboundLainnya =
            2000000 +
            kasMasuk
                .filter((i) => i.kategori === 'Lainnya' || i.kategori === 'Persembahan')
                .reduce((sum, i) => sum + i.jumlah, 0);

        const outboundOperasional =
            8000000 +
            kasKeluar.filter((i) => i.kategori === 'Operasional').reduce((sum, i) => sum + i.jumlah, 0);
        const outboundLiturgi =
            3500000 +
            kasKeluar.filter((i) => i.kategori === 'Liturgi').reduce((sum, i) => sum + i.jumlah, 0);
        const outboundKegiatan =
            2000000 +
            kasKeluar
                .filter((i) => i.kategori === 'Kegiatan' || i.kategori === 'Kegiatan Komisi')
                .reduce((sum, i) => sum + i.jumlah, 0);

        const totalPenerimaanKas = inboundKolekte + inboundDonasi + inboundPembangunan + inboundLainnya;
        const totalPengeluaranKas = outboundOperasional + outboundLiturgi + outboundKegiatan;
        const kenaikanBersihKas = totalPenerimaanKas - totalPengeluaranKas;

        return {
            inboundKolekte,
            inboundDonasi,
            inboundPembangunan,
            inboundLainnya,
            totalPenerimaanKas,
            outboundOperasional,
            outboundLiturgi,
            outboundKegiatan,
            totalPengeluaranKas,
            kenaikanBersihKas,
        };
    }, [kasMasuk, kasKeluar]);

    // 3. Realisasi Anggaran Memoized Aggregation
    const realisasiSummary = useMemo(() => {
        const BUDGET_CATEGORIES = [
            { id: 1, nama: 'Pastoral & Liturgi', anggaran: 120000000, baseRealisasi: 68000000, matchKategori: 'Liturgi' },
            { id: 2, nama: 'Pendidikan Iman', anggaran: 80000000, baseRealisasi: 32000000, matchKategori: 'Kegiatan Komisi' },
            { id: 3, nama: 'Sosial (PSE)', anggaran: 60000000, baseRealisasi: 28000000, matchKategori: 'Sosial' },
            { id: 4, nama: 'Sarana & Prasarana', anggaran: 100000000, baseRealisasi: 45000000, matchKategori: 'Pembangunan' },
            { id: 5, nama: 'Administrasi & Ops', anggaran: 40000000, baseRealisasi: 18000000, matchKategori: 'Operasional' },
        ];

        return BUDGET_CATEGORIES.map((cat): BudgetRealisation => {
            const currentSum = kasKeluar
                .filter((i) => i.kategori.toLowerCase() === cat.matchKategori.toLowerCase())
                .reduce((sum, i) => sum + i.jumlah, 0);
            const realisasi = cat.baseRealisasi + currentSum;
            const sisa = cat.anggaran - realisasi;
            const persen = cat.anggaran > 0 ? (realisasi / cat.anggaran) * 100 : 0;

            return {
                id: cat.id,
                nama: cat.nama,
                anggaran: cat.anggaran,
                realisasi,
                sisa,
                persen,
            };
        });
    }, [kasKeluar]);

    return {
        bkuData: bkuResult.filteredBKU,
        totalMasuk: bkuResult.totalMasuk,
        totalKeluar: bkuResult.totalKeluar,
        endingSaldo: bkuResult.endingSaldo,
        arusKasSummary,
        realisasiSummary,
    };
};