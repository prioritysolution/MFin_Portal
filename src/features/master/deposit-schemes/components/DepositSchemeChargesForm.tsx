"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PageToast } from "@/components/ui/PageToast";
import { Button } from "@/components/ui/Button";
import {
  CheckboxField,
  TextField,
  SelectField,
  DateField,
} from "@/components/ui/Form";
import { depositSchemeChargeSaveInputSchema } from "@/features/master/deposit-schemes/schemas/deposit-schemes.schema";
import { fetchApplOptions } from "@/features/master/appl-options";
import { fetchAcctLedgerList } from "@/features/master/acct-ledger";
import type { ApplOption } from "@/features/master/appl-options";
import type { AcctLedger } from "@/features/master/acct-ledger/types/acct-ledger.types";
import type {
  DepositSchemeCharge,
  DepositSchemeChargeSaveInput,
} from "@/features/master/deposit-schemes/types/deposit-schemes.types";

type DepositSchemeChargesFormProps = {
  open: boolean;
  mode: "create" | "edit";
  charge: DepositSchemeCharge | null;
  schemes?: { id: number; schemeName: string }[];
  saving: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (input: DepositSchemeChargeSaveInput) => Promise<void> | void;
};

type FormState = {
  schemeId: string;
  chargesCd: string;
  chargesFig: string;
  figureCd: string;
  chargesGl: string;
  runDurationCd: string;
  effectFrm: string;
  effectUpto: string;
  isActive: boolean;
};

function toFormState(charge: DepositSchemeCharge | null): FormState {
  if (!charge) {
    return {
      schemeId: "",
      chargesCd: "",
      chargesFig: "",
      figureCd: "",
      chargesGl: "",
      runDurationCd: "",
      effectFrm: new Date().toISOString().split("T")[0],
      effectUpto: "",
      isActive: true,
    };
  }
  return {
    schemeId: charge.schemeId ? String(charge.schemeId) : "",
    chargesCd: charge.chargesCd ? String(charge.chargesCd) : "",
    chargesFig: charge.chargesFig != null ? String(charge.chargesFig) : "",
    figureCd: charge.figureCd ? String(charge.figureCd) : "",
    chargesGl: charge.chargesGl != null ? String(charge.chargesGl) : "",
    runDurationCd:
      charge.runDurationCd != null ? String(charge.runDurationCd) : "",
    effectFrm: charge.effectFrm ?? "",
    effectUpto: charge.effectUpto ?? "",
    isActive: charge.isActive,
  };
}

