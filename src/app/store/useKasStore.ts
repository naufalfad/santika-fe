import { create } from 'zustand';
import { MOCK_KAS_MASUK, type KasMasuk } from '../../shared/mock/kasMasukData';
import { MOCK_KAS_KELUAR, type KasKeluar } from '../../shared/mock/kasKeluarData';

interface KasState {
  kasMasuk: KasMasuk[];
  kasKeluar: KasKeluar[];
  addKasMasuk: (data: Omit<KasMasuk, 'id' | 'status'>) => void;
  addKasKeluar: (data: Omit<KasKeluar, 'id' | 'status'> & { buktiUrl?: string }) => void;
}

export const useKasStore = create<KasState>((set) => ({
  kasMasuk: MOCK_KAS_MASUK,
  kasKeluar: MOCK_KAS_KELUAR,
  addKasMasuk: (data) => set((state) => {
    const nextId = `KM${String(state.kasMasuk.length + 1).padStart(3, '0')}`;
    const newEntry: KasMasuk = {
      ...data,
      id: nextId,
      status: 'Selesai', // Default status untuk input langsung
    };
    return { kasMasuk: [newEntry, ...state.kasMasuk] };
  }),
  addKasKeluar: (data) => set((state) => {
    const nextId = `KK${String(state.kasKeluar.length + 1).padStart(3, '0')}`;
    const newEntry: KasKeluar = {
      ...data,
      id: nextId,
      status: 'Selesai', // Default status untuk input langsung
    };
    return { kasKeluar: [newEntry, ...state.kasKeluar] };
  }),
}));
