import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';

export interface AuditLogActor {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuditLogItem {
  id: string;
  tanggal: string;
  type: 'IN' | 'OUT' | 'APPROVE' | 'SPJ' | 'REJECT' | 'REVISE' | 'AUTH';
  action: string;
  amount: number | null;
  actorId: string;
  actor: AuditLogActor;
  parokiId: string;
  oldData: any;
  newData: any;
}

export interface AuditLogsResponse {
  logs: AuditLogItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

/**
 * Hook to retrieve audit trail logs from backend with optional filters and pagination
 */
export const useAuditLogsQuery = (filters?: {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery<AuditLogsResponse>({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.type && filters.type !== 'ALL') params.type = filters.type;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;

      const response = await axiosInstance.get('/v1/audit-logs', { params });
      return response.data.data;
    },
  });
};

/**
 * Hook to retrieve a single cash transaction (either INCOME or EXPENSE) by ID
 */
export const useSingleTransactionQuery = (id?: string, type?: 'INCOME' | 'EXPENSE') => {
  return useQuery<any>({
    queryKey: ['single-transaction', id, type],
    queryFn: async () => {
      if (!id || !type) return null;
      const endpoint = type === 'INCOME' ? `/v1/cash/incomes/${id}` : `/v1/cash/expenses/${id}`;
      const response = await axiosInstance.get(endpoint);
      return type === 'INCOME' ? response.data.data.income : response.data.data.expense;
    },
    enabled: !!id && !!type,
  });
};
