import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useKasStore } from '../../../app/store/useKasStore';
import type { KasMasuk } from '../../../shared/mock/kasMasukData';
import type { KasKeluar } from '../../../shared/mock/kasKeluarData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hook to retrieve Kas Masuk asynchronously with simulated delay.
 */
export const useKasMasukQuery = () => {
  const kasMasuk = useKasStore((state) => state.kasMasuk);
  return useQuery<KasMasuk[]>({
    queryKey: ['kasMasuk'],
    queryFn: async () => {
      await delay(800); // Simulate network latency
      return kasMasuk;
    },
  });
};

/**
 * Hook to retrieve Kas Keluar asynchronously with simulated delay.
 */
export const useKasKeluarQuery = () => {
  const kasKeluar = useKasStore((state) => state.kasKeluar);
  return useQuery<KasKeluar[]>({
    queryKey: ['kasKeluar'],
    queryFn: async () => {
      await delay(800); // Simulate network latency
      return kasKeluar;
    },
  });
};

/**
 * Mutation hook to add a new Kas Masuk entry.
 */
export const useAddKasMasukMutation = () => {
  const queryClient = useQueryClient();
  const addKasMasuk = useKasStore((state) => state.addKasMasuk);
  return useMutation({
    mutationFn: async (data: Omit<KasMasuk, 'id' | 'status'>) => {
      await delay(600); // Simulate network latency
      addKasMasuk(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasMasuk'] });
    },
  });
};

/**
 * Mutation hook to add a new Kas Keluar entry.
 */
export const useAddKasKeluarMutation = () => {
  const queryClient = useQueryClient();
  const addKasKeluar = useKasStore((state) => state.addKasKeluar);
  return useMutation({
    mutationFn: async (data: Omit<KasKeluar, 'id' | 'status'> & { buktiUrl?: string }) => {
      await delay(600); // Simulate network latency
      addKasKeluar(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasKeluar'] });
    },
  });
};
