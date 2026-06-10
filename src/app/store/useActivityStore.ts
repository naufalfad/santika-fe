import { create } from 'zustand';
import { RECENT_LOGS } from '../../shared/mock/dashboardData';

export interface ActivityLog {
  id: number;
  action: string;
  amount: number;
  time: string;
  type: 'in' | 'out' | 'approve' | 'spj' | 'reject' | 'revise';
}

interface ActivityState {
  logs: ActivityLog[];
  addLog: (action: string, amount: number, type: ActivityLog['type']) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  logs: RECENT_LOGS.map(log => ({
    id: log.id,
    action: log.action,
    amount: log.amount,
    time: log.time,
    type: (log.type === 'in' ? 'in' : log.type === 'out' ? 'out' : log.type === 'approve' ? 'approve' : 'spj') as ActivityLog['type']
  })),
  addLog: (action, amount, type) => set((state) => {
    const nextId = state.logs.length > 0 ? Math.max(...state.logs.map(l => l.id)) + 1 : 1;
    const nowStr = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';

    const newLog: ActivityLog = {
      id: nextId,
      action,
      amount,
      time: nowStr,
      type,
    };
    return { logs: [newLog, ...state.logs] };
  }),
}));
