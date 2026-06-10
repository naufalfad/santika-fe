import { create } from 'zustand';

/**
 * GRASP: Pure Fabrication + Information Expert
 * Store ini adalah satu-satunya sumber kebenaran (Single Source of Truth)
 * untuk state visibilitas sidebar. Tidak ada di domain model bisnis,
 * namun dibutuhkan untuk mendekopel Header, Sidebar, dan MainLayout
 * agar zero prop-drilling dan zero tight-coupling antar komponen UI.
 */

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true, // Default: terbuka di desktop
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: true }),
}));
