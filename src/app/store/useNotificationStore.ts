import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type: AppNotification['type']) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: 'notif-1',
      title: 'Anggaran Disetujui',
      message: 'Pastor Paroki menyetujui permohonan anggaran Retret Kepemimpinan OMK sebesar Rp 15.000.000.',
      createdAt: '1 jam yang lalu',
      read: false,
      type: 'success',
    },
    {
      id: 'notif-2',
      title: 'SPJ Menunggu Unggah',
      message: 'Kas Keluar Uang Muka Toilet Gua Maria senilai Rp 8.000.000 menunggu dokumen pertanggungjawaban.',
      createdAt: '3 jam yang lalu',
      read: false,
      type: 'warning',
    },
    {
      id: 'notif-3',
      title: 'Transaksi Kas Masuk Baru',
      message: 'Kolekte I & II Misa Minggu Kedua berhasil diverifikasi masuk senilai Rp 12.450.000.',
      createdAt: 'Kemarin',
      read: false,
      type: 'info',
    },
  ],
  addNotification: (title, message, type) => set((state) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      createdAt: 'Baru saja',
      read: false,
      type,
    };
    return { notifications: [newNotif, ...state.notifications] };
  }),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  })),
  clearNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
  clearAll: () => set((state) => ({ notifications: [] })),
}));
