import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';

export interface Komisi {
  id: string;
  nama: string;
  parokiId: string;
}

export interface FundCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  name: string;
  plafon: number;
  komisiId: string | null;
  komisi: Komisi | null;
  realisasi: number;
  sisa: number;
  persentase: number;
}

export interface Budget {
  id: string;
  tahun: number;
  fundCategoryId: string;
  fundCategory: FundCategory;
  items: BudgetItem[];
  totalPlafon: number;
  totalRealisasi: number;
  totalSisa: number;
}

export interface CreateAnggaranPayload {
  tahun: number;
  fund_category_id: string;
  items: Array<{
    name: string;
    plafon: number;
    komisiId?: string | null;
  }>;
}

export interface UpdateAnggaranPayload {
  id: string;
  tahun?: number;
  items?: Array<{
    id?: string;
    name: string;
    plafon: number;
    komisiId?: string | null;
  }>;
}

/**
 * Hook to retrieve budget records from backend
 */
export const useAnggaranQuery = (filters?: { tahun?: number; fund_category_id?: string }) => {
  return useQuery<Budget[]>({
    queryKey: ['anggaran', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/anggaran', { params: filters });
      return response.data.data.budgets;
    },
  });
};

/**
 * Hook to retrieve commissions for the active paroki
 */
export const useKomisiQuery = () => {
  return useQuery<Komisi[]>({
    queryKey: ['komisi'],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/anggaran/komisi');
      return response.data.data.komisi;
    },
  });
};

/**
 * Hook to mutate/create a new budget header with details
 */
export const useCreateAnggaranMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAnggaranPayload) => {
      const response = await axiosInstance.post('/v1/anggaran', payload);
      return response.data.data.budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran'] });
      queryClient.invalidateQueries({ queryKey: ['fundBalances'] });
    },
  });
};

/**
 * Hook to mutate/update an existing budget header with details
 */
export const useUpdateAnggaranMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateAnggaranPayload) => {
      const { id, ...rest } = payload;
      const response = await axiosInstance.put(`/v1/anggaran/${id}`, rest);
      return response.data.data.budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran'] });
      queryClient.invalidateQueries({ queryKey: ['fundBalances'] });
    },
  });
};
