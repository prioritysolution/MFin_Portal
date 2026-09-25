"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PageToast, useToastText } from "@/components/ui/PageToast";
import { Card } from "@/components/ui/Card";
import { CheckboxField, SelectField, TextField } from "@/components/ui/Form";
import { LoadingState } from "@/components/shared/LoadingState";
import {
  fetchGlobalSettings,
  saveGlobalSettings,
} from "@/features/master/global-settings/services/global-settings-client";
import { globalSettingsUpdateInputSchema } from "@/features/master/global-settings/schemas/global-settings.schema";
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  DAY_COUNT_OPTIONS,
  DEFAULT_LOCALE_OPTIONS,
  GLOBAL_SETTINGS_DEFAULTS,
  ROUNDING_OPTIONS,
  TIMEZONE_OPTIONS,
  type DateFormatOption,
  type DayCountBasis,
  type DefaultLocaleOption,
  type GlobalSettings,
  type RoundingMode,
} from "@/features/master/global-settings/types/global-settings.types";

type FormState = {
  timezone: string;
  dateFormat: DateFormatOption;
  currencyCode: string;
  decimalPlaces: string;
  defaultLocale: DefaultLocaleOption;
  dayCountBasis: DayCountBasis;
  roundingMode: RoundingMode;
  allowBackdatedTxn: boolean;
  maxBackdateDays: string;
  multiBranchAccess: boolean;
  requireMakerCheckerMasters: boolean;
  forceEodBeforeNextDay: boolean;
  auditRetentionDays: string;
};

type LoadStatus = { status: "loading" } | { status: "ready" };

function toFormState(data: GlobalSettings): FormState {
  return {
    timezone: data.timezone,
    dateFormat: data.dateFormat,
    currencyCode: data.currencyCode,
    decimalPlaces: String(data.decimalPlaces),
    defaultLocale: data.defaultLocale,
    dayCountBasis: data.dayCountBasis,
    roundingMode: data.roundingMode,
    allowBackdatedTxn: data.allowBackdatedTxn,
    maxBackdateDays: String(data.maxBackdateDays),
    multiBranchAccess: data.multiBranchAccess,
    requireMakerCheckerMasters: data.requireMakerCheckerMasters,
    forceEodBeforeNextDay: data.forceEodBeforeNextDay,
    auditRetentionDays: String(data.auditRetentionDays),
  };
}

function parseWholeNumber(raw: string): number {
  if (!/^\d+$/.test(raw.trim())) return Number.NaN;
  return Number(raw.trim());
}

