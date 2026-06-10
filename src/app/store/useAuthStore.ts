import { create } from 'zustand';
import type { User, UserRole } from '../../shared/types/auth';
import axiosInstance from '../api/axios.config';
import { queryClient } from '../providers/QueryProvider';

interface AuthState {
  user: User | null;
  setRole: (role: UserRole) => void;
  syncBackend: (role: UserRole) => Promise<void>;
}

const roleEmailMap: Record<UserRole, string> = {
  SUPER_ADMIN: 'admin@santika.org',
  PASTOR: 'pastor@santika.org',
  BENDAHARA: 'bendahara@santika.org',
  DEWAN_KEUANGAN: 'dewan@santika.org',
  KETUA_KOMISI: 'komisi@santika.org',
  TIM_PEMBANGUNAN: 'pembangunan@santika.org',
  SEKRETARIAT: 'sekretariat@santika.org',
};

const getFallbackUser = (role: UserRole): User => {
  const names: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Admin Santika',
    PASTOR: 'Romo Yohanes, Pr',
    BENDAHARA: 'Ibu Maria Susanti',
    DEWAN_KEUANGAN: 'Bapak FX. Bambang',
    KETUA_KOMISI: 'Bapak Ignatius Sutrisno',
    TIM_PEMBANGUNAN: 'Bapak Thomas Wijaya',
    SEKRETARIAT: 'Sdri. Anastasia Eka',
  };
  return {
    id: role,
    name: names[role] || 'Pengguna',
    role,
    email: roleEmailMap[role] || 'user@santika.org',
    avatarUrl: null,
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // Default user saat aplikasi dibuka (gunakan BENDAHARA agar sinkron dengan mock lama)
  user: getFallbackUser('BENDAHARA'),

  setRole: (role: UserRole) => {
    // 1. Update state secara lokal agar UI responsif dan langsung berubah
    set({ user: getFallbackUser(role) });
    
    // 2. Jalankan sinkronisasi dengan backend secara asinkron
    get().syncBackend(role).catch(() => {
      // Abaikan error, fallback sudah terpasang
    });
  },

  syncBackend: async (role: UserRole) => {
    const email = roleEmailMap[role];
    if (!email) return;

    try {
      // Lakukan login ke backend
      const response = await axiosInstance.post('/v1/auth/login', {
        email,
        password: 'password123',
      });

      const { user, tokens } = response.data.data;
      
      // Simpan token ke localStorage agar axios interceptor bisa membacanya
      localStorage.setItem('token', tokens.accessToken);

      // Pastikan state di store sinkron dengan user dari backend
      set({
        user: {
          id: user.id,
          name: user.name,
          role: user.role as UserRole,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });

      // Clear query cache instan agar cache user lama terhapus bersih dan dipaksa refetch
      queryClient.clear();
    } catch (error) {
      console.warn('Backend sync failed (offline or database not seeded). Using frontend fallback.', error);
    }
  },
}));

// Auto-run sinkronisasi awal saat file ini di-load (agar session awal valid)
const initialRole = useAuthStore.getState().user?.role || 'BENDAHARA';
useAuthStore.getState().syncBackend(initialRole).catch(() => {});
