import { create } from 'zustand';
import type { User, UserRole } from '../types/auth';

interface AuthState {
  user: User | null;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Default user saat aplikasi dibuka
  user: {
    id: '1',
    name: 'Yohanes Pembaptis',
    role: 'BENDAHARA',
    email: 'bendahara@paroki.com'
  },
  setRole: (role: UserRole) => set((state) => ({
    user: state.user ? { ...state.user, role } : null
  })),
}));