import { Bell, Search, User } from 'lucide-react';
import { useAuthStore } from '../app/store/useAuthStore';
import type { UserRole } from '../shared/types/auth';

export const Header = () => {
  const { user, setRole } = useAuthStore();

  const roles: UserRole[] = [
    'SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 
    'KETUA_KOMISI', 'TIM_PEMBANGUNAN', 'SEKRETARIAT'
  ];

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
      <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg w-96">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Cari transaksi..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* Role Switcher (Hanya untuk Development) */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          <span className="text-[10px] font-bold text-amber-600">MOCK ROLE:</span>
          <select 
            className="bg-transparent text-xs font-semibold outline-none text-amber-800 cursor-pointer"
            value={user?.role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            {roles.map(r => (
              <option key={r} value={r}>{r.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
            3
          </span>
        </button>
        
        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
          <div className="text-right">
            <p className="text-sm font-semibold">Paroki St. Stefanus - Sempan</p>
            <p className="text-xs text-gray-500">Tahun Anggaran 2025</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};