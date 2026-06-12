import {
  LayoutDashboard, ArrowDownCircle, ArrowUpCircle,
  FileText, PieChart, Users, ClipboardCheck, Wallet, History, UserCircle
} from 'lucide-react';
import type { UserRole } from '../types/auth';

export interface MenuItem {
  title: string;
  path: string;
  icon: any;
  roles: UserRole[];
}

export const MENU_ITEMS: MenuItem[] = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'KETUA_KOMISI', 'TIM_PEMBANGUNAN', 'SEKRETARIAT'] },
  { title: 'Kas Masuk', path: '/kas-masuk', icon: ArrowDownCircle, roles: ['SUPER_ADMIN', 'BENDAHARA', 'SEKRETARIAT', 'PASTOR'] },
  { title: 'Kas Keluar', path: '/kas-keluar', icon: ArrowUpCircle, roles: ['SUPER_ADMIN', 'BENDAHARA', 'KETUA_KOMISI', 'PASTOR'] },
  { title: 'SPJ Digital', path: '/spj', icon: FileText, roles: ['SUPER_ADMIN', 'BENDAHARA', 'KETUA_KOMISI', 'TIM_PEMBANGUNAN'] },
  { title: 'Anggaran', path: '/anggaran', icon: PieChart, roles: ['SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN'] },
  { title: 'Dana Khusus', path: '/dana-khusus', icon: Wallet, roles: ['SUPER_ADMIN', 'TIM_PEMBANGUNAN', 'BENDAHARA'] },
  { title: 'Persetujuan', path: '/approval', icon: ClipboardCheck, roles: ['SUPER_ADMIN', 'PASTOR', 'BENDAHARA'] },
  { title: 'Pengajuan', path: '/pengajuan', icon: ClipboardCheck, roles: ['SUPER_ADMIN', 'KETUA_KOMISI'] },
  { title: 'Laporan', path: '/laporan', icon: FileText, roles: ['SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN'] },
  { title: 'Audit Trail', path: '/audit-trail', icon: History, roles: ['SUPER_ADMIN', 'PASTOR', 'BENDAHARA'] },
  // Profil Saya: dapat diakses oleh semua role — menu personal, bukan operasional
  { title: 'Profil Saya', path: '/profile', icon: UserCircle, roles: ['SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'KETUA_KOMISI', 'TIM_PEMBANGUNAN', 'SEKRETARIAT'] },
  { title: 'Manajemen User', path: '/users', icon: Users, roles: ['SUPER_ADMIN'] },
];
