import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../shared/utils/cn';

/**
 * GRASP: Application Controller (Larman Ch.16 — Controller Pattern)
 *
 * MainLayout adalah satu-satunya controller yang berhak memiliki dan
 * mendistribusikan state `isSidebarOpen`. Keputusan desain ini sengaja
 * menggantikan pendekatan useSidebarStore (Zustand global) dari Tugas 1
 * karena alasan berikut:
 *
 * ALASAN MIGRASI STORE → CONTROLLER STATE:
 * - State sidebar hanya relevan di dalam subtree layout ini (3 komponen).
 * - Global Zustand store untuk state 1-level adalah over-engineering yang
 *   melanggar prinsip High Cohesion. State harus dimiliki oleh objek yang
 *   paling dekat dengan scope penggunaannya.
 * - Props-drilling 1-level (MainLayout → Header/Sidebar) jauh lebih eksplisit,
 *   traceable, dan testable daripada implicit global subscription.
 *
 * GRASP: Low Coupling
 * - Header hanya menerima { isOpen, onToggle } — tidak tahu apa-apa tentang Sidebar.
 * - Sidebar hanya menerima { isOpen, onClose } — tidak tahu apa-apa tentang Header.
 * - Keduanya decoupled sepenuhnya; MainLayout yang mengorkestrasi koordinasi.
 *
 * STRATEGI KOORDINAT LAYOUT:
 *
 * ── DESKTOP (md ke atas) — Side-by-Side Strategy: ──
 * Sidebar: fixed, left-0, top-0, h-screen, w-64, z-20 (di BAWAH Header)
 * Header:  fixed, top-0, right-0, h-14, z-30 (di ATAS Sidebar)
 *   → Saat OPEN:   Header left = 16rem (left-64), bergeser kanan
 *   → Saat CLOSED: Header left = 0 (left-0), melebar penuh
 * Main:    pt-14 (offset Header height)
 *   → Saat OPEN:   pl-64 (offset Sidebar width)
 *   → Saat CLOSED: pl-0
 *
 * ── MOBILE (< md) — Overlay Drawer Strategy: ──
 * Header:  fixed, left-0, right-0, h-14, z-30 (selalu penuh lebar)
 * Sidebar: fixed, overlay di atas segalanya, z-50 (di atas Header)
 * Backdrop: z-40 (di bawah Sidebar, di atas konten & Header)
 * Main:    pt-14, pl-0 (tidak bergeser — Sidebar overlay)
 *
 * HIERARKI Z-INDEX (dari bawah ke atas):
 * z-0  → Konten halaman
 * z-20 → Sidebar (desktop — di bawah Header, side-by-side)
 * z-30 → Header (selalu di atas Sidebar desktop)
 * z-40 → Backdrop mobile (di atas Header saat drawer terbuka)
 * z-50 → Sidebar drawer mobile (di atas segalanya)
 */
const MainLayout = () => {
  // MainLayout sebagai single source of truth untuk state layout
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const handleToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ── SIDEBAR ──
          Menerima isOpen + onClose sebagai props.
          Sidebar TIDAK mengelola state-nya sendiri.
          Di desktop: z-20, di mobile: z-50 (overlay). */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleClose} />

      {/* ── HEADER ──
          Menerima isOpen + onToggle sebagai props.
          Header menggunakan isOpen untuk menggeser posisi left-nya.
          z-30: selalu di atas Sidebar desktop (z-20), di bawah backdrop mobile (z-40). */}
      <Header isOpen={isSidebarOpen} onToggle={handleToggle} />

      {/* ── AREA KONTEN UTAMA ──
          CSS transition pada padding-left menghindari layout reflow.
          Mobile: pl-0 selalu (Sidebar adalah overlay, tidak menggeser konten).
          Desktop: pl-64 saat open, pl-0 saat closed.
          pt-14 selalu: offset tinggi Header (h-14). */}
      <main
        id="main-content"
        aria-label="Area konten utama"
        className={cn(
          'pt-14',
          // Transisi smooth pada padding-left — mengikuti gerakan sidebar
          'transition-[padding-left] duration-300 ease-in-out',
          // Mobile: konten tidak bergeser (sidebar adalah overlay)
          'pl-0',
          // Desktop: geser konten ke kanan saat sidebar terbuka
          isSidebarOpen ? 'md:pl-64' : 'md:pl-0',
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;