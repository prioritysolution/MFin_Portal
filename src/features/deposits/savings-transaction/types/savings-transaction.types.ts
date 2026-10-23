export type SavingsTransaction = {
  transId: number;
  transNo: string;
  accountId: number;
  applNo: string;
  holderName: string;
  accountNo: number | null;
  depositTypeCd: number;
  depositTypeDesc: string;
  schemeCode: string;
  schemeName: string;
  transDate: string;
  effectDate: string;
  transMode: string;
  transModeDesc: string;
  transTypeCd: number;
  transTypeDesc: string;
  transAmount: number;
  balanceAfter: number | null;
  ledgerNarration: string;
  branchName: string;
  foName: string;
  remarks: string;
  statusCd: number;
  statusDesc: string;
  createdBy: number | null;
  createdByName: string;
  createdAt: string | null;
  approvedByName: string;
  approvedAt: string | null;
};

export type SavingsTransactionListQuery = {
  page?: number;
  perPage?: number;
  transId?: number;
  accountId?: number;
  memberId?: number;
  groupId?: number;
  branchId?: number;
  foId?: number;
  depositTypeCd?: number;
  transTypeCd?: number;
  transMode?: string;
  statusCd?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
};

export type SavingsTransactionListResult = {
  items: SavingsTransaction[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  } | null;
};

export type SavingsTransactionAddInput = {
  accountId: number;
  transTypeCd: number;
  transAmount: number;
  transMode?: string | null;
  transDate?: string | null;
  effectDate?: string | null;
  foId?: number | null;
  ledgerNarration?: string | null;
  remarks?: string | null;
};

export type SavingsTransactionApproveInput = {
  transId: number;
  approve: boolean;
  remarks?: string | null;
};

export type SavingsTransactionResult = {
  item: SavingsTransaction;
  message: string;
};
