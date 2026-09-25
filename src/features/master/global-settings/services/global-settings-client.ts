import {
  GLOBAL_SETTINGS_DEFAULTS,
  type DateFormatOption,
  type DayCountBasis,
  type DefaultLocaleOption,
  type GlobalSettings,
  type GlobalSettingsUpdateInput,
  type RoundingMode,
} from "@/features/master/global-settings/types/global-settings.types";
import { globalSettingsUpdateInputSchema } from "@/features/master/global-settings/schemas/global-settings.schema";

const STORAGE_KEY = "mfin.master.globalSettings";

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function mergeWithDefaults(raw: unknown): GlobalSettings {
  const src =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};

  const dateFormat = asString(
    src.dateFormat,
    GLOBAL_SETTINGS_DEFAULTS.dateFormat,
  ) as DateFormatOption;
  const dayCountBasis = asString(
    src.dayCountBasis,
    GLOBAL_SETTINGS_DEFAULTS.dayCountBasis,
  ) as DayCountBasis;
  const roundingMode = asString(
    src.roundingMode,
    GLOBAL_SETTINGS_DEFAULTS.roundingMode,
  ) as RoundingMode;
  const defaultLocale = asString(
    src.defaultLocale,
    GLOBAL_SETTINGS_DEFAULTS.defaultLocale,
  ) as DefaultLocaleOption;

  return {
    timezone: asString(src.timezone, GLOBAL_SETTINGS_DEFAULTS.timezone),
    dateFormat: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].includes(dateFormat)
      ? dateFormat
      : GLOBAL_SETTINGS_DEFAULTS.dateFormat,
    currencyCode: asString(
      src.currencyCode,
      GLOBAL_SETTINGS_DEFAULTS.currencyCode,
    ),
    decimalPlaces: asNumber(
      src.decimalPlaces,
      GLOBAL_SETTINGS_DEFAULTS.decimalPlaces,
    ),
    defaultLocale: ["en", "bn", "hi", "or"].includes(defaultLocale)
      ? defaultLocale
      : GLOBAL_SETTINGS_DEFAULTS.defaultLocale,
    dayCountBasis: ["365", "360"].includes(dayCountBasis)
      ? dayCountBasis
      : GLOBAL_SETTINGS_DEFAULTS.dayCountBasis,
    roundingMode: ["nearest", "up", "down"].includes(roundingMode)
      ? roundingMode
      : GLOBAL_SETTINGS_DEFAULTS.roundingMode,
    allowBackdatedTxn: asBoolean(
      src.allowBackdatedTxn,
      GLOBAL_SETTINGS_DEFAULTS.allowBackdatedTxn,
    ),
    maxBackdateDays: asNumber(
      src.maxBackdateDays,
      GLOBAL_SETTINGS_DEFAULTS.maxBackdateDays,
    ),
    multiBranchAccess: asBoolean(
      src.multiBranchAccess,
      GLOBAL_SETTINGS_DEFAULTS.multiBranchAccess,
    ),
    requireMakerCheckerMasters: asBoolean(
      src.requireMakerCheckerMasters,
      GLOBAL_SETTINGS_DEFAULTS.requireMakerCheckerMasters,
    ),
    forceEodBeforeNextDay: asBoolean(
      src.forceEodBeforeNextDay,
      GLOBAL_SETTINGS_DEFAULTS.forceEodBeforeNextDay,
    ),
    auditRetentionDays: asNumber(
      src.auditRetentionDays,
      GLOBAL_SETTINGS_DEFAULTS.auditRetentionDays,
    ),
  };
}

/**
 * Local persistence until a documented Laravel Global Settings API exists.
 * Does not invent BFF or backend endpoints.
 */
export async function fetchGlobalSettings(): Promise<GlobalSettings> {
  if (typeof window === "undefined") {
    return { ...GLOBAL_SETTINGS_DEFAULTS };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...GLOBAL_SETTINGS_DEFAULTS };
    return mergeWithDefaults(JSON.parse(raw) as unknown);
  } catch {
    return { ...GLOBAL_SETTINGS_DEFAULTS };
  }
}

export async function saveGlobalSettings(
  input: GlobalSettingsUpdateInput,
): Promise<GlobalSettings> {
  const parsed = globalSettingsUpdateInputSchema.parse(input);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  }

  return parsed;
}
