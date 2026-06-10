import { Bell, Menu, Search, User } from 'lucide-react';
import { useAuthStore } from '../app/store/useAuthStore';
import { cn } from '../shared/utils/cn';
import type { UserRole } from '../shared/types/auth';
import { getAvatarUrl } from '../shared/utils/formatter';

/**
 * Header Props Contract.
 * Seluruh state dan handler datang dari MainLayout (Application Controller).
 */
interface HeaderProps {
  /** State buka-tutup sidebar, diteruskan dari MainLayout */
  isOpen: boolean;
  /** Handler toggle sidebar, diteruskan dari MainLayout */
  onToggle: () => void;
}

/**
 * GRASP: Low Coupling
 * Header sepenuhnya decoupled dari Sidebar. Ia tidak mengimport, tidak
 * memanggil, dan tidak mengetahui keberadaan komponen Sidebar.
 * Komunikasi hanya lewat props dari MainLayout Controller.
 *
 * KOORDINAT POSISI HEADER — Aturan Layout Mutlak:
 *
 * Mobile (< md):
 *   - left-0, right-0: selalu full-width, tidak pernah bergeser.
 *   - Sidebar mobile adalah overlay z-50 yang menutupi Header dari atas.
 *   - Header z-30 tidak bergerak di mobile.
 *
 * Desktop (≥ md):
 *   - z-30: selalu di ATAS Sidebar desktop (z-20).
 *   - Sidebar OPEN  → md:left-64: Header bergeser kanan, berdampingan Sidebar.
 *   - Sidebar CLOSED → md:left-0: Header melebar penuh.
 *   - `transition-[left]` menganimasikan pergeseran secara smooth.
 *
 * TEKNIS TAILWIND — Mengapa md:left-64 dan md:left-0 aman dari purge:
 *   Kedua nilai ini adalah LITERAL STRINGS yang muncul sebagai conditional
 *   ternary di source code — Tailwind JIT scanner mendeteksinya dan
 *   menyertakannya dalam output CSS. Tidak ada string interpolation dinamis.
 *
 * DESIGN SYSTEM GUARD (MUTLAK):
 *   - rounded-none pada SEMUA elemen.
 *   - Flat solid colors, zero glassmorphism, zero shadow berwarna.
 */
export const Header = ({ isOpen, onToggle }: HeaderProps) => {
  const { user, setRole } = useAuthStore();

  const roles: UserRole[] = [
    'SUPER_ADMIN',
    'PASTOR',
    'BENDAHARA',
    'DEWAN_KEUANGAN',
    'KETUA_KOMISI',
    'TIM_PEMBANGUNAN',
    'SEKRETARIAT',
  ];

  return (
    <header
      className={cn(
        // Posisi fixed — right-0 selalu, top-0 selalu
        'fixed top-0 right-0 h-14',
        // z-30: di atas Sidebar desktop (z-20), di bawah backdrop mobile (z-40)
        'z-30',
        // Visual: flat white, border bawah tipis
        'bg-white border-b border-slate-200',
        // Layout internal
        'flex items-center justify-between px-4',
        // ── KOORDINAT LEFT ──
        // Mobile baseline: left-0 (full width, tidak bergeser)
        'left-0',
        // Desktop override berdasarkan state sidebar:
        // - isOpen=true  → md:left-64  (bergeser kanan, berdampingan Sidebar)
        // - isOpen=false → md:left-0   (melebar penuh)
        isOpen ? 'md:left-64' : 'md:left-0',
        // Transisi smooth pada properti `left`
        'transition-[left] duration-300 ease-in-out',
      )}
      aria-label="Header aplikasi"
    >
      {/* ══════════════════════════════════════════
          SISI KIRI: Hamburger + Brand + Search
          ══════════════════════════════════════════ */}
      <div className="flex items-center gap-3 min-w-0 flex-1">

        {/* TOMBOL HAMBURGER TOGGLE
            Mendelegasikan aksi ke onToggle dari MainLayout Controller.
            DESIGN SYSTEM GUARD: rounded-none */}
        <button
          id="btn-hamburger-toggle"
          onClick={onToggle}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-none text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150"
          aria-label={isOpen ? 'Tutup navigasi sidebar' : 'Buka navigasi sidebar'}
          aria-expanded={isOpen}
          aria-controls="sidebar-nav"
        >
          <Menu size={20} />
        </button>

        {/* BRAND — visible sm ke atas */}
        <span className="text-sm font-black tracking-widest text-slate-800 uppercase hidden sm:block flex-shrink-0">
          SANTIKA
        </span>

        {/* Separator vertikal */}
        <span className="hidden sm:block w-px h-5 bg-slate-200 flex-shrink-0" />

        {/* SEARCH BAR — visible md ke atas
            DESIGN SYSTEM GUARD: rounded-none pada container */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-none px-3 py-1.5 w-64 lg:w-80">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            id="input-global-search"
            type="text"
            placeholder="Cari transaksi, laporan..."
            className="bg-transparent border-none outline-none text-sm w-full min-w-0 text-slate-700 placeholder:text-slate-300 font-medium"
            aria-label="Pencarian global"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SISI KANAN: DEV Role + Notifikasi + Profil
          ══════════════════════════════════════════ */}
      <div className="flex items-center gap-3 flex-shrink-0">

        {/* MOCK ROLE SWITCHER — Development Only
            DESIGN SYSTEM GUARD: rounded-none */}
        <div
          className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-none px-2.5 py-1"
          title="Mock Role Switcher — Development Only"
        >
          <span className="text-[9px] font-black text-amber-600 tracking-widest uppercase whitespace-nowrap">
            DEV:
          </span>
          <select
            id="select-mock-role"
            className="bg-transparent text-[11px] font-semibold outline-none text-amber-800 cursor-pointer"
            value={user?.role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            aria-label="Pilih role mock untuk development"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* TOMBOL NOTIFIKASI
            DESIGN SYSTEM GUARD: rounded-none pada tombol dan badge status */}
        <button
          id="btn-notification"
          className="relative flex items-center justify-center w-9 h-9 rounded-none text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150"
          aria-label="Notifikasi (3 belum dibaca)"
        >
          <Bell size={18} />
          {/* Badge: rounded-none — tag status yang tegas, bukan pill */}
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-none bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
            3
          </span>
        </button>

        {/* PROFIL PENGGUNA
            border-l satu sisi: no-box-inside-box rule
            DESIGN SYSTEM GUARD: rounded-none pada avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          {/* Info teks — hanya visible lg ke atas untuk zero clipping */}
          <div className="text-right hidden lg:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight whitespace-nowrap">
              Paroki St. Stefanus
            </p>
            <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5 whitespace-nowrap">
              T.A. 2025 · {user?.role.replace(/_/g, ' ')}
            </p>
          </div>

          {/* Avatar — flat bg-slate-800, rounded-none */}
          <button
            id="btn-user-profile"
            className="w-8 h-8 bg-slate-800 rounded-none flex items-center justify-center text-white hover:bg-slate-700 transition-colors duration-150 cursor-pointer"
            aria-label={`Profil pengguna: ${user?.name ?? 'Pengguna'}`}
            title={user?.name ?? 'Pengguna'}
          >
            {user?.avatarUrl ? (
              <img
                src={getAvatarUrl(user.avatarUrl) || undefined}
                alt={`Avatar ${user.name}`}
                className="w-full h-full object-cover rounded-none"
              />
            ) : (
              <User size={15} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};