import { z } from "zod";

const optionalNumber = z.preprocess((value) => {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}, z.number().nullable());

const optionalInt = optionalNumber.pipe(z.number().int().nullable());
const optionalText = z.string().nullish();
const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const savingsTransactionDtoSchema = z
  .object({
    trans_id: z.number().int(),
    trans_no: optionalText,
    account_id: z.number().int(),
    appl_no: optionalText,
    holder_name: optionalText,
    account_no: optionalInt.nullish(),
    deposit_type_cd: optionalInt.nullish(),
    deposit_type_desc: optionalText,
    scheme_code: optionalText,
    scheme_name: optionalText,
    trans_date: optionalText,
    effect_date: optionalText,
    trans_mode: optionalText,
    trans_mode_desc: optionalText,
    trans_type_cd: optionalInt.nullish(),
    trans_type_desc: optionalText,
    trans_amount: optionalNumber.nullish(),
    balance_after: optionalNumber.nullish(),
    ledger_narration: optionalText,
    branch_name: optionalText,
    fo_name: optionalText,
    remarks: optionalText,
    status_cd: optionalInt.nullish(),
    status_desc: optionalText,
    created_by: optionalInt.nullish(),
    created_by_name: optionalText,
    created_at: optionalText,
    approved_by_name: optionalText,
    approved_at: optionalText,
  })
  .passthrough();

export const savingsTransactionAddSchema = z.object({
  accountId: z.number().int().positive(),
  transTypeCd: z.union([z.literal(1), z.literal(2)]),
  transAmount: z.number().positive(),
  transMode: z.enum(["CA", "CQ", "TR", "OL"]).nullable().optional(),
  transDate: ymd.nullable().optional(),
  effectDate: ymd.nullable().optional(),
  foId: z.number().int().positive().nullable().optional(),
  ledgerNarration: z.string().trim().max(75).nullable().optional(),
  remarks: z.string().trim().max(250).nullable().optional(),
});

export const savingsTransactionApproveSchema = z
  .object({
    transId: z.number().int().positive(),
    approve: z.boolean(),
    remarks: z.string().trim().max(200).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (!value.approve && !value.remarks?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["remarks"],
        message: "Rejection reason is required",
      });
    }
  });

export const paginationMetaDtoSchema = z.object({
  total: z.number(),
  page: z.number().optional(),
  per_page: z.number().optional(),
  last_page: z.number().optional(),
});
