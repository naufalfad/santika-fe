import { 
  LayoutDashboard, ArrowDownCircle, ArrowUpCircle, 
  FileText, PieChart, Users, ClipboardCheck, Wallet 
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
  { title: 'Kas Masuk', path: '/kas-masuk', icon: ArrowDownCircle, roles: ['SUPER_ADMIN', 'BENDAHARA', 'SEKRETARIAT'] },
  { title: 'Kas Keluar', path: '/kas-keluar', icon: ArrowUpCircle, roles: ['SUPER_ADMIN', 'BENDAHARA', 'KETUA_KOMISI'] },
  { title: 'SPJ Digital', path: '/spj', icon: FileText, roles: ['SUPER_ADMIN', 'BENDAHARA', 'KETUA_KOMISI', 'TIM_PEMBANGUNAN'] },
  { title: 'Anggaran', path: '/anggaran', icon: PieChart, roles: ['SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN'] },
  { title: 'Dana Khusus', path: '/dana-khusus', icon: Wallet, roles: ['SUPER_ADMIN', 'TIM_PEMBANGUNAN', 'BENDAHARA'] },
  { title: 'Persetujuan', path: '/approval', icon: ClipboardCheck, roles: ['SUPER_ADMIN', 'PASTOR', 'BENDAHARA'] },
  { title: 'Laporan', path: '/laporan', icon: FileText, roles: ['SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN'] },
  { title: 'Manajemen User', path: '/users', icon: Users, roles: ['SUPER_ADMIN'] },
];