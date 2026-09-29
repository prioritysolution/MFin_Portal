export type PaginationMeta = {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
};

export type PaginationMetaDto = {
  total: number;
  page?: number;
  per_page?: number;
  last_page?: number;
  has_more?: boolean;
};

export type DepositSchemeDto = {
  scheme_id: number;
  scheme_code: string;
  scheme_name: string;
  deposit_type_cd: number;
  deposit_type_desc?: string | null;
  prod_type_cd: number;
  prod_type_desc?: string | null;
  roi_percent?: number | null;
  intt_type_cd?: number | null;
  intt_type_desc?: string | null;
  intt_payout_cd?: number | null;
  intt_payout_desc?: string | null;
  min_balance?: number | null;
  withd_allow?: boolean | null;
  max_withd_amt?: number | null;
  inop_days?: number | null;
  prn_ledger?: number | null;
  prn_ledger_code?: string | null;
  prn_ledger_name?: string | null;
  prn_ledger_type?: string | null;
  prn_ledger_mainhd_id?: number | null;
  prn_ledger_mainhd_name?: string | null;
  prn_ledger_is_active?: boolean | null;
  intt_ledg?: number | null;
  intt_ledger_code?: string | null;
  intt_ledger_name?: string | null;
  intt_ledger_type?: string | null;
  intt_ledger_mainhd_id?: number | null;
  intt_ledger_mainhd_name?: string | null;
  intt_ledger_is_active?: boolean | null;
  field_coll?: boolean | null;
  is_active: boolean;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
  updated_at?: string | null;
};

export type DepositSchemeSetup = {
  id: number;
  schemeCode: string;
  schemeName: string;
  depositTypeCd: number;
  depositTypeDesc: string;
  prodTypeCd: number;
  prodTypeDesc: string;
  roiPercent: number;
  inttTypeCd: number | null;
  inttTypeDesc: string | null;
  inttPayoutCd: number | null;
  inttPayoutDesc: string | null;
  minBalance: number;
  withdAllow: boolean;
  maxWithdAmt: number | null;
  inopDays: number;
  prnLedger: number | null;
  prnLedgerCode: string | null;
  prnLedgerName: string | null;
  inttLedg: number | null;
  inttLedgerCode: string | null;
  inttLedgerName: string | null;
  fieldColl: boolean;
  isActive: boolean;
  createdBy?: number | null;
  createdAt?: string | null;
  updatedBy?: number | null;
  updatedAt?: string | null;
};

export type DepositSchemeSetupSaveInput = {
  schemeId?: number;
  schemeName: string;
  depositTypeCd: number;
  prodTypeCd: number;
  roiPercent?: number | null;
  inttTypeCd?: number | null;
  inttPayoutCd?: number | null;
  minBalance?: number | null;
  withdAllow?: boolean;
  maxWithdAmt?: number | null;
  inopDays?: number | null;
  prnLedger?: number | null;
  inttLedg?: number | null;
  fieldColl?: boolean;
  isActive?: boolean;
};

export type DepositSchemeListQuery = {
  page?: number;
  perPage?: number;
  schemeId?: number;
  search?: string;
  depositTypeCd?: number;
  prodTypeCd?: number;
  isActive?: number;
};

export type DepositSchemeListResult = {
  items: DepositSchemeSetup[];
  meta: PaginationMeta | null;
};

export type DepositSchemeChargeDto = {
  id: number;
  scheme_id: number;
  scheme_code?: string | null;
  scheme_name?: string | null;
  charges_cd: number;
  charges_desc?: string | null;
  charges_fig: number;
  figure_cd: number;
  figure_desc?: string | null;
  charges_gl?: number | null;
  charges_gl_code?: string | null;
  charges_gl_name?: string | null;
  run_duration_cd?: number | null;
  run_duration_desc?: string | null;
  effect_frm: string;
  effect_upto?: string | null;
  is_active: boolean;
  created_by?: number | null;
  created_at?: string | null;
};

export type DepositSchemeCharge = {
  id: number;
  schemeId: number;
  schemeCode: string;
  schemeName: string;
  chargesCd: number;
  chargesDesc: string;
  chargesFig: number;
  figureCd: number;
  figureDesc: string;
  chargesGl: number | null;
  chargesGlCode: string | null;
  chargesGlName: string | null;
  runDurationCd: number | null;
  runDurationDesc: string | null;
  effectFrm: string;
  effectUpto: string | null;
  isActive: boolean;
  createdBy?: number | null;
  createdAt?: string | null;
};

export type DepositSchemeChargeSaveInput = {
  id?: number;
  schemeId: number;
  chargesCd: number;
  chargesFig: number;
  figureCd: number;
  chargesGl?: number | null;
  runDurationCd?: number | null;
  effectFrm: string;
  effectUpto?: string | null;
  isActive?: boolean;
};

export type DepositSchemeChargeListQuery = {
  page?: number;
  perPage?: number;
  id?: number;
  schemeId?: number;
  chargesCd?: number;
  effectiveOn?: string;
  isActive?: number;
  search?: string;
};

export type DepositSchemeChargeListResult = {
  items: DepositSchemeCharge[];
  meta: PaginationMeta | null;
};
