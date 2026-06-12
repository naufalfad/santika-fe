import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';

export interface UserBasic {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ApprovalAlur {
  id: string;
  step: string;
  action: 'SUBMIT' | 'REVIEW' | 'APPROVE' | 'REJECT' | 'REVISE' | 'REVIEW_BENDAHARA';
  catatan: string | null;
  tanggal: string;
  picId: string;
  pic: UserBasic;
}

export interface KegiatanDokumen {
  id: string;
  kegiatanId: string;
  namaDokumen: string;
  jenisDokumen: 'PROPOSAL' | 'SURAT_PERMOHONAN' | 'RAB' | 'JADWAL_ACARA' | 'SURAT_TUGAS' | 'NOTULENSI' | 'FOTO_PENDUKUNG' | 'LAINNYA';
  pathFile: string;
  ukuranFile: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface PermohonanAnggaranDetail {
  id: string;
  permohonanId: string;
  uraian: string;
  qty: number;
  satuan: string;
  hargaSatuan: number;
  subtotal: number;
  keterangan: string | null;
}

export interface PermohonanAnggaran {
  id: string;
  nomorPermohonan: string;
  kegiatanId: string;
  kegiatan?: KegiatanDetail;
  pemohonId: string;
  pemohon: UserBasic;
  tanggalPermohonan: string;
  estimasiBiaya: number;
  jumlahDiajukan: number;
  jumlahDisetujui: number;
  posDanaId: string | null;
  posDana?: {
    id: string;
    code: string;
    name: string;
  } | null;
  reviewedById: string | null;
  approvedById: string | null;
  catatanReview: string | null;
  status: 'DRAFT' | 'DIAJUKAN' | 'DIREVIEW_BENDAHARA' | 'MENUNGGU_PERSETUJUAN' | 'DISETUJUI' | 'DITOLAK' | 'DICAIRKAN' | 'SELESAI';
  createdAt: string;
  updatedAt: string;
  details: PermohonanAnggaranDetail[];
  approvals: ApprovalAlur[];
}

export interface KegiatanDetail {
  id: string;
  nomorKegiatan: string;
  namaKegiatan: string;
  deskripsiKegiatan: string;
  tujuanKegiatan: string;
  kategoriKegiatan: 'OMK' | 'LITURGI' | 'SOSIAL' | 'PENDIDIKAN' | 'PASTORAL' | 'LINGKUNGAN' | 'PEMELIHARAAN' | 'OPERASIONAL' | 'LAINNYA';
  komisiId: string;
  komisi: {
    id: string;
    nama: string;
    parokiId: string;
  };
  pemohonId: string;
  pemohon: UserBasic;
  lokasi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jumlahPeserta: number;
  prioritas: 'RENDAH' | 'SEDANG' | 'TINGGI' | 'DARURAT';
  status: 'DRAFT' | 'DIAJUKAN' | 'DIREVIEW' | 'DISETUJUI' | 'DITOLAK' | 'SELESAI';
  catatanReview: string | null;
  createdAt: string;
  updatedAt: string;
  dokumen: KegiatanDokumen[];
  anggaran: PermohonanAnggaran[];
  approvals: ApprovalAlur[];
}

export interface CreateKegiatanPayload {
  namaKegiatan: string;
  deskripsiKegiatan: string;
  tujuanKegiatan: string;
  kategoriKegiatan: string;
  komisiId: string;
  lokasi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jumlahPeserta: number;
  prioritas: string;
  status?: string;
  files?: File[];
  totalAnggaran?: number;
  posDanaId?: string;
}

export interface CreatePermohonanPayload {
  kegiatanId: string;
  details: Array<{
    uraian: string;
    qty: number;
    satuan: string;
    hargaSatuan: number;
    keterangan?: string;
  }>;
}

export interface UpdateKegiatanStatusPayload {
  id: string;
  action: 'REVIEW' | 'APPROVE' | 'REJECT';
  catatan?: string;
  totalAnggaran?: number;
  posDanaId?: string;
}

export interface UpdatePermohonanStatusPayload {
  id: string;
  action: 'REVIEW_BENDAHARA' | 'APPROVE' | 'REJECT' | 'REVISE';
  posDanaId?: string;
  jumlahDisetujui?: number;
  catatan?: string;
}

// ----------------------------------------
// HOOKS FOR KEGIATAN
// ----------------------------------------

export const useKegiatanQuery = (filters?: { status?: string; search?: string }) => {
  return useQuery<KegiatanDetail[]>({
    queryKey: ['kegiatan', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/kegiatan', { params: filters });
      return response.data.data.kegiatan;
    },
  });
};

export const useKegiatanByIdQuery = (id: string) => {
  return useQuery<KegiatanDetail>({
    queryKey: ['kegiatan', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/v1/kegiatan/${id}`);
      return response.data.data.kegiatan;
    },
    enabled: !!id,
  });
};

export const useCreateKegiatanMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateKegiatanPayload) => {
      const formData = new FormData();
      formData.append('namaKegiatan', payload.namaKegiatan);
      formData.append('deskripsiKegiatan', payload.deskripsiKegiatan);
      formData.append('tujuanKegiatan', payload.tujuanKegiatan);
      formData.append('kategoriKegiatan', payload.kategoriKegiatan);
      formData.append('komisiId', payload.komisiId);
      formData.append('lokasi', payload.lokasi);
      formData.append('tanggalMulai', payload.tanggalMulai);
      formData.append('tanggalSelesai', payload.tanggalSelesai);
      formData.append('jumlahPeserta', String(payload.jumlahPeserta));
      formData.append('prioritas', payload.prioritas);
      if (payload.status) {
        formData.append('status', payload.status);
      }
      if (payload.totalAnggaran !== undefined && payload.totalAnggaran !== null) {
        formData.append('totalAnggaran', String(payload.totalAnggaran));
      }
      if (payload.posDanaId) {
        formData.append('posDanaId', payload.posDanaId);
      }
      if (payload.files) {
        payload.files.forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await axiosInstance.post('/v1/kegiatan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data.kegiatan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
    },
  });
};

export const useUpdateKegiatanStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, catatan, totalAnggaran, posDanaId }: UpdateKegiatanStatusPayload) => {
      const response = await axiosInstance.patch(`/v1/kegiatan/${id}/status`, { action, catatan, totalAnggaran, posDanaId });
      return response.data.data.kegiatan;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan', variables.id] });
    },
  });
};

// ----------------------------------------
// HOOKS FOR PERMOHONAN ANGGARAN
// ----------------------------------------

export const usePermohonanAnggaranQuery = (filters?: { status?: string; search?: string }) => {
  return useQuery<PermohonanAnggaran[]>({
    queryKey: ['permohonan-anggaran', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/permohonan-anggaran', { params: filters });
      return response.data.data.permohonan;
    },
  });
};

export const usePermohonanAnggaranByIdQuery = (id: string) => {
  return useQuery<PermohonanAnggaran>({
    queryKey: ['permohonan-anggaran', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/v1/permohonan-anggaran/${id}`);
      return response.data.data.permohonan;
    },
    enabled: !!id,
  });
};

export const useCreatePermohonanAnggaranMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePermohonanPayload) => {
      const response = await axiosInstance.post('/v1/permohonan-anggaran', payload);
      return response.data.data.permohonan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permohonan-anggaran'] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
    },
  });
};

export const useUpdatePermohonanAnggaranStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, posDanaId, jumlahDisetujui, catatan }: UpdatePermohonanStatusPayload) => {
      const response = await axiosInstance.patch(`/v1/permohonan-anggaran/${id}/status`, {
        action,
        posDanaId,
        jumlahDisetujui,
        catatan,
      });
      return response.data.data.permohonan;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['permohonan-anggaran'] });
      queryClient.invalidateQueries({ queryKey: ['permohonan-anggaran', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan'] });
      queryClient.invalidateQueries({ queryKey: ['fundBalances'] });
    },
  });
};

export interface FundCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export const useFundCategoriesQuery = () => {
  return useQuery<FundCategory[]>({
    queryKey: ['fund-categories'],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/fund-categories');
      return response.data.data.categories;
    },
  });
};
