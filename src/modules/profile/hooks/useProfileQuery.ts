import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';
import { useAuthStore } from '../../../app/store/useAuthStore';

/**
 * Type definisi untuk data profil yang dikembalikan oleh endpoint GET /api/v1/auth/me.
 * Sesuai dengan struktur response AuthService.getCurrentUser() di backend.
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  isActive: boolean;
  parokiId: string;
  createdAt: string;
  updatedAt: string;
  paroki: {
    id: string;
    nama: string;
    alamat: string;
    keuskupan: string;
  };
}

/**
 * Type definisi untuk payload update password.
 * Konfirmasi password (confirmNewPassword) hanya ada di frontend —
 * backend tidak menerimanya karena validasi equality cukup di layer UI.
 */
export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

// ──────────────────────────────────────────────────────────
// QUERY KEYS
// Terpusat agar invalidation konsisten di seluruh aplikasi.
// ──────────────────────────────────────────────────────────
export const profileQueryKeys = {
  me: ['profile', 'me'] as const,
};

/**
 * useProfileQuery — Query hook untuk data profil pengguna yang sedang login.
 *
 * GRASP: Pure Fabrication
 * Hook ini adalah Pure Fabrication — tidak ada entitas bisnis "ProfileQuery"
 * di domain paroki. Ia ada murni untuk memisahkan server state (React Query)
 * dari UI state (useState/useForm) di ProfilePage.
 *
 * Data source: GET /api/v1/auth/me (endpoint yang sudah ada, tidak perlu baru).
 * Reuse endpoint me yang sudah ada alih-alih membuat endpoint /profile/me baru
 * untuk menghindari duplikasi logika di backend (DRY principle).
 */
export const useProfileQuery = () => {
  return useQuery<UserProfile>({
    queryKey: profileQueryKeys.me,
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/auth/me');
      return response.data.data.user as UserProfile;
    },
    // Data profil jarang berubah — staleTime 5 menit untuk efisiensi
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

/**
 * useUpdateAvatarMutation — Mutation hook untuk upload foto profil.
 *
 * Menggunakan multipart/form-data karena payload adalah file binary.
 * Axios instance yang sudah ada sudah meng-inject Bearer token via
 * request interceptor, sehingga tidak perlu konfigurasi auth tambahan.
 *
 * Setelah sukses, invalidate query 'me' agar UI update otomatis dengan
 * avatarUrl baru dari server.
 */
export const useUpdateAvatarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      // Field name 'file' harus cocok dengan multerUpload.single('file') di backend
      formData.append('file', file);

      const response = await axiosInstance.patch('/v1/profile/avatar', formData, {
        headers: {
          // Override Content-Type dari 'application/json' (default axiosInstance)
          // ke 'multipart/form-data'. Axios akan otomatis menambahkan boundary.
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data.user as UserProfile;
    },
    onSuccess: (data) => {
      // Invalidate cache profil agar data fresh diambil ulang dari server
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.me });

      // Sinkronkan ke Zustand store agar perubahan langsung terlihat di seluruh aplikasi (seperti Header)
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, avatarUrl: data.avatarUrl } : null,
      }));
    },
  });
};

/**
 * useUpdatePasswordMutation — Mutation hook untuk update kata sandi.
 *
 * Mengirimkan { oldPassword, newPassword } sebagai JSON ke PUT /api/v1/profile/password.
 * confirmNewPassword tidak dikirim ke backend — validasi kecocokan hanya di UI.
 *
 * CATATAN: Mutation ini tidak menginvalidate query karena password change
 * tidak mengubah data yang di-cache (hanya hash di DB yang berubah).
 */
export const useUpdatePasswordMutation = () => {
  return useMutation({
    mutationFn: async (payload: UpdatePasswordPayload) => {
      const response = await axiosInstance.put('/v1/profile/password', payload);
      return response.data;
    },
  });
};
