import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Menu, Search, User, LogOut, X, CheckCheck, Trash2 } from 'lucide-react';
import { useAuthStore } from '../app/store/useAuthStore';
import { useNotificationStore } from '../app/store/useNotificationStore';
import { cn } from '../shared/utils/cn';
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
 * DESIGN SYSTEM GUARD (MUTLAK):
 *   - rounded-none pada SEMUA elemen.
 *   - Flat solid colors, zero glassmorphism, zero shadow berwarna.
 */
export const Header = ({ isOpen, onToggle }: HeaderProps) => {
  const { user, logout } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotificationStore();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Close notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  // Close when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-none text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150 cursor-pointer"
          aria-label={isOpen ? 'Tutup navigasi sidebar' : 'Buka navigasi sidebar'}
          aria-expanded={isOpen}
          aria-controls="sidebar-nav"
        >
          <Menu size={20} />
        </button>

        {/* BRAND — visible sm ke atas */}
        <span className="text-sm font-semibold text-slate-800 hidden sm:block flex-shrink-0">
          SANTIKA
        </span>

        {/* Separator vertikal */}
        <span className="hidden sm:block w-px h-5 bg-slate-200 flex-shrink-0" />

        {/* SEARCH BAR — visible md ke atas */}
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

        {/* TOMBOL NOTIFIKASI DENGAN DROPDOWN POPOVER */}
        <div className="relative" ref={popoverRef}>
          <button
            id="btn-notification"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              "relative flex items-center justify-center w-9 h-9 rounded-none text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150 cursor-pointer",
              isNotificationsOpen && "bg-slate-100 text-slate-900"
            )}
            aria-label={`Notifikasi (${unreadCount} belum dibaca)`}
            aria-expanded={isNotificationsOpen}
            aria-haspopup="true"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-none bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Popover Dropdown Panel */}
          {isNotificationsOpen && (
            <div 
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-none shadow-sm z-50 text-slate-800"
              role="menu"
              aria-label="Daftar notifikasi"
            >
              {/* Popover Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Notifikasi</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
                    title="Tandai semua dibaca"
                  >
                    <CheckCheck size={12} /> Tandai dibaca
                  </button>
                )}
              </div>

              {/* Popover Body */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-semibold">
                    Tidak ada notifikasi baru
                  </div>
                ) : (
                  notifications.map((notif) => {
                    let dotColor = 'bg-blue-500';
                    if (notif.type === 'success') dotColor = 'bg-emerald-500';
                    if (notif.type === 'warning') dotColor = 'bg-amber-500';
                    if (notif.type === 'error') dotColor = 'bg-rose-500';

                    return (
                      <div
                        key={notif.id}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                        className={cn(
                          "p-4 transition-colors flex gap-3 relative group",
                          !notif.read ? "bg-blue-50/30 hover:bg-blue-50/50 cursor-pointer" : "hover:bg-slate-50 cursor-default"
                        )}
                        role="menuitem"
                      >
                        {/* Status Type Dot */}
                        <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", dotColor)} />

                        {/* Text Message */}
                        <div className="flex-1 min-w-0 pr-4">
                          <p className={cn(
                            "text-xs font-semibold text-slate-800 leading-tight",
                            !notif.read ? "text-slate-900" : "text-slate-500"
                          )}>
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium break-words">
                            {notif.message}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1.5 font-bold tracking-tight">
                            {notif.createdAt}
                          </p>
                        </div>

                        {/* Individual Clear Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notif.id);
                          }}
                          className="absolute right-3 top-3 p-1 text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all rounded-none opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Hapus"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Popover Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-200 flex justify-end bg-slate-50">
                  <button
                    onClick={() => clearAll()}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
                    title="Hapus semua notifikasi"
                  >
                    <Trash2 size={12} /> Hapus semua
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PROFIL PENGGUNA */}
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

          {/* Avatar */}
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

          {/* Logout Button */}
          <button
            id="btn-logout"
            onClick={() => logout()}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150 cursor-pointer"
            title="Keluar dari Aplikasi"
            aria-label="Keluar dari Aplikasi"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};