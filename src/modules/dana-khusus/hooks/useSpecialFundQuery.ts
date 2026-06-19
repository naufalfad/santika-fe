import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';
import type {
  SpecialFund,
  CreateSpecialFundPayload,
  AllocateSpecialFundPayload
} from '../types/special-fund';

/**
 * Hook to retrieve all Special Funds.
 */
export const useSpecialFundsQuery = (status?: string) => {
  return useQuery<SpecialFund[]>({
    queryKey: ['specialFunds', status],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/special-funds', {
        params: status ? { status } : undefined,
      });
      return response.data;
    },
  });
};

/**
 * Hook to retrieve Special Fund details by ID.
 */
export const useSpecialFundByIdQuery = (id: string) => {
  return useQuery<SpecialFund>({
    queryKey: ['specialFund', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/v1/special-funds/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to retrieve transactions related to a Special Fund.
 */
export const useSpecialFundTransactionsQuery = (id: string) => {
  return useQuery({
    queryKey: ['specialFundTransactions', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/v1/special-funds/${id}/transactions`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to retrieve report summary for a Special Fund.
 */
export const useSpecialFundReportQuery = (id: string) => {
  return useQuery({
    queryKey: ['specialFundReport', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/v1/special-funds/${id}/report`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Mutation hook to create a new Special Fund.
 */
export const useCreateSpecialFundMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSpecialFundPayload) => {
      const response = await axiosInstance.post('/v1/special-funds', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialFunds'] });
    },
  });
};

/**
 * Mutation hook to update Special Fund.
 */
export const useUpdateSpecialFundMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateSpecialFundPayload> }) => {
      const response = await axiosInstance.put(`/v1/special-funds/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['specialFunds'] });
      queryClient.invalidateQueries({ queryKey: ['specialFund', variables.id] });
    },
  });
};

/**
 * Mutation hook to delete Special Fund.
 */
export const useDeleteSpecialFundMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/v1/special-funds/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialFunds'] });
    },
  });
};

/**
 * Mutation hook to activate a Special Fund.
 */
export const useActivateSpecialFundMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.post(`/v1/special-funds/${id}/activate`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['specialFunds'] });
      queryClient.invalidateQueries({ queryKey: ['specialFund', id] });
    },
  });
};

/**
 * Mutation hook to close a Special Fund.
 */
export const useCloseSpecialFundMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.post(`/v1/special-funds/${id}/close`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['specialFunds'] });
      queryClient.invalidateQueries({ queryKey: ['specialFund', id] });
      queryClient.invalidateQueries({ queryKey: ['specialFundReport', id] });
    },
  });
};

/**
 * Mutation hook to allocate remaining balance of closed Special Fund.
 */
export const useAllocateSpecialFundMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AllocateSpecialFundPayload }) => {
      const response = await axiosInstance.post(`/v1/special-funds/${id}/allocate`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['specialFunds'] });
      queryClient.invalidateQueries({ queryKey: ['specialFund', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['specialFundReport', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['specialFundTransactions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['fundBalances'] }); // also refresh general fund balances
    },
  });
};
