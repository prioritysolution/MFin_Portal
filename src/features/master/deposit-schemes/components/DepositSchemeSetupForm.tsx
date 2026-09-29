"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PageToast } from "@/components/ui/PageToast";
import { Button } from "@/components/ui/Button";
import { CheckboxField, TextField, SelectField } from "@/components/ui/Form";
import { depositSchemeSetupSaveInputSchema } from "../schemas/deposit-schemes.schema";
import { fetchApplOptions } from "@/features/master/appl-options";
import { fetchAcctLedgerList } from "@/features/master/acct-ledger";
import type { ApplOption } from "@/features/master/appl-options";
import type { AcctLedger } from "@/features/master/acct-ledger/types/acct-ledger.types";
import type {
  DepositSchemeSetup,
  DepositSchemeSetupSaveInput,
} from "../types/deposit-schemes.types";

type DepositSchemeSetupFormProps = {
  open: boolean;
  mode: "create" | "edit";
  setup: DepositSchemeSetup | null;
  saving: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (input: DepositSchemeSetupSaveInput) => Promise<void> | void;
};

type FormState = {
  schemeName: string;
  depositTypeCd: string;
  prodTypeCd: string;
  roiPercent: string;
  inttTypeCd: string;
  inttPayoutCd: string;
  minBalance: string;
  withdAllow: boolean;
  maxWithdAmt: string;
  inopDays: string;
  prnLedger: string;
  inttLedg: string;
  fieldColl: boolean;
  isActive: boolean;
};

function toFormState(setup: DepositSchemeSetup | null): FormState {
  if (!setup) {
    return {
      schemeName: "",
      depositTypeCd: "",
      prodTypeCd: "",
      roiPercent: "",
      inttTypeCd: "",
      inttPayoutCd: "",
      minBalance: "",
      withdAllow: false,
      maxWithdAmt: "",
      inopDays: "",
      prnLedger: "",
      inttLedg: "",
      fieldColl: false,
      isActive: true,
    };
  }
  return {
    schemeName: setup.schemeName,
    depositTypeCd: setup.depositTypeCd ? String(setup.depositTypeCd) : "",
    prodTypeCd: setup.prodTypeCd ? String(setup.prodTypeCd) : "",
    roiPercent: setup.roiPercent != null ? String(setup.roiPercent) : "",
    inttTypeCd: setup.inttTypeCd != null ? String(setup.inttTypeCd) : "",
    inttPayoutCd: setup.inttPayoutCd != null ? String(setup.inttPayoutCd) : "",
    minBalance: setup.minBalance != null ? String(setup.minBalance) : "",
    withdAllow: setup.withdAllow,
    maxWithdAmt: setup.maxWithdAmt != null ? String(setup.maxWithdAmt) : "",
    inopDays: setup.inopDays != null ? String(setup.inopDays) : "",
    prnLedger: setup.prnLedger != null ? String(setup.prnLedger) : "",
    inttLedg: setup.inttLedg != null ? String(setup.inttLedg) : "",
    fieldColl: setup.fieldColl,
    isActive: setup.isActive,
  };
}

