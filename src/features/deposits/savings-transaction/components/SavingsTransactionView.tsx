"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Search, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DateField, SelectField, TextField } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { fetchApplOptions } from "@/features/master/appl-options";
import { fetchStaffList } from "@/features/master/staff/services/staff-client";
import { OPT_DEPOSIT_TYPE } from "@/features/deposits/savings/deposit-account.constants";
import { todayYmd } from "@/features/deposits/savings/deposit-account.rules";
import {
  fetchDepositAccounts,
  isDepositAccountClientError,
} from "@/features/deposits/savings/services/deposit-account-client";
import type { DepositAccount } from "@/features/deposits/savings/types/deposit-account.types";
import {
  DEPOSIT_BLOCKED,
  OPT_TRANS_TYPE,
  STATUS_PENDING,
  STATUS_POSTED,
  STATUS_REJECTED,
  TRANS_DEPOSIT,
  TRANS_MODES,
  TRANS_WITHDRAWAL,
  WITHDRAWAL_BLOCKED,
  type TransMode,
} from "../savings-transaction.constants";
import {
  addSavingsTransaction,
  approveSavingsTransaction,
  fetchSavingsTransactions,
  isSavingsTransactionClientError,
} from "../services/savings-transaction-client";
import type { SavingsTransaction } from "../types/savings-transaction.types";

type Filters = {
  search: string;
  transTypeCd: string;
  transMode: string;
  statusCd: string;
  depositTypeCd: string;
  fromDate: string;
  toDate: string;
};

const emptyFilters: Filters = {
  search: "",
  transTypeCd: "",
  transMode: "",
  statusCd: "",
  depositTypeCd: "",
  fromDate: "",
  toDate: "",
};

function statusTone(statusCd: number): BadgeTone {
  if (statusCd === STATUS_POSTED) return "success";
  if (statusCd === STATUS_PENDING) return "warning";
  if (statusCd === STATUS_REJECTED) return "danger";
  return "neutral";
}

function moneyAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value > 0 ? value : null;
}

