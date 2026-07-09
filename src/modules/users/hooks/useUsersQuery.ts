import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';
import type { UserRole } from '../../../shared/types/auth';

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  parokiId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  status: 'Aktif' | 'Non-Aktif';
  isActive: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  isActive?: boolean;
}

export interface ToggleUserStatusPayload {
  id: string;
  isActive: boolean;
}

/**
 * Hook to fetch users from backend with optional filters and adapter mapping
 */
export const useUsersQuery = (filters?: { search?: string; role?: string; isActive?: boolean }) => {
  return useQuery<ClientUser[]>({
    queryKey: ['users', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.role && filters.role !== 'ALL') params.role = filters.role;
      if (filters?.isActive !== undefined) params.isActive = String(filters.isActive);

      const response = await axiosInstance.get('/v1/users', { params });
      const users: BackendUser[] = response.data.data.users;

      return users.map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        email: u.email,
        isActive: u.isActive,
        status: u.isActive ? 'Aktif' : 'Non-Aktif',
      }));
    },
  });
};

/**
 * Mutation hook to create a new user
 */
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      // If password is not provided, use default
      const data = {
        ...payload,
        password: payload.password || 'password123',
        isActive: payload.isActive !== undefined ? payload.isActive : true,
      };
      const response = await axiosInstance.post('/v1/users', data);
      return response.data.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * Mutation hook to toggle user active status
 */
export const useToggleUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: ToggleUserStatusPayload) => {
      const response = await axiosInstance.patch(`/v1/users/${id}/status`, { isActive });
      return response.data.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export interface UpdateUserPayload {
  id: string;
  name?: string;
  password?: string;
}

/**
 * Mutation hook to update a user's details (name and/or password)
 */
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, password }: UpdateUserPayload) => {
      const response = await axiosInstance.patch(`/v1/users/${id}`, { name, password });
      return response.data.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['reportSignatories'] });
    },
  });
};

