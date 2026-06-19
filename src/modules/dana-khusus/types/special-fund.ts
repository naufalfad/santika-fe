export type SpecialFundStatus = 'DRAFT' | 'AKTIF' | 'DITUTUP';

export interface SpecialFund {
  id: string;
  code: string;
  name: string;
  description?: string;
  tujuanPenggalangan?: string;
  targetNominal?: number;
  balance: number;
  income: number;
  expense: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: SpecialFundStatus;
  createdAt: string;
  updatedAt: string;
  fundCategoryId?: string;
  fundCategory?: any;
  allocations?: SpecialFundAllocation[];
}

export interface SpecialFundAllocation {
  id: string;
  specialFundId: string;
  targetPosDanaId: string;
  nominal: number;
  tanggal: string;
  keterangan?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  targetPosDana?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface CreateSpecialFundPayload {
  code: string;
  name: string;
  description?: string;
  tujuanPenggalangan?: string;
  targetNominal?: number;
  tanggalMulai: string;
  tanggalSelesai: string;
}

export interface AllocateSpecialFundPayload {
  targetPosDanaId: string;
  nominal: number;
  keterangan?: string;
}
