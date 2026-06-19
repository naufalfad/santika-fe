import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';

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
 * Calls backend APIs dynamically using React Query.
 */
export const useLaporanKeuangan = (period: string, searchQuery: string = '') => {
    const year = period.split('-')[0];

    const bkuQuery = useQuery({
        queryKey: ['reportBku', period, searchQuery],
        queryFn: async () => {
            const response = await axiosInstance.get('/v1/reports/bku', {
                params: { period, search: searchQuery },
            });
            return response.data.data;
        },
    });

    const cashFlowQuery = useQuery({
        queryKey: ['reportCashFlow', period],
        queryFn: async () => {
            const response = await axiosInstance.get('/v1/reports/cash-flow', {
                params: { period },
            });
            return response.data.data;
        },
    });

    const budgetQuery = useQuery({
        queryKey: ['reportBudgetRealisation', year],
        queryFn: async () => {
            const response = await axiosInstance.get('/v1/reports/budget-realisation', {
                params: { year },
            });
            return response.data.data.realisations;
        },
    });

    const isLoading = bkuQuery.isLoading || cashFlowQuery.isLoading || budgetQuery.isLoading;
    const isError = bkuQuery.isError || cashFlowQuery.isError || budgetQuery.isError;
    const error = bkuQuery.error || cashFlowQuery.error || budgetQuery.error;

    return {
        isLoading,
        isError,
        error,
        bkuData: bkuQuery.data?.records || [],
        totalMasuk: bkuQuery.data?.totalMasuk || 0,
        totalKeluar: bkuQuery.data?.totalKeluar || 0,
        endingSaldo: bkuQuery.data?.endingSaldo || 1200000000,
        arusKasSummary: cashFlowQuery.data || {
            inboundKolekte: 0,
            inboundDonasi: 0,
            inboundPembangunan: 0,
            inboundLainnya: 0,
            totalPenerimaanKas: 0,
            outboundOperasional: 0,
            outboundLiturgi: 0,
            outboundKegiatan: 0,
            totalPengeluaranKas: 0,
            kenaikanBersihKas: 0,
        },
        realisasiSummary: budgetQuery.data || [],
        refetch: () => {
            bkuQuery.refetch();
            cashFlowQuery.refetch();
            budgetQuery.refetch();
        },
    };
};