export function SavingsTransactionView() {
  const t = useTranslations("deposits.savingsTransaction");
  const format = useFormatter();
  const today = todayYmd();

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState<SavingsTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [depositTypeOptions, setDepositTypeOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [keyword, setKeyword] = useState("");
  const [accounts, setAccounts] = useState<DepositAccount[]>([]);
  const [searching, setSearching] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [transTypeCd, setTransTypeCd] = useState(String(TRANS_DEPOSIT));
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<TransMode>("CA");
  const [transDate, setTransDate] = useState("");
  const [effectDate, setEffectDate] = useState("");
  const [foId, setFoId] = useState("");
  const [officers, setOfficers] = useState<{ value: string; label: string }[]>([]);
  const [narration, setNarration] = useState("");
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [decision, setDecision] = useState<{
    row: SavingsTransaction;
    approve: boolean;
  } | null>(null);
  const [decisionRemarks, setDecisionRemarks] = useState("");
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);

  const selected = accounts.find((account) => String(account.accountId) === accountId) ?? null;
  const withdrawalBlocked =
    selected != null &&
    (selected.isClosed || WITHDRAWAL_BLOCKED.has(selected.statusCd));
  const depositBlocked =
    selected != null && (selected.isClosed || DEPOSIT_BLOCKED.has(selected.statusCd));

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await fetchSavingsTransactions({
        page,
        perPage: pageSize,
        search: applied.search || undefined,
        transTypeCd: applied.transTypeCd ? Number(applied.transTypeCd) : undefined,
        transMode: applied.transMode || undefined,
        statusCd: applied.statusCd ? Number(applied.statusCd) : undefined,
        depositTypeCd: applied.depositTypeCd ? Number(applied.depositTypeCd) : undefined,
        fromDate: applied.fromDate || undefined,
        toDate: applied.toDate || undefined,
      });
      setRows(result.items);
      setTotal(result.meta?.total ?? result.items.length);
    } catch (error) {
      setRows([]);
      setTotal(0);
      setLoadError(
        isSavingsTransactionClientError(error) ? error.message : t("table.empty"),
      );
    } finally {
      setLoading(false);
    }
  }, [applied, page, pageSize, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    async function loadOptions() {
      const [types, depositTypes] = await Promise.all([
        fetchApplOptions(OPT_TRANS_TYPE).catch(() => []),
        fetchApplOptions(OPT_DEPOSIT_TYPE).catch(() => []),
      ]);
      if (cancelled) return;
      const mappedTypes = types
        .slice()
        .sort((a, b) => a.srlNo - b.srlNo)
        .map((option) => ({
          value: String(option.optCode),
          label: option.optDescription,
        }));
      setTypeOptions(
        mappedTypes.length > 0
          ? mappedTypes
          : [
              { value: "1", label: t("types.1") },
              { value: "2", label: t("types.2") },
            ],
      );
      setDepositTypeOptions(
        depositTypes
          .slice()
          .sort((a, b) => a.srlNo - b.srlNo)
          .map((option) => ({
            value: String(option.optCode),
            label: option.optDescription,
          })),
      );
    }
    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (!selected?.branchId) {
      setOfficers([]);
      return;
    }
    let cancelled = false;
    fetchStaffList({ branchId: selected.branchId, perPage: 200, status: 1 })
      .then((result) => {
        if (cancelled) return;
        setOfficers(
          result.items.map((staff) => ({
            value: String(staff.staffId),
            label: staff.employeeCode
              ? `${staff.employeeCode} · ${staff.fullName}`
              : staff.fullName,
          })),
        );
        if (selected.foId != null) setFoId(String(selected.foId));
      })
      .catch(() => {
        if (!cancelled) setOfficers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.accountId, selected?.branchId, selected?.foId]);

  useEffect(() => {
    if (transTypeCd === String(TRANS_WITHDRAWAL) && withdrawalBlocked) {
      setTransTypeCd(depositBlocked ? "" : String(TRANS_DEPOSIT));
    }
    if (transTypeCd === String(TRANS_DEPOSIT) && depositBlocked) {
      setTransTypeCd(withdrawalBlocked ? "" : String(TRANS_WITHDRAWAL));
    }
  }, [depositBlocked, transTypeCd, withdrawalBlocked]);

  async function searchAccounts() {
    const term = keyword.trim();
    if (!term) return;
    setSearching(true);
    setFormError(null);
    try {
      const result = await fetchDepositAccounts({
        search: term,
        allTypes: true,
        perPage: 20,
        page: 1,
      });
      setAccounts(result.items);
      setAccountId(result.items[0] ? String(result.items[0].accountId) : "");
      if (result.items.length === 0) setFormError(t("form.accountEmpty"));
    } catch (error) {
      setAccounts([]);
      setAccountId("");
      setFormError(
        isDepositAccountClientError(error) ? error.message : t("form.accountRequired"),
      );
    } finally {
      setSearching(false);
    }
  }

  function validateForm(): string | null {
    if (!selected) return t("form.accountRequired");
    if (transTypeCd === String(TRANS_WITHDRAWAL) && withdrawalBlocked) {
      return t("form.withdrawalBlocked");
    }
    if (transTypeCd === String(TRANS_DEPOSIT) && depositBlocked) {
      return t("form.depositBlocked");
    }
    if (moneyAmount(amount) == null) return t("form.amountInvalid");
    if (transDate && transDate > today) return t("form.futureDate");
    if (effectDate && effectDate > today) return t("form.futureDate");
    const effectiveTrans = transDate || today;
    if (effectDate && effectDate > effectiveTrans) return t("form.effectRange");
    if (selected.startDate && effectDate && effectDate < selected.startDate) {
      return t("form.effectRange");
    }
    if (
      transTypeCd === String(TRANS_WITHDRAWAL) &&
      selected.currentBalance != null &&
      (moneyAmount(amount) ?? 0) > selected.currentBalance
    ) {
      return t("form.amountInvalid");
    }
    return null;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const error = validateForm();
    setFormError(error);
    if (error || !selected) return;
    const parsed = moneyAmount(amount);
    if (parsed == null) return;
    setSaving(true);
    setNotice(null);
    try {
      const result = await addSavingsTransaction({
        accountId: selected.accountId,
        transTypeCd: Number(transTypeCd),
        transAmount: parsed,
        transMode: mode,
        transDate: transDate || null,
        effectDate: effectDate || null,
        foId: foId ? Number(foId) : null,
        ledgerNarration: narration.trim() || null,
        remarks: remarks.trim() || null,
      });
      const pending = result.item.statusCd === STATUS_PENDING;
      setNotice({
        tone: "success",
        text: pending ? t("form.sentForApproval") : result.message,
      });
      setAmount("");
      setNarration("");
      setRemarks("");
      setTransDate("");
      setEffectDate("");
      setPage(1);
      await load();
    } catch (caught) {
      setNotice({
        tone: "error",
        text: isSavingsTransactionClientError(caught)
          ? caught.message
          : t("form.amountInvalid"),
      });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDecision() {
    if (!decision) return;
    if (!decision.approve && !decisionRemarks.trim()) {
      setDecisionError(t("approval.remarksRequired"));
      return;
    }
    setDeciding(true);
    setDecisionError(null);
    try {
      const result = await approveSavingsTransaction({
        transId: decision.row.transId,
        approve: decision.approve,
        remarks: decisionRemarks.trim() || null,
      });
      setNotice({ tone: "success", text: result.message });
      setDecision(null);
      setDecisionRemarks("");
      await load();
    } catch (caught) {
      setDecisionError(
        isSavingsTransactionClientError(caught)
          ? caught.message
          : t("approval.remarksRequired"),
      );
    } finally {
      setDeciding(false);
    }
  }

  const money = (value: number | null) =>
    value == null
      ? "—"
      : format.number(value, { style: "currency", currency: "INR" });

  const columns = useMemo<DataTableColumn<SavingsTransaction>[]>(
    () => [
      {
        id: "transNo",
        header: t("table.transNo"),
        cell: (row) => row.transNo || String(row.transId),
      },
      {
        id: "account",
        header: t("table.account"),
        cell: (row) => (
          <span className="block min-w-0">
            <span className="block truncate font-medium text-slate-900">
              {row.holderName || row.applNo}
            </span>
            <span className="block truncate text-xs text-muted">
              {row.schemeCode || row.schemeName}
            </span>
          </span>
        ),
      },
      {
        id: "type",
        header: t("table.type"),
        cell: (row) =>
          row.transTypeDesc ||
          (row.transTypeCd === TRANS_WITHDRAWAL ? t("types.2") : t("types.1")),
      },
      {
        id: "mode",
        header: t("table.mode"),
        cell: (row) =>
          row.transModeDesc ||
          (TRANS_MODES.includes(row.transMode as TransMode)
            ? t(`modes.${row.transMode as TransMode}`)
            : row.transMode),
      },
      {
        id: "amount",
        header: t("table.amount"),
        align: "end",
        cell: (row) => money(row.transAmount),
      },
      {
        id: "balance",
        header: t("table.balance"),
        align: "end",
        cell: (row) =>
          row.statusCd === STATUS_PENDING ? t("form.sentForApproval") : money(row.balanceAfter),
      },
      {
        id: "status",
        header: t("table.status"),
        cell: (row) => (
          <Badge tone={statusTone(row.statusCd)} caps={false}>
            {row.statusDesc ||
              (row.statusCd === STATUS_PENDING
                ? t("statuses.2")
                : row.statusCd === STATUS_REJECTED
                  ? t("statuses.3")
                  : t("statuses.1"))}
          </Badge>
        ),
      },
      {
        id: "date",
        header: t("table.date"),
        cell: (row) => row.transDate || "—",
      },
    ],
    [format, t],
  );

  const modeOptions = TRANS_MODES.map((code) => ({
    value: code,
    label: t(`modes.${code}`),
  }));
  const statusOptions = (["1", "2", "3"] as const).map((code) => ({
    value: code,
    label: t(`statuses.${code}`),
  }));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t("title")} description={t("description")} />
      {notice ? <Alert tone={notice.tone}>{notice.text}</Alert> : null}

      {/* <FilterPanel
        onReset={() => {
          setFilters(emptyFilters);
          setApplied(emptyFilters);
          setPage(1);
        }}
      >
        <TextField
          label={t("filters.search")}
          value={filters.search}
          onChange={(value) => setFilters((current) => ({ ...current, search: value }))}
          placeholder={t("filters.searchPlaceholder")}
        />
        <SelectField
          label={t("filters.type")}
          value={filters.transTypeCd}
          onChange={(value) =>
            setFilters((current) => ({ ...current, transTypeCd: value }))
          }
          options={typeOptions}
          placeholder={t("filters.all")}
        />
        <SelectField
          label={t("filters.mode")}
          value={filters.transMode}
          onChange={(value) => setFilters((current) => ({ ...current, transMode: value }))}
          options={modeOptions}
          placeholder={t("filters.all")}
        />
        <SelectField
          label={t("filters.status")}
          value={filters.statusCd}
          onChange={(value) => setFilters((current) => ({ ...current, statusCd: value }))}
          options={statusOptions}
          placeholder={t("filters.all")}
        />
        <SelectField
          label={t("form.depositType")}
          value={filters.depositTypeCd}
          onChange={(value) =>
            setFilters((current) => ({ ...current, depositTypeCd: value }))
          }
          options={depositTypeOptions}
          placeholder={t("filters.all")}
        />
        <DateField
          label={t("filters.from")}
          value={filters.fromDate}
          max={today}
          onChange={(value) => setFilters((current) => ({ ...current, fromDate: value }))}
        />
        <DateField
          label={t("filters.to")}
          value={filters.toDate}
          max={today}
          onChange={(value) => setFilters((current) => ({ ...current, toDate: value }))}
        />
        <Button
          type="button"
          icon={Search}
          onClick={() => {
            setApplied(filters);
            setPage(1);
          }}
        >
          {t("filters.search")}
        </Button>
      </FilterPanel> */}

      <form
        className="rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
        onSubmit={(event) => void submit(event)}
      >
        <h2 className="mb-4 text-base font-semibold text-slate-900">{t("form.title")}</h2>
        {formError ? (
          <Alert tone="error" className="mb-4">
            {formError}
          </Alert>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <TextField
                label={t("form.accountSearch")}
                value={keyword}
                onChange={setKeyword}
                placeholder={t("form.accountPlaceholder")}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              icon={Search}
              loading={searching}
              className="w-full sm:w-auto"
              onClick={() => void searchAccounts()}
            >
              {t("form.search")}
            </Button>
          </div>
          <SelectField
            label={t("form.account")}
            value={accountId}
            required
            placeholder={t("form.accountEmpty")}
            options={accounts.map((account) => ({
              value: String(account.accountId),
              label: `${account.holderName || account.applNo}${
                account.accountNo != null ? ` · ${account.accountNo}` : ""
              }`,
            }))}
            onChange={setAccountId}
          />
          {selected ? (
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background p-3 text-sm sm:col-span-2 sm:grid-cols-4">
              <p>
                <span className="block text-muted">{t("form.holder")}</span>
                {selected.holderName || "—"}
              </p>
              <p>
                <span className="block text-muted">{t("form.scheme")}</span>
                {selected.schemeName || selected.schemeCode || "—"}
              </p>
              <p>
                <span className="block text-muted">{t("form.depositType")}</span>
                {selected.depositTypeDesc || "—"}
              </p>
              <p>
                <span className="block text-muted">{t("form.accountStatus")}</span>
                {selected.statusDesc || "—"}
              </p>
              <p>
                <span className="block text-muted">{t("form.balance")}</span>
                {money(selected.currentBalance)}
              </p>
            </div>
          ) : null}
          <SelectField
            label={t("form.type")}
            value={transTypeCd}
            required
            options={typeOptions.map((option) => ({
              ...option,
              disabled:
                (option.value === String(TRANS_WITHDRAWAL) && withdrawalBlocked) ||
                (option.value === String(TRANS_DEPOSIT) && depositBlocked),
            }))}
            onChange={setTransTypeCd}
          />
          <TextField
            label={t("form.amount")}
            value={amount}
            required
            restrict="decimal"
            onChange={setAmount}
          />
          <SelectField
            label={t("form.mode")}
            value={mode}
            options={modeOptions}
            onChange={(value) => setMode(value as TransMode)}
          />
          <SelectField
            label={t("form.officer")}
            value={foId}
            placeholder={t("form.officerPlaceholder")}
            options={officers}
            onChange={setFoId}
          />
          <DateField
            label={t("form.transDate")}
            value={transDate}
            max={today}
            min={selected?.startDate ?? undefined}
            onChange={setTransDate}
          />
          <DateField
            label={t("form.effectDate")}
            value={effectDate}
            max={transDate || today}
            min={selected?.startDate ?? undefined}
            onChange={setEffectDate}
          />
          <TextField
            label={t("form.narration")}
            value={narration}
            onChange={(value) => setNarration(value.slice(0, 75))}
          />
          <TextField
            label={t("form.remarks")}
            value={remarks}
            onChange={(value) => setRemarks(value.slice(0, 250))}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" loading={saving} disabled={saving || !transTypeCd}>
            {saving ? t("form.saving") : t("form.submit")}
          </Button>
        </div>
      </form>

      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(row) => String(row.transId)}
        loading={loading}
        error={loadError != null}
        errorMessage={loadError ?? undefined}
        onRetry={() => void load()}
        emptyTitle={t("table.empty")}
        minWidth="880px"
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
        rowActions={{
          header: t("table.actions"),
          render: (row) =>
            row.statusCd === STATUS_PENDING ? (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="success"
                  icon={Check}
                  onClick={() => {
                    setDecision({ row, approve: true });
                    setDecisionRemarks("");
                    setDecisionError(null);
                  }}
                >
                  {t("table.approve")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  icon={X}
                  onClick={() => {
                    setDecision({ row, approve: false });
                    setDecisionRemarks("");
                    setDecisionError(null);
                  }}
                >
                  {t("table.reject")}
                </Button>
              </div>
            ) : null,
        }}
      />

      <Modal
        open={decision != null}
        size="sm"
        title={decision?.approve ? t("approval.approveTitle") : t("approval.rejectTitle")}
        onClose={() => {
          if (deciding) return;
          setDecision(null);
        }}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={deciding}
              onClick={() => setDecision(null)}
            >
              {t("approval.cancel")}
            </Button>
            <Button
              type="button"
              variant={decision?.approve ? "success" : "danger"}
              loading={deciding}
              onClick={() => void confirmDecision()}
            >
              {decision?.approve ? t("approval.confirmApprove") : t("approval.confirmReject")}
            </Button>
          </div>
        }
      >
        <TextField
          label={t("approval.remarks")}
          value={decisionRemarks}
          required={decision?.approve === false}
          error={decisionError ?? undefined}
          onChange={(value) => setDecisionRemarks(value.slice(0, 200))}
        />
      </Modal>
    </div>
  );
}
