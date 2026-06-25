import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { MENU_ITEMS } from '../shared/constants/menu';
import { useAuthStore } from '../app/store/useAuthStore';
import { cn } from '../shared/utils/cn';
import churchLogo from '../assets/church.png';

/**
 * Sidebar Props Contract.
 * State dan handler datang dari MainLayout (Application Controller).
 */
interface SidebarProps {
  /** State buka-tutup sidebar, diteruskan dari MainLayout */
  isOpen: boolean;
  /** Handler menutup sidebar, diteruskan dari MainLayout */
  onClose: () => void;
}

/**
 * GRASP: High Cohesion
 * Sidebar bertanggung jawab HANYA pada:
 * 1. Merender daftar nav-item yang difilter berdasarkan role pengguna.
 * 2. Menampilkan identitas paroki di footer.
 * 3. Menganimasikan dirinya sendiri masuk/keluar layar.
 * 4. Auto-close di mobile saat halaman berpindah (UX best practice).
 *
 * Sidebar TIDAK mengelola state open/close — itu tanggung jawab MainLayout.
 * GRASP: Low Coupling — Sidebar tidak mengenal Header sama sekali.
 *
 * KOORDINAT Z-INDEX SIDEBAR — Aturan Layout Mutlak:
 *
 * Desktop (≥ md) — Side-by-Side Strategy:
 *   - Sidebar: z-20, di BAWAH Header (z-30).
 *   - Sidebar tidak menutupi Header karena Header bergeser ke `left-64`.
 *   - Mereka berdampingan secara horizontal — ZERO overlap.
 *
 * Mobile (< md) — Overlay Drawer Strategy:
 *   - Sidebar: z-50, di ATAS segalanya termasuk Header (z-30) dan Backdrop (z-40).
 *   - Backdrop z-40 menutupi konten halaman dan Header.
 *   - Sidebar meluncur dari kiri sebagai drawer overlay penuh.
 *
 * SINGLE Z-INDEX VALUE (z-50) yang bekerja untuk KEDUA mode:
 *   - Di mobile: z-50 memastikan sidebar di atas backdrop (z-40) dan Header (z-30). ✓
 *   - Di desktop: z-50 tidak masalah karena Header sudah bergeser ke kanan
 *     (left-64), sehingga tidak ada overlap area antara sidebar dan Header. ✓
 *
 * DESIGN SYSTEM GUARD (MUTLAK):
 *   - rounded-none pada semua elemen Sidebar.
 *   - Flat solid colors: bg-slate-900, bg-slate-700, bg-slate-800.
 *   - Zero glassmorphism, zero shadow berwarna berpijar.
 *   - border-b / border-t satu sisi untuk pemisah — no box-inside-box.
 */
export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Auto-close sidebar di mobile saat navigasi berpindah halaman.
  // Di desktop, sidebar tetap terbuka saat navigasi.
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Filter menu berdasarkan role pengguna aktif
  const filteredMenu = MENU_ITEMS.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          BACKDROP MOBILE
          Hanya tampil di layar < md via kelas `md:hidden`.
          z-40: di atas Header (z-30), di bawah Sidebar (z-50).
          Klik backdrop = panggil onClose dari MainLayout Controller.
          ══════════════════════════════════════════════════════ */}
      <Transition
        show={isOpen}
        enter="transition-opacity duration-300 ease-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200 ease-in"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      </Transition>

      {/* ══════════════════════════════════════════════════════
          SIDEBAR PANEL
          Transisi: slide dari kiri (translate-x) via Headless UI.
          z-50: di atas backdrop (z-40) dan Header (z-30) — berlaku
          di mobile maupun desktop, AMAN karena di desktop Header
          sudah bergeser ke kanan sehingga tidak ada overlap area.
          ══════════════════════════════════════════════════════ */}
      <Transition
        show={isOpen}
        enter="transition-transform duration-300 ease-out"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition-transform duration-250 ease-in"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        <aside
          id="sidebar-nav"
          className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50"
          aria-label="Navigasi Utama"
        >
          {/* ── HEADER SIDEBAR: Logo + Tombol Close Mobile ── */}
          {/* border-b satu sisi: no box-inside-box rule */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div>
              <h1 className="text-xl font-semibold text-white leading-tight">
                SANTIKA
              </h1>
              <p className="text-[9px] font-medium text-slate-500 mt-0.5">
                Sistem Akuntansi Gereja
              </p>
            </div>

            {/* Tombol X — hanya visible di mobile (md:hidden).
                Di desktop, toggle dilakukan via hamburger di Header.
                DESIGN SYSTEM GUARD: rounded-none */}
            <button
              onClick={onClose}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-none text-slate-500 hover:text-white hover:bg-slate-800 transition-colors duration-150"
              aria-label="Tutup navigasi"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── NAVIGATION MENU ── */}
          <nav
            className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto sidebar-scrollbar"
            aria-label="Menu aplikasi"
          >
            {filteredMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    // DESIGN SYSTEM GUARD: rounded-none — zero rounded-none corners
                    'flex items-center gap-3 px-4 py-2.5 rounded-none',
                    'transition-colors duration-150 group relative',
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Indikator aktif: garis vertikal kiri 2px — lebih presisi dari bg penuh */}
                    {isActive && (
                      <span className="absolute left-0 top-0 h-full w-0.5 bg-blue-400" />
                    )}
                    <item.icon
                      size={16}
                      className={cn(
                        'shrink-0 transition-colors duration-150',
                        isActive
                          ? 'text-blue-400'
                          : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm  truncate',
                        isActive ? 'font-semibold text-white' : 'font-medium'
                      )}
                    >
                      {item.title}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── FOOTER SIDEBAR: Identitas Paroki ── */}
          {/* border-t satu sisi: no box-inside-box rule */}
          <div className="px-5 py-4 border-t border-slate-800">
            <img
              src={churchLogo}
              alt="Paroki St. Stefanus Sempan"
              className="w-28 mx-auto mb-3 opacity-75"
            />
            <p className="text-[9px] font-medium text-slate-500 text-center">
              Paroki
            </p>
            <p className="text-[11px] font-medium text-white text-center mt-0.5">
              ST. STEFANUS – SEMPAN
            </p>
            <p className="text-[9px] text-slate-500 text-center mt-2 leading-relaxed">
              "Melayani dengan Kasih,
              <br />
              Mengelola dengan Integritas"
            </p>
          </div>
        </aside>
      </Transition>
    </>
  );
};