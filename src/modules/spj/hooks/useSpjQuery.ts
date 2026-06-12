import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';
import type { CashTransactionExpense, Attachment } from '../../kas-keluar/hooks/useKasKeluarQuery';

export interface SpjLampiran {
  id: string;
  kategoriFile: 'NOTA' | 'KWITANSI' | 'DOKUMENTASI' | 'SURAT_TUGAS';
  spjId: string;
  attachmentId: string;
  attachment: Attachment;
}

export interface SpjDocument {
  id: string;
  title: string;
  amount: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploadedBy: string;
  kegiatanId: string | null;
  kegiatan?: any | null;
  permohonanAnggaranId: string | null;
  permohonanAnggaran?: any | null;
  posDanaId: string | null;
  posDana?: any | null;
  cashTransactionId: string | null;
  cashTransaction?: CashTransactionExpense | null;
  createdAt: string;
  lampiran: SpjLampiran[];
}

export interface CreateSpjPayload {
  title: string;
  amount: number;
  cash_transaction_id: string;
  kegiatan_id?: string;
  permohonan_anggaran_id?: string;
  file?: File | null;
}

/**
 * Hook to retrieve all SPJ documents with optional filters
 */
export const useSpjsQuery = (filters?: { search?: string; status?: string }) => {
  return useQuery<SpjDocument[]>({
    queryKey: ['spj', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/spj', { params: filters });
      return response.data.data.spjs;
    },
  });
};

/**
 * Mutation hook to upload a new SPJ document
 */
export const useUploadSpjMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSpjPayload) => {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('amount', String(payload.amount));
      formData.append('cash_transaction_id', payload.cash_transaction_id);

      if (payload.kegiatan_id) {
        formData.append('kegiatan_id', payload.kegiatan_id);
      }

      if (payload.permohonan_anggaran_id) {
        formData.append('permohonan_anggaran_id', payload.permohonan_anggaran_id);
      }

      if (payload.file) {
        formData.append('file', payload.file);
      }

      const response = await axiosInstance.post('/v1/spj', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data.spj;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spj'] });
      queryClient.invalidateQueries({ queryKey: ['kasKeluar'] });
      queryClient.invalidateQueries({ queryKey: ['fundBalances'] });
      queryClient.invalidateQueries({ queryKey: ['anggaran'] });
    },
  });
};

/**
 * Mutation hook to verify/reject an SPJ document (Bendahara only)
 */
export const useVerifySpjMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'VERIFIED' | 'REJECTED' }) => {
      const response = await axiosInstance.patch(`/v1/spj/${id}/status`, { status });
      return response.data.data.spj;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spj'] });
      queryClient.invalidateQueries({ queryKey: ['kasKeluar'] });
      queryClient.invalidateQueries({ queryKey: ['fundBalances'] });
      queryClient.invalidateQueries({ queryKey: ['anggaran'] });
    },
  });
};
