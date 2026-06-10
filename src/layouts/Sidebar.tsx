import { NavLink } from 'react-router-dom';
import { MENU_ITEMS } from '../shared/constants/menu';
import { useAuthStore } from '../app/store/useAuthStore';
import { cn } from '../shared/utils/cn';

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

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto sidebar-scrollbar">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            {/* Menggunakan fungsi di sini untuk mendapatkan status isActive bagi ikon */}
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-500"
                  )}
                />
                <span className="font-semibold text-sm tracking-wide">{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-800 text-center">
        <img src="src/assets/church.png" alt="Church" className="w-40 mx-auto mb-2 opacity-100" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paroki</p>
        <p className="text-xs font-bold text-white">ST. STEFANUS - SEMPAN</p>
        <p className="text-[10px] text-slate-500 italic mt-2">"Melayani dengan Kasih, Mengelola dengan Integritas"</p>
      </div>
    </aside>
  );
};