export function DepositSchemeChargesForm({
  open,
  mode,
  charge,
  schemes,
  saving,
  errorMessage,
  onClose,
  onSubmit,
}: DepositSchemeChargesFormProps) {
  const t = useTranslations("master.depositSchemes.charges");
  const formKey = mode === "edit" ? `edit-${charge?.id ?? 0}` : "create";

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
            form="deposit-scheme-charges-form"
            icon={Save}
            disabled={saving}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </>
      }
    >
      <DepositSchemeChargesFormBody
        key={formKey}
        mode={mode}
        charge={charge}
        schemes={schemes}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function DepositSchemeChargesFormBody({
  mode,
  charge,
  schemes,
  errorMessage,
  onSubmit,
}: {
  mode: "create" | "edit";
  charge: DepositSchemeCharge | null;
  schemes?: { id: number; schemeName: string }[];
  errorMessage?: string | null;
  onSubmit: (input: DepositSchemeChargeSaveInput) => Promise<void> | void;
}) {
  const t = useTranslations("master.depositSchemes.charges");
  const tGlobal = useTranslations("master.depositSchemes");
  const tUi = useTranslations("ui");

  const [form, setForm] = useState<FormState>(() => toFormState(charge));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Dynamic Options from API
  const [chargesCdOptions, setChargesCdOptions] = useState<ApplOption[]>([]);
  const [figureCdOptions, setFigureCdOptions] = useState<ApplOption[]>([]);
  const [durationOptions, setDurationOptions] = useState<ApplOption[]>([]);
  const [ledgers, setLedgers] = useState<AcctLedger[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialOptions() {
      try {
        const [cOpts, fOpts, dOpts, ledgResult] = await Promise.all([
          fetchApplOptions(15), // Group 15: Deposit Charges
          fetchApplOptions(16), // Group 16: Figure In
          fetchApplOptions(8), // Group 8: Duration
          fetchAcctLedgerList({ isActive: 1, perPage: 200 }),
        ]);
        if (cancelled) return;
        setChargesCdOptions(cOpts);
        setFigureCdOptions(fOpts);
        setDurationOptions(dOpts);
        setLedgers(ledgResult.items);
      } catch {
        // Fallbacks
      }
    }

    void loadInitialOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const payload: DepositSchemeChargeSaveInput = {
      ...(mode === "edit" && charge ? { id: charge.id } : {}),
      schemeId:
        form.schemeId !== "" ? Number(form.schemeId) : (0 as unknown as number),
      chargesCd:
        form.chargesCd !== "" ? Number(form.chargesCd) : (0 as unknown as number),
      chargesFig:
        form.chargesFig !== ""
          ? Number(form.chargesFig)
          : (NaN as unknown as number),
      figureCd:
        form.figureCd !== "" ? Number(form.figureCd) : (0 as unknown as number),
      chargesGl: form.chargesGl !== "" ? Number(form.chargesGl) : null,
      runDurationCd:
        form.runDurationCd !== "" ? Number(form.runDurationCd) : null,
      effectFrm: form.effectFrm,
      effectUpto: form.effectUpto !== "" ? form.effectUpto : null,
      isActive: form.isActive,
    };

    const parsed = depositSchemeChargeSaveInputSchema.safeParse(payload);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const isPercentageOverflow =
        Number(form.figureCd) === 2 && Number(form.chargesFig) > 100;
      const isEffectUptoBeforeFrom = Boolean(
        form.effectUpto && form.effectFrm && form.effectUpto < form.effectFrm,
      );

      setFieldErrors({
        schemeId: flat.schemeId ? tGlobal("errors.schemeId") : "",
        chargesCd: flat.chargesCd ? tGlobal("errors.chargesType") : "",
        chargesFig: flat.chargesFig
          ? isPercentageOverflow
            ? tGlobal("errors.percentageMax")
            : tGlobal("errors.chargesFigures")
          : "",
        figureCd: flat.figureCd ? tGlobal("errors.figureType") : "",
        chargesGl: flat.chargesGl ? tGlobal("errors.chargesGl") : "",
        runDurationCd: flat.runDurationCd ? tGlobal("errors.runDuration") : "",
        effectFrm: flat.effectFrm ? tGlobal("errors.effectFrom") : "",
        effectUpto: flat.effectUpto
          ? isEffectUptoBeforeFrom
            ? tGlobal("errors.effectToAfterFrom")
            : tGlobal("errors.effectTo")
          : "",
      });
      return;
    }

    await onSubmit(parsed.data);
  }

  const schemeSelectOptions =
    schemes && schemes.length > 0
      ? schemes.map((s) => ({ value: String(s.id), label: s.schemeName }))
      : [];

  const chargesCdSelectOptions =
    chargesCdOptions.length > 0
      ? chargesCdOptions.map((o) => ({
          value: String(o.optCode),
          label: o.optDescription,
        }))
      : [
          { value: "1", label: "Premature Withdrawal" },
          { value: "2", label: "Late Payment" },
          { value: "3", label: "Service Charge" },
          { value: "4", label: "SMS Charges" },
        ];

  const figureCdSelectOptions =
    figureCdOptions.length > 0
      ? figureCdOptions.map((o) => ({
          value: String(o.optCode),
          label: o.optDescription,
        }))
      : [
          { value: "1", label: "Amount" },
          { value: "2", label: "Percentage" },
        ];

  const durationSelectOptions = [
    { value: "", label: "-- None --" },
    ...(durationOptions.length > 0
      ? durationOptions.map((o) => ({
          value: String(o.optCode),
          label: o.optDescription,
        }))
      : [
          { value: "1", label: "Daily" },
          { value: "2", label: "Weekly" },
          { value: "3", label: "Fortnightly" },
          { value: "4", label: "Monthly" },
          { value: "5", label: "Quarterly" },
          { value: "6", label: "Half-Yearly" },
          { value: "7", label: "Yearly" },
        ]),
  ];

  const ledgerSelectOptions = useMemo(() => {
    const opts = [
      { value: "", label: "-- None --" },
      ...ledgers.map((l) => ({
        value: String(l.ledgerId),
        label: `${l.ledgerName} (${l.ledgerCode})`,
      })),
    ];
    if (
      charge?.chargesGl &&
      !opts.some((o) => o.value === String(charge.chargesGl))
    ) {
      opts.push({
        value: String(charge.chargesGl),
        label: charge.chargesGlName
          ? `${charge.chargesGlName} (${charge.chargesGlCode || `LD-${charge.chargesGl}`})`
          : `Ledger #${charge.chargesGl}`,
      });
    }
    return opts;
  }, [ledgers, charge]);

  return (
    <form
      id="deposit-scheme-charges-form"
      className="space-y-4"
      onSubmit={(e) => void handleSubmit(e)}
    >
      <PageToast message={errorMessage ?? null} tone="error" />

      <SelectField
        label={t("fields.scheme")}
        value={form.schemeId}
        required
        error={fieldErrors.schemeId || undefined}
        searchPlaceholder={tUi("selectSearch")}
        emptyMessage={tUi("selectEmpty")}
        options={schemeSelectOptions}
        onChange={(value) => updateField("schemeId", value)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label={t("fields.chargesType")}
          value={form.chargesCd}
          required
          error={fieldErrors.chargesCd || undefined}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          options={chargesCdSelectOptions}
          onChange={(value) => updateField("chargesCd", value)}
        />
        <SelectField
          label={t("fields.figureType")}
          value={form.figureCd}
          required
          error={fieldErrors.figureCd || undefined}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          options={figureCdSelectOptions}
          onChange={(value) => updateField("figureCd", value)}
        />
        <TextField
          label={t("fields.chargesFigures")}
          value={form.chargesFig}
          type="number"
          step="0.01"
          required
          error={fieldErrors.chargesFig || undefined}
          onChange={(value) => updateField("chargesFig", value)}
        />
        <SelectField
          label={t("fields.chargesGl")}
          value={form.chargesGl}
          error={fieldErrors.chargesGl || undefined}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          options={ledgerSelectOptions}
          onChange={(value) => updateField("chargesGl", value)}
        />
        <SelectField
          label={t("fields.runDuration")}
          value={form.runDurationCd}
          error={fieldErrors.runDurationCd || undefined}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          options={durationSelectOptions}
          onChange={(value) => updateField("runDurationCd", value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateField
          label={t("fields.effectFrom")}
          value={form.effectFrm}
          required
          error={fieldErrors.effectFrm || undefined}
          onChange={(value) => updateField("effectFrm", value)}
        />
        <DateField
          label={t("fields.effectTo")}
          value={form.effectUpto}
          error={fieldErrors.effectUpto || undefined}
          onChange={(value) => updateField("effectUpto", value)}
        />
      </div>

      <CheckboxField
        label={t("fields.isActive")}
        checked={form.isActive}
        onChange={(checked) => updateField("isActive", checked)}
      />
    </form>
  );
}
