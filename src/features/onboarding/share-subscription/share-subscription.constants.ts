/** `mst_appl_options` group 34: Customer Type. */
export const OPT_CUST_TYPE = 34;
/** `mst_appl_options` group 41: Payment Mode. */
export const OPT_PAYMENT_MODE = 41;

export const CUST_TYPE_GROUP = 1;
export const CUST_TYPE_INDIVIDUAL = 2;
export const CUST_TYPES = [CUST_TYPE_INDIVIDUAL, CUST_TYPE_GROUP] as const;
export type CustType = (typeof CUST_TYPES)[number];

/** S/B Account (4) and Adjustment (5) need a linked account, which this screen does not collect. */
export const PAYMENT_MODE_CASH = 1;
export const PAYMENT_MODES = [1, 2, 3] as const;

/** Same `Tr_Status_Cd` meaning as `trans_savings_transaction`, not lookup group 48. */
export const STATUS_POSTED = 1;
export const STATUS_PENDING = 2;
export const STATUS_REJECTED = 3;
export const STATUS_REVERSED = 4;
export const STATUS_CODES = [
  STATUS_POSTED,
  STATUS_PENDING,
  STATUS_REJECTED,
  STATUS_REVERSED,
] as const;