export function GlobalSettingsForm() {
  const t = useTranslations("master.globalSettings");
  const tErrors = useTranslations("errors");

  const [loadState, setLoadState] = useState<LoadStatus>({ status: "loading" });
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useToastText();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState({ status: "loading" });
      setFormError(null);
      setSuccessMessage(null);

      try {
        const data = await fetchGlobalSettings();
        if (cancelled) return;
        setForm(toFormState(data));
        setLoadState({ status: "ready" });
      } catch {
        if (cancelled) return;
        setForm(toFormState(GLOBAL_SETTINGS_DEFAULTS));
        setLoadState({ status: "ready" });
        setFormError(tErrors("generic"));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [setSuccessMessage, tErrors]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    setFormError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const payload = {
      timezone: form.timezone,
      dateFormat: form.dateFormat,
      currencyCode: form.currencyCode,
      decimalPlaces: parseWholeNumber(form.decimalPlaces),
      defaultLocale: form.defaultLocale,
      dayCountBasis: form.dayCountBasis,
      roundingMode: form.roundingMode,
      allowBackdatedTxn: form.allowBackdatedTxn,
      maxBackdateDays: parseWholeNumber(form.maxBackdateDays),
      multiBranchAccess: form.multiBranchAccess,
      requireMakerCheckerMasters: form.requireMakerCheckerMasters,
      forceEodBeforeNextDay: form.forceEodBeforeNextDay,
      auditRetentionDays: parseWholeNumber(form.auditRetentionDays),
    };

    const parsed = globalSettingsUpdateInputSchema.safeParse(payload);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        timezone: flat.timezone?.[0] ?? "",
        dateFormat: flat.dateFormat?.[0] ?? "",
        currencyCode: flat.currencyCode?.[0] ?? "",
        decimalPlaces: flat.decimalPlaces?.[0] ?? "",
        defaultLocale: flat.defaultLocale?.[0] ?? "",
        dayCountBasis: flat.dayCountBasis?.[0] ?? "",
        roundingMode: flat.roundingMode?.[0] ?? "",
        maxBackdateDays: flat.maxBackdateDays?.[0] ?? "",
        auditRetentionDays: flat.auditRetentionDays?.[0] ?? "",
      });
      setFormError(t("validationFailed"));
      return;
    }

    setSaving(true);
    try {
      const updated = await saveGlobalSettings(parsed.data);
      setForm(toFormState(updated));
      setSuccessMessage(t("saveSuccess"));
    } catch {
      setFormError(tErrors("generic"));
    } finally {
      setSaving(false);
    }
  }

  if (loadState.status === "loading" || !form) {
    return <LoadingState title={t("loading")} />;
  }

  const timezoneOptions = TIMEZONE_OPTIONS.map((item) => ({
    value: item.value,
    label: t(item.labelKey),
  }));

  const dateFormatOptions = DATE_FORMAT_OPTIONS.map((value) => ({
    value,
    label: value,
  }));

  const currencyOptions = CURRENCY_OPTIONS.map((item) => ({
    value: item.value,
    label: t(item.labelKey),
  }));

  const localeOptions = DEFAULT_LOCALE_OPTIONS.map((value) => ({
    value,
    label: t(`options.locale.${value}`),
  }));

  const dayCountOptions = DAY_COUNT_OPTIONS.map((value) => ({
    value,
    label: t(`options.dayCount.${value}`),
  }));

  const roundingOptions = ROUNDING_OPTIONS.map((value) => ({
    value,
    label: t(`options.rounding.${value}`),
  }));

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <PageToast message={successMessage} />

      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <Alert tone="info">{t("localOnlyHint")}</Alert>

      <form
        id="global-settings-form"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
          <Card
            title={t("sections.locale.title")}
            description={t("sections.locale.hint")}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SelectField
                label={t("fields.timezone")}
                value={form.timezone}
                required
                searchable={false}
                options={timezoneOptions}
                error={fieldErrors.timezone || undefined}
                onChange={(value) => updateField("timezone", value)}
              />
              <SelectField
                label={t("fields.dateFormat")}
                value={form.dateFormat}
                required
                searchable={false}
                options={dateFormatOptions}
                error={fieldErrors.dateFormat || undefined}
                onChange={(value) =>
                  updateField("dateFormat", value as DateFormatOption)
                }
              />
              <SelectField
                label={t("fields.currencyCode")}
                value={form.currencyCode}
                required
                searchable={false}
                options={currencyOptions}
                error={fieldErrors.currencyCode || undefined}
                onChange={(value) => updateField("currencyCode", value)}
              />
              <TextField
                label={t("fields.decimalPlaces")}
                value={form.decimalPlaces}
                required
                inputMode="numeric"
                restrict="digits"
                hint={t("hints.decimalPlaces")}
                error={fieldErrors.decimalPlaces || undefined}
                onChange={(value) => updateField("decimalPlaces", value)}
              />
              <SelectField
                label={t("fields.defaultLocale")}
                value={form.defaultLocale}
                required
                searchable={false}
                options={localeOptions}
                error={fieldErrors.defaultLocale || undefined}
                onChange={(value) =>
                  updateField("defaultLocale", value as DefaultLocaleOption)
                }
              />
            </div>
          </Card>

          <Card
            title={t("sections.accounting.title")}
            description={t("sections.accounting.hint")}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SelectField
                label={t("fields.dayCountBasis")}
                value={form.dayCountBasis}
                required
                searchable={false}
                options={dayCountOptions}
                error={fieldErrors.dayCountBasis || undefined}
                onChange={(value) =>
                  updateField("dayCountBasis", value as DayCountBasis)
                }
              />
              <SelectField
                label={t("fields.roundingMode")}
                value={form.roundingMode}
                required
                searchable={false}
                options={roundingOptions}
                error={fieldErrors.roundingMode || undefined}
                onChange={(value) =>
                  updateField("roundingMode", value as RoundingMode)
                }
              />
              <TextField
                label={t("fields.maxBackdateDays")}
                value={form.maxBackdateDays}
                required
                inputMode="numeric"
                restrict="digits"
                disabled={!form.allowBackdatedTxn}
                hint={t("hints.maxBackdateDays")}
                error={fieldErrors.maxBackdateDays || undefined}
                onChange={(value) => updateField("maxBackdateDays", value)}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <CheckboxField
                label={t("fields.allowBackdatedTxn")}
                checked={form.allowBackdatedTxn}
                onChange={(checked) => {
                  updateField("allowBackdatedTxn", checked);
                  if (!checked) updateField("maxBackdateDays", "0");
                  else if (form.maxBackdateDays === "0") {
                    updateField("maxBackdateDays", "7");
                  }
                }}
              />
            </div>
          </Card>

          <Card
            title={t("sections.controls.title")}
            description={t("sections.controls.hint")}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField
                label={t("fields.auditRetentionDays")}
                value={form.auditRetentionDays}
                required
                inputMode="numeric"
                restrict="digits"
                hint={t("hints.auditRetentionDays")}
                error={fieldErrors.auditRetentionDays || undefined}
                onChange={(value) => updateField("auditRetentionDays", value)}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <CheckboxField
                label={t("fields.multiBranchAccess")}
                checked={form.multiBranchAccess}
                onChange={(checked) => updateField("multiBranchAccess", checked)}
              />
              <CheckboxField
                label={t("fields.requireMakerCheckerMasters")}
                checked={form.requireMakerCheckerMasters}
                onChange={(checked) =>
                  updateField("requireMakerCheckerMasters", checked)
                }
              />
              <CheckboxField
                label={t("fields.forceEodBeforeNextDay")}
                checked={form.forceEodBeforeNextDay}
                onChange={(checked) =>
                  updateField("forceEodBeforeNextDay", checked)
                }
              />
            </div>

            <div className="btn-actions mt-5 border-t border-border pt-4">
              <Button type="submit" disabled={saving} icon={Settings}>
                {saving ? t("saving") : t("save")}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
