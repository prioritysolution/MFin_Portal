"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PageToast } from "@/components/ui/PageToast";
import { Button } from "@/components/ui/Button";
import { CheckboxField, SelectField, TextField } from "@/components/ui/Form";
import type { ApplOption } from "@/features/master/appl-options";
import type { AcctLedger } from "@/features/master/acct-ledger/types/acct-ledger.types";
import {
  FIGURE_FIXED_OPT_CODE,
  FIGURE_PERCENT_OPT_CODE,
} from "../constants";
import { chargeSetupSaveInputSchema } from "../schemas/charges-setup.schema";
import type {
  ChargeKind,
  ChargeSetup,
  ChargeSetupSaveInput,
} from "../types/charges-setup.types";

type ChargesSetupFormProps = {
  open: boolean;
  mode: "create" | "edit";
  kind: ChargeKind;
  charge: ChargeSetup | null;
  figureOptions: ApplOption[];
  duringOptions: ApplOption[];
  ledgers: AcctLedger[];
  saving: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (input: ChargeSetupSaveInput) => Promise<void> | void;
};

type FormState = {
  chargeName: string;
  chargeRate: string;
  figureCd: string;
  maxAmount: string;
  taxPercent: string;
  duringCd: string;
  chargesGl: string;
  isActive: boolean;
};

function toFormState(charge: ChargeSetup | null): FormState {
  if (!charge) {
    return {
      chargeName: "",
      chargeRate: "",
      figureCd: "",
      maxAmount: "",
      taxPercent: "",
      duringCd: "",
      chargesGl: "",
      isActive: true,
    };
  }
  return {
    chargeName: charge.chargeName,
    chargeRate: charge.chargeRate != null ? String(charge.chargeRate) : "",
    figureCd: charge.figureCd != null ? String(charge.figureCd) : "",
    maxAmount: charge.maxAmount != null ? String(charge.maxAmount) : "",
    taxPercent: String(charge.taxPercent),
    duringCd: charge.duringCd != null ? String(charge.duringCd) : "",
    chargesGl: charge.chargesGl != null ? String(charge.chargesGl) : "",
    isActive: charge.isActive,
  };
}

