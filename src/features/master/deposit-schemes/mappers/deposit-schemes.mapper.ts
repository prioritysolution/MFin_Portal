import type {
  DepositSchemeCharge,
  DepositSchemeChargeDto,
  DepositSchemeChargeSaveInput,
  DepositSchemeDto,
  DepositSchemeSetup,
  DepositSchemeSetupSaveInput,
  PaginationMeta,
  PaginationMetaDto,
} from "../types/deposit-schemes.types";

export function mapPaginationMetaDto(dto: PaginationMetaDto): PaginationMeta {
  const perPage = dto.per_page ?? 50;
  const currentPage = dto.page ?? 1;
  const lastPage = dto.last_page ?? (Math.ceil(dto.total / perPage) || 1);
  return {
    total: dto.total,
    perPage,
    currentPage,
    lastPage,
  };
}

export function mapDepositSchemeDto(dto: DepositSchemeDto): DepositSchemeSetup {
  return {
    id: dto.scheme_id,
    schemeCode: dto.scheme_code ?? "",
    schemeName: dto.scheme_name ?? "",
    depositTypeCd: dto.deposit_type_cd,
    depositTypeDesc: dto.deposit_type_desc ?? "",
    prodTypeCd: dto.prod_type_cd,
    prodTypeDesc: dto.prod_type_desc ?? "",
    roiPercent: Number(dto.roi_percent ?? 0),
    inttTypeCd: dto.intt_type_cd != null ? Number(dto.intt_type_cd) : null,
    inttTypeDesc: dto.intt_type_desc ?? null,
    inttPayoutCd: dto.intt_payout_cd != null ? Number(dto.intt_payout_cd) : null,
    inttPayoutDesc: dto.intt_payout_desc ?? null,
    minBalance: Number(dto.min_balance ?? 0),
    withdAllow: Boolean(dto.withd_allow),
    maxWithdAmt: dto.max_withd_amt != null ? Number(dto.max_withd_amt) : null,
    inopDays: Number(dto.inop_days ?? 0),
    prnLedger: dto.prn_ledger != null ? Number(dto.prn_ledger) : null,
    prnLedgerCode: dto.prn_ledger_code ?? null,
    prnLedgerName: dto.prn_ledger_name ?? null,
    inttLedg: dto.intt_ledg != null ? Number(dto.intt_ledg) : null,
    inttLedgerCode: dto.intt_ledger_code ?? null,
    inttLedgerName: dto.intt_ledger_name ?? null,
    fieldColl: Boolean(dto.field_coll),
    isActive: dto.is_active !== false,
    createdBy: dto.created_by ?? null,
    createdAt: dto.created_at ?? null,
    updatedBy: dto.updated_by ?? null,
    updatedAt: dto.updated_at ?? null,
  };
}

export function mapDepositSchemeSaveToDto(
  input: DepositSchemeSetupSaveInput,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    scheme_name: input.schemeName.trim(),
    deposit_type_cd: input.depositTypeCd,
    prod_type_cd: input.prodTypeCd,
    roi_percent: input.roiPercent ?? null,
    intt_type_cd: input.inttTypeCd ?? null,
    intt_payout_cd: input.inttPayoutCd ?? null,
    min_balance: input.minBalance ?? 0,
    withd_allow: Boolean(input.withdAllow),
    maxWithdAmt:
      input.withdAllow && input.maxWithdAmt != null ? input.maxWithdAmt : null,
    inop_days: input.inopDays ?? 0,
    prn_ledger: input.prnLedger ?? null,
    intt_ledg: input.inttLedg ?? null,
    field_coll: Boolean(input.fieldColl),
    is_active: input.isActive ?? true,
  };

  if (input.schemeId != null) {
    payload.scheme_id = input.schemeId;
  }

  return payload;
}

export function mapDepositSchemeChargeDto(
  dto: DepositSchemeChargeDto,
): DepositSchemeCharge {
  return {
    id: dto.id,
    schemeId: dto.scheme_id,
    schemeCode: dto.scheme_code ?? "",
    schemeName: dto.scheme_name ?? "",
    chargesCd: dto.charges_cd,
    chargesDesc: dto.charges_desc ?? "",
    chargesFig: Number(dto.charges_fig ?? 0),
    figureCd: dto.figure_cd,
    figureDesc: dto.figure_desc ?? "",
    chargesGl: dto.charges_gl != null ? Number(dto.charges_gl) : null,
    chargesGlCode: dto.charges_gl_code ?? null,
    chargesGlName: dto.charges_gl_name ?? null,
    runDurationCd:
      dto.run_duration_cd != null ? Number(dto.run_duration_cd) : null,
    runDurationDesc: dto.run_duration_desc ?? null,
    effectFrm: dto.effect_frm,
    effectUpto: dto.effect_upto ?? null,
    isActive: dto.is_active !== false,
    createdBy: dto.created_by ?? null,
    createdAt: dto.created_at ?? null,
  };
}

export function mapDepositSchemeChargeSaveToDto(
  input: DepositSchemeChargeSaveInput,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    scheme_id: input.schemeId,
    charges_cd: input.chargesCd,
    charges_fig: input.chargesFig,
    figure_cd: input.figureCd,
    charges_gl: input.chargesGl ?? null,
    run_duration_cd: input.runDurationCd ?? null,
    effect_frm: input.effectFrm,
    effect_upto: input.effectUpto ?? null,
  };

  if (input.id != null) {
    payload.id = input.id;
  }
  if (input.isActive != null) {
    payload.is_active = input.isActive;
  }

  return payload;
}
