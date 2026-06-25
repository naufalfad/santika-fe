import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';

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
  specialFundId?: string | null;
  specialFund?: any;
  auditStatus?: string;
  auditNotes?: string | null;
  auditedById?: string | null;
  auditedAt?: string | null;
  auditedBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export interface CreateIncomePayload {
  transaction_date: string;
  fund_category_id: string;
  income_type_id: string;
  amount: number;
  description: string;
  parent_transaction_id?: string | null;
  special_fund_id?: string | null;
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


export interface TransferBalancePayload {
  source_fund_category_id: string;
  target_fund_category_id: string;
  amount: number;
  description: string;
}

/**
 * Mutation hook to transfer balance between Pos Dana.
 */
export const useTransferBalanceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TransferBalancePayload) => {
      const response = await axiosInstance.post('/v1/fund-categories/transfer', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fundBalances'] });
      queryClient.invalidateQueries({ queryKey: ['kasMasuk'] });
      queryClient.invalidateQueries({ queryKey: ['kasKeluar'] });
    },
  });
};

export interface AuditTransactionPayload {
  id: string;
  status: 'TERVERIFIKASI' | 'PERLU_KLARIFIKASI' | 'TIDAK_VALID';
  notes?: string;
}

/**
 * Mutation hook to audit/verify cash transactions (both incomes & expenses).
 */
export const useAuditTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: AuditTransactionPayload) => {
      const response = await axiosInstance.put(`/v1/cash/transactions/${id}/audit`, { status, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasMasuk'] });
      queryClient.invalidateQueries({ queryKey: ['kasKeluar'] });
      queryClient.invalidateQueries({ queryKey: ['fundBalances'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
};