export function ChargesSetupForm({
  open,
  mode,
  kind,
  charge,
  figureOptions,
  duringOptions,
  ledgers,
  saving,
  errorMessage,
  onClose,
  onSubmit,
}: ChargesSetupFormProps) {
  const t = useTranslations("master.chargesSetup");
  const formKey =
    mode === "edit" ? `edit-${charge?.chargeId ?? 0}` : `create-${kind}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? t("createTitle") : t("editTitle")}
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="charges-setup-form"
            icon={Save}
            disabled={saving}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </>
      }
    >
      <ChargesSetupFormBody
        key={formKey}
        mode={mode}
        kind={kind}
        charge={charge}
        figureOptions={figureOptions}
        duringOptions={duringOptions}
        ledgers={ledgers}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function ChargesSetupFormBody({
  mode,
  kind,
  charge,
  figureOptions,
  duringOptions,
  ledgers,
  errorMessage,
  onSubmit,
}: {
  mode: "create" | "edit";
  kind: ChargeKind;
  charge: ChargeSetup | null;
  figureOptions: ApplOption[];
  duringOptions: ApplOption[];
  ledgers: AcctLedger[];
  errorMessage?: string | null;
  onSubmit: (input: ChargeSetupSaveInput) => Promise<void> | void;
}) {
  const t = useTranslations("master.chargesSetup");
  const tUi = useTranslations("ui");
  const [form, setForm] = useState<FormState>(() => toFormState(charge));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const duringLabel =
    kind === "loan" ? t("fields.deductDuringCd") : t("fields.chargesDuringCd");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }

  const figureSelectOptions = useMemo(() => {
    const options = figureOptions.map((option) => ({
      value: String(option.optCode),
      label: option.optDescription,
    }));
    if (
      form.figureCd &&
      !options.some((option) => option.value === form.figureCd)
    ) {
      options.push({
        value: form.figureCd,
        label: charge?.figureDesc || form.figureCd,
      });
    }
    return options;
  }, [charge?.figureDesc, figureOptions, form.figureCd]);

  const duringSelectOptions = useMemo(() => {
    const options = duringOptions.map((option) => ({
      value: String(option.optCode),
      label: option.optDescription,
    }));
    if (
      form.duringCd &&
      !options.some((option) => option.value === form.duringCd)
    ) {
      options.push({
        value: form.duringCd,
        label: charge?.duringDesc || form.duringCd,
      });
    }
    return options;
  }, [charge?.duringDesc, duringOptions, form.duringCd]);

  const ledgerSelectOptions = useMemo(() => {
    const options = [
      { value: "", label: t("placeholders.ledgerNone") },
      ...ledgers.map((ledger) => ({
        value: String(ledger.ledgerId),
        label: `${ledger.ledgerName} (${ledger.ledgerCode})`,
      })),
    ];
    if (
      charge?.chargesGl &&
      !options.some((option) => option.value === String(charge.chargesGl))
    ) {
      options.push({
        value: String(charge.chargesGl),
        label: charge.chargesGlName
          ? `${charge.chargesGlName}${charge.chargesGlCode ? ` (${charge.chargesGlCode})` : ""}`
          : String(charge.chargesGl),
      });
    }
    return options;
  }, [charge, ledgers, t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const payload: ChargeSetupSaveInput = {
      chargeId: mode === "edit" ? charge?.chargeId : undefined,
      chargeName: form.chargeName.trim(),
      chargeRate:
        form.chargeRate !== "" ? Number(form.chargeRate) : Number.NaN,
      figureCd: form.figureCd !== "" ? Number(form.figureCd) : 0,
      maxAmount: form.maxAmount !== "" ? Number(form.maxAmount) : null,
      taxPercent: form.taxPercent !== "" ? Number(form.taxPercent) : 0,
      duringCd: form.duringCd !== "" ? Number(form.duringCd) : 0,
      chargesGl: form.chargesGl !== "" ? Number(form.chargesGl) : null,
      isActive: form.isActive,
    };

    const parsed = chargeSetupSaveInputSchema.safeParse(payload);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const percentTooHigh =
        Number(form.figureCd) === FIGURE_PERCENT_OPT_CODE &&
        Number(form.chargeRate) > 100;
      const maxBelowRate =
        Number(form.figureCd) === FIGURE_FIXED_OPT_CODE &&
        form.maxAmount !== "" &&
        Number(form.maxAmount) < Number(form.chargeRate);
      setFieldErrors({
        chargeName: flat.chargeName ? t("errors.chargeName") : "",
        chargeRate: flat.chargeRate
          ? percentTooHigh
            ? t("errors.chargeRatePercent")
            : t("errors.chargeRate")
          : "",
        figureCd: flat.figureCd ? t("errors.figureCd") : "",
        maxAmount: flat.maxAmount
          ? maxBelowRate
            ? t("errors.maxAmountBelowRate")
            : t("errors.maxAmount")
          : "",
        taxPercent: flat.taxPercent ? t("errors.taxPercent") : "",
        duringCd: flat.duringCd ? t("errors.chargesDuringCd") : "",
        chargesGl: flat.chargesGl ? t("errors.chargesGl") : "",
      });
      return;
    }

    await onSubmit(parsed.data);
  }

  return (
    <form
      id="charges-setup-form"
      className="space-y-4"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <PageToast message={errorMessage ?? null} tone="error" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label={t("fields.chargeName")}
          value={form.chargeName}
          required
          maxLength={100}
          placeholder={t("placeholders.chargeName")}
          error={fieldErrors.chargeName || undefined}
          onChange={(value) => updateField("chargeName", value)}
        />
        <TextField
          label={t("fields.chargeRate")}
          value={form.chargeRate}
          type="number"
          min={0}
          max={999999.99}
          step="0.01"
          required
          error={fieldErrors.chargeRate || undefined}
          onChange={(value) => updateField("chargeRate", value)}
        />
        <SelectField
          label={t("fields.figureCd")}
          value={form.figureCd}
          required
          placeholder={t("placeholders.selectFigure")}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          error={fieldErrors.figureCd || undefined}
          options={figureSelectOptions}
          onChange={(value) => updateField("figureCd", value)}
        />
        <TextField
          label={t("fields.maxAmount")}
          value={form.maxAmount}
          type="number"
          min={0}
          max={999999.99}
          step="0.01"
          error={fieldErrors.maxAmount || undefined}
          onChange={(value) => updateField("maxAmount", value)}
        />
        <TextField
          label={t("fields.taxPercent")}
          value={form.taxPercent}
          type="number"
          min={0}
          max={100}
          step="0.01"
          error={fieldErrors.taxPercent || undefined}
          onChange={(value) => updateField("taxPercent", value)}
        />
        <SelectField
          label={duringLabel}
          value={form.duringCd}
          required
          placeholder={t("placeholders.selectDuring")}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          error={fieldErrors.duringCd || undefined}
          options={duringSelectOptions}
          onChange={(value) => updateField("duringCd", value)}
        />
        <div className="sm:col-span-2">
          <SelectField
            label={t("fields.chargesGl")}
            value={form.chargesGl}
            placeholder={t("placeholders.selectLedger")}
            searchPlaceholder={tUi("selectSearch")}
            emptyMessage={tUi("selectEmpty")}
            error={fieldErrors.chargesGl || undefined}
            options={ledgerSelectOptions}
            onChange={(value) => updateField("chargesGl", value)}
          />
        </div>
      </div>

      <CheckboxField
        label={t("fields.isActive")}
        checked={form.isActive}
        onChange={(checked) => updateField("isActive", checked)}
      />
    </form>
  );
}
