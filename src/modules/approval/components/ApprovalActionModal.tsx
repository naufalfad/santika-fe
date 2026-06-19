import React, { useState } from 'react';
import { Button } from '../../../shared/components/ui/Button';

interface ApprovalActionModalProps {
  actionType: 'approve' | 'reject' | 'revise';
  onConfirm: (notes: string) => void;
  onCancel: () => void;
}

export const ApprovalActionModal = ({ actionType, onConfirm, onCancel }: ApprovalActionModalProps) => {
  const [notes, setNotes] = useState('');

  const actionText = {
    approve: 'Setujui Pengajuan',
    reject: 'Tolak Pengajuan',
    revise: 'Kirim Catatan Revisi',
  };

  const buttonColors = {
    approve: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200',
    reject: 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200',
    revise: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Catatan / Alasan {actionType === 'approve' ? '(Opsional)' : '(Wajib)'}
        </label>
        <textarea
          rows={4}
          required={actionType !== 'approve'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            actionType === 'approve'
              ? 'Tulis catatan persetujuan Anda di sini...'
              : 'Tulis alasan penolakan atau instruksi revisi secara rinci...'
          }
          className="w-full p-3 border rounded-none text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 py-3">
          Batal
        </Button>
        <Button
          type="submit"
          className={`flex-1 py-3 font-medium ${buttonColors[actionType]}`}
        >
          {actionText[actionType]}
        </Button>
      </div>
    </form>
  );
};
