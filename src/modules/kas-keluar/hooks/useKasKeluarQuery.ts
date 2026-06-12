import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../../app/api/axios.config';

export interface FundCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface ExpenseType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: 'IMAGE' | 'PDF';
  fileUrl: string;
  fileSize: number;
}

export interface CashTransactionExpense {
  id: string;
  transactionNo: string;
  transactionDate: string;
  transactionType: 'EXPENSE';
  fundCategoryId: string;
  fundCategory: FundCategory;
  expenseTypeId: string;
  expenseType: ExpenseType;
  amount: number;
  description: string;
  attachmentId: string | null;
  attachment: Attachment | null;
  budgetItemId: string | null;
  isUangMuka: boolean;
  status: 'SELESAI' | 'MENUNGGU_SPJ';
  parentTransactionId: string | null;
  parentTransaction?: CashTransactionExpense | null;
  childTransactions?: any[] | null;
  spj?: {
    id: string;
    title: string;
    amount: number;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovedPermohonan {
  id: string;
  nomorPermohonan: string;
  kegiatanId: string;
  kegiatan: {
    id: string;
    namaKegiatan: string;
    komisi: {
      id: string;
      nama: string;
    };
  };
  estimasiBiaya: number;
  jumlahDiajukan: number;
  jumlahDisetujui: number;
  posDanaId: string | null;
  posDana?: {
    id: string;
    name: string;
    code: string;
  } | null;
  status: string;
}

export interface CreateExpensePayload {
  transaction_date: string;
  fund_category_id: string;
  expense_type_id: string;
  budget_item_id?: string;
  permohonan_anggaran_id?: string;
  is_uang_muka?: boolean;
  amount: number;
  description: string;
  file?: File | null;
}

/**
 * Hook to retrieve Kas Keluar (Expense) transactions from backend.
 */
export const useKasKeluarQuery = () => {
  return useQuery<CashTransactionExpense[]>({
    queryKey: ['kasKeluar'],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/cash/expenses');
      return response.data.data.expenses;
    },
  });
};

/**
 * Hook to retrieve Expense Types (Jenis Pengeluaran).
 */
export const useExpenseTypesQuery = () => {
  return useQuery<ExpenseType[]>({
    queryKey: ['expenseTypes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/expense-types');
      return response.data.data.expenseTypes;
    },
  });
};

/**
 * Hook to retrieve approved budget requests (Permohonan Anggaran) for linking.
 */
export const useApprovalsQuery = (filters?: { status?: string }) => {
  return useQuery<ApprovedPermohonan[]>({
    queryKey: ['approved-permohonan', filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/v1/permohonan-anggaran', { params: filters });
      return response.data.data.permohonan;
    },
  });
};

/**
 * Mutation hook to add a new Kas Keluar entry with file upload.
 */
export const useAddKasKeluarMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      const formData = new FormData();
      formData.append('transaction_date', payload.transaction_date);
      formData.append('fund_category_id', payload.fund_category_id);
      formData.append('expense_type_id', payload.expense_type_id);
      
      if (payload.budget_item_id) {
        formData.append('budget_item_id', payload.budget_item_id);
      }
      if (payload.permohonan_anggaran_id) {
        formData.append('permohonan_anggaran_id', payload.permohonan_anggaran_id);
      }
      
      if (payload.is_uang_muka !== undefined) {
        formData.append('is_uang_muka', String(payload.is_uang_muka));
      }

      formData.append('amount', String(payload.amount));
      formData.append('description', payload.description);

      if (payload.file) {
        formData.append('file', payload.file);
      }

      const response = await axiosInstance.post('/v1/cash/expenses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data.expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasKeluar'] });
      queryClient.invalidateQueries({ queryKey: ['fundBalances'] });
      queryClient.invalidateQueries({ queryKey: ['anggaran'] });
      queryClient.invalidateQueries({ queryKey: ['approved-permohonan'] });
    },
  });
};
