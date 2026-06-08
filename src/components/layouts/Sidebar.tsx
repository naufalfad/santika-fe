import React from 'react';
import { NavLink } from 'react-router-dom';
import { MENU_ITEMS } from '../../constants/menu';
import { useAuthStore } from '../../stores/useAuthStore';
import { cn } from '../../utils/cn';

export const Sidebar = () => {
  const { user } = useAuthStore();

  // Filter menu berdasarkan role user
  const filteredMenu = MENU_ITEMS.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider text-blue-400">SANTIKA</h1>
        <p className="text-xs text-slate-400">Sistem Akuntansi Gereja</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              "hover:bg-slate-800",
              isActive ? "bg-blue-600 text-white" : "text-slate-400"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-800 text-center">
        <img src="/church-icon.png" alt="Church" className="w-12 mx-auto mb-2 opacity-50 invert" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paroki</p>
        <p className="text-xs font-bold text-white">ST. STEFANUS - SEMPAN</p>
        <p className="text-[10px] text-slate-500 italic mt-2">"Melayani dengan Kasih, Mengelola dengan Integritas"</p>
      </div>
    </aside>
  );
};