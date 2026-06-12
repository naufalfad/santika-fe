import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';
import { useKasStore } from '../../../app/store/useKasStore';
import type { KasKeluar } from '../../../shared/mock/kasKeluarData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface FundCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface IncomeType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface CashTransactionIncome {
  id: string;
  transactionNo: string;
  transactionDate: string;
  transactionType: 'INCOME';
  fundCategoryId: string;
  fundCategory: FundCategory;
  incomeTypeId: string | null;
  incomeType: IncomeType | null;
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomePayload {
  transaction_date: string;
  fund_category_id: string;
  income_type_id: string;
  amount: number;
  description: string;
  parent_transaction_id?: string | null;
}

/**
 * Hook to retrieve Kas Masuk from backend.
 */
export const useKasMasukQuery = () => {
  return useQuery<CashTransactionIncome[]>({
    queryKey: ['kasMasuk'],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/cash/incomes');
      return response.data.data.incomes;
    },
  });
};

/**
 * Hook to retrieve Fund Categories (Pos Dana).
 */
export const useFundCategoriesQuery = () => {
  return useQuery<FundCategory[]>({
    queryKey: ['fundCategories'],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/fund-categories');
      return response.data.data.categories;
    },
  });
};

/**
 * Hook to retrieve Income Types.
 */
export const useIncomeTypesQuery = () => {
  return useQuery<IncomeType[]>({
    queryKey: ['incomeTypes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/income-types');
      return response.data.data.incomeTypes;
    },
  });
};

export interface CreateIncomeTypePayload {
  code: string;
  name: string;
  description?: string;
}

export const useAddIncomeTypeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateIncomeTypePayload) => {
      const response = await axiosInstance.post('/v1/income-types', data);
      return response.data.data.incomeType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomeTypes'] });
    },
  });
};

export interface FundBalance {
  id: string;
  code: string;
  fund: string;
  income: number;
  expense: number;
  balance: number;
  isActive: boolean;
}

/**
 * Hook to retrieve Pos Dana Balances.
 */
export const useFundBalancesQuery = () => {
  return useQuery<FundBalance[]>({
    queryKey: ['fundBalances'],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/fund-categories/balances');
      return response.data;
    },
  });
};

/**
 * Mutation hook to add a new Kas Masuk entry.
 */
export const useAddKasMasukMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateIncomePayload) => {
      const response = await axiosInstance.post('/v1/cash/incomes', data);
      return response.data.data.income;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasMasuk'] });
      queryClient.invalidateQueries({ queryKey: ['fundBalances'] });
    },
  });
};

/**
 * Hook to retrieve Kas Keluar asynchronously with simulated delay (legacy mock).
 */
export const useKasKeluarQuery = () => {
  const kasKeluar = useKasStore((state) => state.kasKeluar);
  return useQuery<KasKeluar[]>({
    queryKey: ['kasKeluar'],
    queryFn: async () => {
      await delay(800); // Simulate network latency
      return kasKeluar;
    },
  });
};

/**
 * Mutation hook to add a new Kas Keluar entry (legacy mock).
 */
export const useAddKasKeluarMutation = () => {
  const queryClient = useQueryClient();
  const addKasKeluar = useKasStore((state) => state.addKasKeluar);
  return useMutation({
    mutationFn: async (data: Omit<KasKeluar, 'id' | 'status'> & { buktiUrl?: string }) => {
      await delay(600); // Simulate network latency
      addKasKeluar(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasKeluar'] });
    },
  });
};
