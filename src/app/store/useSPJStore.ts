import { create } from 'zustand';
import { MOCK_SPJ, type SPJDocument } from '../../shared/mock/spjData';

interface SPJState {
  spjDocuments: SPJDocument[];
  addSPJDocument: (data: Omit<SPJDocument, 'id' | 'status'> & { thumbnail?: string }) => void;
  verifySPJDocument: (id: string) => void;
}

export const useSPJStore = create<SPJState>((set) => ({
  spjDocuments: MOCK_SPJ,
  addSPJDocument: (data) => set((state) => {
    const nextId = `SPJ-${String(state.spjDocuments.length + 1).padStart(3, '0')}`;
    const newDoc: SPJDocument = {
      ...data,
      id: nextId,
      status: 'Pending', // Default status ketika di-upload
    };
    return { spjDocuments: [newDoc, ...state.spjDocuments] };
  }),
  verifySPJDocument: (id) => set((state) => ({
    spjDocuments: state.spjDocuments.map((doc) =>
      doc.id === id ? { ...doc, status: 'Verified' } : doc
    ),
  })),
}));