export function DepositSchemeSetupForm({
  open,
  mode,
  setup,
  saving,
  errorMessage,
  onClose,
  onSubmit,
}: DepositSchemeSetupFormProps) {
  const t = useTranslations("master.depositSchemes.setup");
  const formKey = mode === "edit" ? `edit-${setup?.id ?? 0}` : "create";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? t("createTitle") : t("editTitle")}
      size="lg"
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
            form="deposit-scheme-setup-form"
            icon={Save}
            disabled={saving}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </>
      }
    >
      <DepositSchemeSetupFormBody
        key={formKey}
        mode={mode}
        setup={setup}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function DepositSchemeSetupFormBody({
  mode,
  setup,
  errorMessage,
  onSubmit,
}: {
  mode: "create" | "edit";
  setup: DepositSchemeSetup | null;
  errorMessage?: string | null;
  onSubmit: (input: DepositSchemeSetupSaveInput) => Promise<void> | void;
}) {
  const t = useTranslations("master.depositSchemes.setup");
  const tGlobal = useTranslations("master.depositSchemes");
  const tUi = useTranslations("ui");

  const [form, setForm] = useState<FormState>(() => toFormState(setup));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Dynamic Options from API
  const [depositTypeOptions, setDepositTypeOptions] = useState<ApplOption[]>([]);
  const [sbProdOptions, setSbProdOptions] = useState<ApplOption[]>([]);
  const [tdProdOptions, setTdProdOptions] = useState<ApplOption[]>([]);
  const [inttTypeOptions, setInttTypeOptions] = useState<ApplOption[]>([]);
  const [inttPayoutOptions, setInttPayoutOptions] = useState<ApplOption[]>([]);
  const [ledgers, setLedgers] = useState<AcctLedger[]>([]);

  // Load General Dropdowns
  useEffect(() => {
    let cancelled = false;

    async function loadInitialOptions() {
      try {
        const [dt, sb, td, it, ip, ledgResult] = await Promise.all([
          fetchApplOptions(3), // Group 3: Deposit Type
          fetchApplOptions(5), // Group 5: SB Product Type
          fetchApplOptions(6), // Group 6: TD Product Type
          fetchApplOptions(12), // Group 12: Deposit Intt Type
          fetchApplOptions(10), // Group 10: Interest Payout
          fetchAcctLedgerList({ isActive: 1, perPage: 200 }),
        ]);
        if (cancelled) return;
        setDepositTypeOptions(dt);
        setSbProdOptions(sb);
        setTdProdOptions(td);
        setInttTypeOptions(it);
        setInttPayoutOptions(ip);
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

    const payload: DepositSchemeSetupSaveInput = {
      ...(mode === "edit" && setup ? { schemeId: setup.id } : {}),
      schemeName: form.schemeName.trim(),
      depositTypeCd:
        form.depositTypeCd !== "" ? Number(form.depositTypeCd) : (0 as unknown as number),
      prodTypeCd:
        form.prodTypeCd !== "" ? Number(form.prodTypeCd) : (0 as unknown as number),
      roiPercent: form.roiPercent !== "" ? Number(form.roiPercent) : null,
      inttTypeCd: form.inttTypeCd !== "" ? Number(form.inttTypeCd) : null,
      inttPayoutCd: form.inttPayoutCd !== "" ? Number(form.inttPayoutCd) : null,
      minBalance: form.minBalance !== "" ? Number(form.minBalance) : null,
      withdAllow: form.withdAllow,
      maxWithdAmt:
        form.withdAllow && form.maxWithdAmt !== ""
          ? Number(form.maxWithdAmt)
          : null,
      inopDays: form.inopDays !== "" ? Number(form.inopDays) : null,
      prnLedger: form.prnLedger !== "" ? Number(form.prnLedger) : null,
      inttLedg: form.inttLedg !== "" ? Number(form.inttLedg) : null,
      fieldColl: form.fieldColl,
      isActive: form.isActive,
    };

    const parsed = depositSchemeSetupSaveInputSchema.safeParse(payload);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const isSameLedger = Boolean(
        form.prnLedger && form.inttLedg && form.prnLedger === form.inttLedg,
      );

      setFieldErrors({
        schemeName: flat.schemeName ? tGlobal("errors.schemeName") : "",
        depositTypeCd: flat.depositTypeCd ? tGlobal("errors.depositType") : "",
        prodTypeCd: flat.prodTypeCd ? tGlobal("errors.productType") : "",
        roiPercent: flat.roiPercent ? tGlobal("errors.roiPercentage") : "",
        inttTypeCd: flat.inttTypeCd ? tGlobal("errors.interestType") : "",
        inttPayoutCd: flat.inttPayoutCd ? tGlobal("errors.interestPayout") : "",
        minBalance: flat.minBalance ? tGlobal("errors.minimumBalance") : "",
        inopDays: flat.inopDays ? tGlobal("errors.iterationDays") : "",
        prnLedger: flat.prnLedger ? tGlobal("errors.principalLedger") : "",
        inttLedg: flat.inttLedg
          ? isSameLedger
            ? tGlobal("errors.sameLedgers")
            : tGlobal("errors.interestLedger")
          : "",
        maxWithdAmt: flat.maxWithdAmt ? tGlobal("errors.maxWithdrawal") : "",
      });
      return;
    }

    await onSubmit(parsed.data);
  }

  const depositTypeSelectOptions =
    depositTypeOptions.length > 0
      ? depositTypeOptions.map((o) => ({
          value: String(o.optCode),
          label: o.optDescription,
        }))
      : [
          { value: "1", label: "Savings" },
          { value: "2", label: "Term Deposit" },
        ];

  const prodTypeSelectOptions = useMemo(() => {
    const depCd = Number(form.depositTypeCd);
    if (depCd === 1) {
      return sbProdOptions.length > 0
        ? sbProdOptions.map((o) => ({
            value: String(o.optCode),
            label: o.optDescription,
          }))
        : [
            { value: "1", label: "Individual" },
            { value: "2", label: "Group" },
          ];
    }
    if (depCd === 2) {
      return tdProdOptions.length > 0
        ? tdProdOptions.map((o) => ({
            value: String(o.optCode),
            label: o.optDescription,
          }))
        : [
            { value: "1", label: "Fixed Deposit" },
            { value: "2", label: "Recurring Deposit" },
          ];
    }
    return [];
  }, [form.depositTypeCd, sbProdOptions, tdProdOptions]);

  const inttTypeSelectOptions = [
    { value: "", label: "-- None --" },
    ...(inttTypeOptions.length > 0
      ? inttTypeOptions.map((o) => ({
          value: String(o.optCode),
          label: o.optDescription,
        }))
      : [
          { value: "1", label: "Daily Product Basic" },
          { value: "2", label: "Monthly Minimum" },
        ]),
  ];

  const inttPayoutSelectOptions = [
    { value: "", label: "-- None --" },
    ...(inttPayoutOptions.length > 0
      ? inttPayoutOptions.map((o) => ({
          value: String(o.optCode),
          label: o.optDescription,
        }))
      : [
          { value: "1", label: "Monthly" },
          { value: "2", label: "Quarterly" },
          { value: "3", label: "Half-Yearly" },
          { value: "4", label: "Maturity" },
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
    if (setup?.prnLedger && !opts.some((o) => o.value === String(setup.prnLedger))) {
      opts.push({
        value: String(setup.prnLedger),
        label: setup.prnLedgerName
          ? `${setup.prnLedgerName} (${setup.prnLedgerCode || `LD-${setup.prnLedger}`})`
          : `Ledger #${setup.prnLedger}`,
      });
    }
    if (setup?.inttLedg && !opts.some((o) => o.value === String(setup.inttLedg))) {
      opts.push({
        value: String(setup.inttLedg),
        label: setup.inttLedgerName
          ? `${setup.inttLedgerName} (${setup.inttLedgerCode || `LD-${setup.inttLedg}`})`
          : `Ledger #${setup.inttLedg}`,
      });
    }
    return opts;
  }, [ledgers, setup]);

  return (
    <form
      id="deposit-scheme-setup-form"
      className="space-y-4"
      onSubmit={(e) => void handleSubmit(e)}
    >
      <PageToast message={errorMessage ?? null} tone="error" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label={t("fields.schemeName")}
          value={form.schemeName}
          required
          error={fieldErrors.schemeName || undefined}
          onChange={(value) => updateField("schemeName", value)}
        />

        <SelectField
          label={t("fields.depositType")}
          value={form.depositTypeCd}
          required
          error={fieldErrors.depositTypeCd || undefined}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          options={depositTypeSelectOptions}
          onChange={(value) => {
            updateField("depositTypeCd", value);
            updateField("prodTypeCd", "");
          }}
        />

        <SelectField
          label={t("fields.productType")}
          value={form.prodTypeCd}
          required
          error={fieldErrors.prodTypeCd || undefined}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          options={prodTypeSelectOptions}
          onChange={(value) => updateField("prodTypeCd", value)}
        />

        <TextField
          label={t("fields.roiPercentage")}
          value={form.roiPercent}
          type="number"
          step="0.01"
          error={fieldErrors.roiPercent || undefined}
          onChange={(value) => updateField("roiPercent", value)}
        />

        <SelectField
          label={t("fields.interestType")}
          value={form.inttTypeCd}
          error={fieldErrors.inttTypeCd || undefined}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          options={inttTypeSelectOptions}
          onChange={(value) => updateField("inttTypeCd", value)}
        />

        <SelectField
          label={t("fields.interestPayout")}
          value={form.inttPayoutCd}
          error={fieldErrors.inttPayoutCd || undefined}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          options={inttPayoutSelectOptions}
          onChange={(value) => updateField("inttPayoutCd", value)}
        />

        <TextField
          label={t("fields.minimumBalance")}
          value={form.minBalance}
          type="number"
          step="0.01"
          error={fieldErrors.minBalance || undefined}
          onChange={(value) => updateField("minBalance", value)}
        />

        <TextField
          label={t("fields.iterationDays")}
          value={form.inopDays}
          type="number"
          error={fieldErrors.inopDays || undefined}
          onChange={(value) => updateField("inopDays", value)}
        />

        <SelectField
          label={t("fields.principalLedger")}
          value={form.prnLedger}
          error={fieldErrors.prnLedger || undefined}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          options={ledgerSelectOptions}
          onChange={(value) => updateField("prnLedger", value)}
        />

        <SelectField
          label={t("fields.interestLedger")}
          value={form.inttLedg}
          error={fieldErrors.inttLedg || undefined}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          options={ledgerSelectOptions}
          onChange={(value) => updateField("inttLedg", value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
        <CheckboxField
          label={t("fields.withdrawalAllow")}
          checked={form.withdAllow}
          onChange={(checked) => updateField("withdAllow", checked)}
        />
        {form.withdAllow && (
          <TextField
            label={t("fields.maxWithdrawal")}
            value={form.maxWithdAmt}
            type="number"
            step="0.01"
            error={fieldErrors.maxWithdAmt || undefined}
            onChange={(value) => updateField("maxWithdAmt", value)}
          />
        )}
      </div>

      <div className="flex gap-6 mt-4">
        <CheckboxField
          label={t("fields.fieldCollection")}
          checked={form.fieldColl}
          onChange={(checked) => updateField("fieldColl", checked)}
        />
        <CheckboxField
          label={t("fields.isActive")}
          checked={form.isActive}
          onChange={(checked) => updateField("isActive", checked)}
        />
      </div>
    </form>
  );
}
