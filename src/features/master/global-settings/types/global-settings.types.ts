/**
 * Institutional global settings — UI domain model.
 * Backend API is not documented in apilist yet; client persists locally until then.
 */

export type DateFormatOption = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
export type DayCountBasis = "365" | "360";
export type RoundingMode = "nearest" | "up" | "down";
export type DefaultLocaleOption = "en" | "bn" | "hi" | "or";

export type GlobalSettings = {
  timezone: string;
  dateFormat: DateFormatOption;
  currencyCode: string;
  decimalPlaces: number;
  defaultLocale: DefaultLocaleOption;
  dayCountBasis: DayCountBasis;
  roundingMode: RoundingMode;
  allowBackdatedTxn: boolean;
  maxBackdateDays: number;
  multiBranchAccess: boolean;
  requireMakerCheckerMasters: boolean;
  forceEodBeforeNextDay: boolean;
  auditRetentionDays: number;
};

export type GlobalSettingsUpdateInput = GlobalSettings;

export const GLOBAL_SETTINGS_DEFAULTS: GlobalSettings = {
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  currencyCode: "INR",
  decimalPlaces: 2,
  defaultLocale: "en",
  dayCountBasis: "365",
  roundingMode: "nearest",
  allowBackdatedTxn: false,
  maxBackdateDays: 0,
  multiBranchAccess: true,
  requireMakerCheckerMasters: true,
  forceEodBeforeNextDay: true,
  auditRetentionDays: 365,
};

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", labelKey: "options.timezone.kolkata" },
  { value: "Asia/Dhaka", labelKey: "options.timezone.dhaka" },
  { value: "UTC", labelKey: "options.timezone.utc" },
] as const;

export const DATE_FORMAT_OPTIONS: DateFormatOption[] = [
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YYYY-MM-DD",
];

export const CURRENCY_OPTIONS = [
  { value: "INR", labelKey: "options.currency.inr" },
  { value: "USD", labelKey: "options.currency.usd" },
] as const;

export const DAY_COUNT_OPTIONS: DayCountBasis[] = ["365", "360"];

export const ROUNDING_OPTIONS: RoundingMode[] = ["nearest", "up", "down"];

export const DEFAULT_LOCALE_OPTIONS: DefaultLocaleOption[] = [
  "en",
  "bn",
  "hi",
  "or",
];
