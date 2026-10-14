import type { z } from "zod";
import type { savingsTransactionDtoSchema } from "../schemas/savings-transaction.schema";
import type {
  SavingsTransaction,
  SavingsTransactionAddInput,
  SavingsTransactionApproveInput,
} from "../types/savings-transaction.types";

type Dto = z.infer<typeof savingsTransactionDtoSchema>;

function text(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function mapSavingsTransactionDto(dto: Dto): SavingsTransaction {
  return {
    transId: dto.trans_id,
    transNo: text(dto.trans_no),
    accountId: dto.account_id,
    applNo: text(dto.appl_no),
    holderName: text(dto.holder_name),
    accountNo: dto.account_no ?? null,
    depositTypeCd: dto.deposit_type_cd ?? 0,
    depositTypeDesc: text(dto.deposit_type_desc),
    schemeCode: text(dto.scheme_code),
    schemeName: text(dto.scheme_name),
    transDate: text(dto.trans_date),
    effectDate: text(dto.effect_date),
    transMode: text(dto.trans_mode).toUpperCase(),
    transModeDesc: text(dto.trans_mode_desc),
    transTypeCd: dto.trans_type_cd ?? 0,
    transTypeDesc: text(dto.trans_type_desc),
    transAmount: dto.trans_amount ?? 0,
    balanceAfter: dto.balance_after ?? null,
    ledgerNarration: text(dto.ledger_narration),
    branchName: text(dto.branch_name),
    foName: text(dto.fo_name),
    remarks: text(dto.remarks),
    statusCd: dto.status_cd ?? 0,
    statusDesc: text(dto.status_desc),
    createdBy: dto.created_by ?? null,
    createdByName: text(dto.created_by_name),
    createdAt: dto.created_at ?? null,
    approvedByName: text(dto.approved_by_name),
    approvedAt: dto.approved_at ?? null,
  };
}

export function mapSavingsTransactionAddToDto(
  input: SavingsTransactionAddInput,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    account_id: input.accountId,
    trans_type_cd: input.transTypeCd,
    trans_amount: input.transAmount,
  };
  if (input.transMode) payload.trans_mode = input.transMode;
  if (input.transDate) payload.trans_date = input.transDate;
  if (input.effectDate) payload.effect_date = input.effectDate;
  if (input.foId != null) payload.fo_id = input.foId;
  if (input.ledgerNarration?.trim()) {
    payload.ledger_narration = input.ledgerNarration.trim();
  }
  if (input.remarks?.trim()) payload.remarks = input.remarks.trim();
  return payload;
}

export function mapSavingsTransactionApproveToDto(
  input: SavingsTransactionApproveInput,
): Record<string, unknown> {
  return {
    trans_id: input.transId,
    approve: input.approve,
    remarks: input.remarks?.trim() || null,
  };
}
