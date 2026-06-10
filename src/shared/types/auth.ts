export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'PASTOR' 
  | 'BENDAHARA' 
  | 'DEWAN_KEUANGAN' 
  | 'KETUA_KOMISI' 
  | 'TIM_PEMBANGUNAN' 
  | 'SEKRETARIAT';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl?: string | null;
}