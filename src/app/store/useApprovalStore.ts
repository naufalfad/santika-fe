import { create } from 'zustand';
import { MOCK_APPROVALS, type ApprovalRequest } from '../../shared/mock/approvalData';

interface ApprovalState {
  approvalRequests: ApprovalRequest[];
  updateRequestStatus: (
    id: string,
    action: 'approve' | 'reject' | 'revise',
    notes: string,
    actorName: string
  ) => void;
}

export const useApprovalStore = create<ApprovalState>((set) => ({
  approvalRequests: MOCK_APPROVALS,
  updateRequestStatus: (id, action, notes, actorName) => set((state) => {
    const updatedRequests = state.approvalRequests.map((req) => {
      if (req.id !== id) return req;

      let newStatus = req.status;
      if (action === 'approve') newStatus = 'Disetujui';
      else if (action === 'reject') newStatus = 'Ditolak';
      else if (action === 'revise') newStatus = 'Revisi';

      const nowStr = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';

      // Update the active step in the timeline
      const updatedAlur = req.alur.map((step, idx, arr) => {
        if (step.status === 'active') {
          // Complete the active step
          return {
            ...step,
            status: 'done' as const,
            tanggal: nowStr,
            pic: `${actorName} ${notes ? `(Catatan: ${notes})` : ''}`,
          };
        }
        
        // If we approved, activate the next step
        if (action === 'approve') {
          const prevStep = arr[idx - 1];
          if (prevStep && prevStep.status === 'active') {
            // Wait, inside map, when we iterate idx, the prevStep in the original array 'arr'
            // is still 'active'. But we want to activate this step because the previous one was completed.
            // A simpler way is to find the index of the active step first.
          }
        }
        return step;
      });

      // Let's find the index of the previously active step to activate the next one
      const activeIndex = req.alur.findIndex(s => s.status === 'active');
      if (activeIndex !== -1) {
        // Complete active step
        updatedAlur[activeIndex] = {
          ...updatedAlur[activeIndex],
          status: 'done',
          tanggal: nowStr,
          pic: `${actorName}${notes ? ` (Catatan: "${notes}")` : ''}`,
        };

        if (action === 'approve' && activeIndex + 1 < req.alur.length) {
          // Activate next step
          updatedAlur[activeIndex + 1] = {
            ...updatedAlur[activeIndex + 1],
            status: 'active',
            tanggal: nowStr,
          };
        }
      }

      return {
        ...req,
        status: newStatus,
        alur: updatedAlur,
      };
    });

    return { approvalRequests: updatedRequests };
  }),
}));
