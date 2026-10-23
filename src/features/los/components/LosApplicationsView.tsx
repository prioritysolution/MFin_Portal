"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { ModulePageShell } from "@/components/shared/ModulePageShell";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { PageToast, useToastText } from "@/components/ui/PageToast";
import { loanModulePage } from "@/features/loan/loan-screen.data";
import {
  LOAN_APPLICATION_STATUSES,
  listLoanApplications,
  loanApplicationSeed,
  type LoanApplication,
  type LoanApplicationStatus,
} from "@/features/los/applications/loan-applications.data";

type Filters = {
  search: string;
  status: string;
  scheme: string;
};

type FormState = {
  borrower: string;
  scheme: string;
  purpose: string;
  requestedAmount: string;
  tenureMonths: string;
  repayment: string;
  bankAccount: string;
  guarantor: string;
  collateral: string;
  chargesNote: string;
};

const emptyFilters: Filters = { search: "", status: "", scheme: "" };

const emptyForm: FormState = {
  borrower: "",
  scheme: "",
  purpose: "",
  requestedAmount: "",
  tenureMonths: "",
  repayment: "",
  bankAccount: "",
  guarantor: "",
  collateral: "",
  chargesNote: "",
};

function statusTone(status: LoanApplicationStatus): BadgeTone {
  if (status === "disbursed") return "success";
  if (status === "sanctioned") return "info";
  if (status === "approval" || status === "field_verification") return "warning";
  if (status === "assessment") return "violet";
  return "neutral";
}

function formFrom(row: LoanApplication): FormState {
  return {
    borrower: row.borrower,
    scheme: row.scheme,
    purpose: row.purpose,
    requestedAmount: String(row.requestedAmount),
    tenureMonths: String(row.tenureMonths),
    repayment: row.repayment,
    bankAccount: row.bankAccount,
    guarantor: row.guarantor,
    collateral: row.collateral,
    chargesNote: row.chargesNote,
  };
}

export function LosApplicationsView() {
  const t = useTranslations("los.applications");
  const format = useFormatter();
  const [source, setSource] = useState<LoanApplication[]>(loanApplicationSeed);
  const [rows, setRows] = useState<LoanApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [viewing, setViewing] = useState<LoanApplication | null>(null);
  const [editing, setEditing] = useState<LoanApplication | null | "new">(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [successMessage, setSuccessMessage] = useToastText();
  const pageMeta = useMemo(
    () => loanModulePage("/los/applications", "los.applications"),
    [],
  );

  const schemes = useMemo(
    () => [...new Set(source.map((row) => row.scheme))],
    [source],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await listLoanApplications(
        {
          page,
          perPage: pageSize,
          search: applied.search,
          status: applied.status,
          scheme: applied.scheme,
        },
        source,
      );
      setRows(result.items);
      setTotal(result.total);
    } catch {
      setLoadError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [applied, page, pageSize, source, t]);

  useEffect(() => {
    const same =
      filters.search === applied.search &&
      filters.status === applied.status &&
      filters.scheme === applied.scheme;
    if (same) return;
    const timer = window.setTimeout(() => {
      setPage(1);
      setApplied(filters);
      setSuccessMessage(null);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [applied, filters, setSuccessMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const money = (value: number | null) =>
    value == null
      ? t("dash")
      : format.number(value, { style: "currency", currency: "INR" });

  function patchForm(patch: Partial<FormState>) {
    setForm((current) => ({ ...current, ...patch }));
    setDirty(true);
    setFormError(null);
  }

  function openCreate() {
    setEditing("new");
    setForm(emptyForm);
    setDirty(false);
    setFormError(null);
    setConfirmDiscard(false);
  }

  function openEdit(row: LoanApplication) {
    setEditing(row);
    setForm(formFrom(row));
    setDirty(false);
    setFormError(null);
    setConfirmDiscard(false);
  }

  function requestCloseForm() {
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    setEditing(null);
  }

  function saveForm() {
    const amount = Number(form.requestedAmount);
    if (!form.borrower.trim() || !form.scheme || !Number.isFinite(amount) || amount <= 0) {
      setFormError(t("form.required"));
      return;
    }
    const tenure = Number(form.tenureMonths);
    if (editing && editing !== "new") {
      setSource((current) =>
        current.map((row) =>
          row.id === editing.id
            ? {
                ...row,
                borrower: form.borrower.trim(),
                scheme: form.scheme,
                purpose: form.purpose.trim(),
                requestedAmount: amount,
                tenureMonths: Number.isFinite(tenure) && tenure > 0 ? tenure : row.tenureMonths,
                repayment: form.repayment.trim(),
                bankAccount: form.bankAccount.trim(),
                guarantor: form.guarantor.trim(),
                collateral: form.collateral.trim(),
                chargesNote: form.chargesNote.trim(),
              }
            : row,
        ),
      );
      setSuccessMessage(t("saved"));
    } else {
      const next: LoanApplication = {
        id: `local-${Date.now()}`,
        appNumber: t("draftNumber"),
        borrower: form.borrower.trim(),
        scheme: form.scheme,
        purpose: form.purpose.trim(),
        tenureMonths: Number.isFinite(tenure) && tenure > 0 ? tenure : 12,
        repayment: form.repayment.trim(),
        bankAccount: form.bankAccount.trim(),
        guarantor: form.guarantor.trim(),
        collateral: form.collateral.trim(),
        chargesNote: form.chargesNote.trim(),
        requestedAmount: amount,
        sanctionedAmount: null,
        disbursedAmount: null,
        principalOutstanding: null,
        dueAmount: null,
        collectedAmount: null,
        totalAmount: null,
        score: null,
        risk: null,
        status: "draft",
      };
      setSource((current) => [next, ...current]);
      setPage(1);
      setSuccessMessage(t("created"));
    }
    setDirty(false);
    setEditing(null);
  }

  const columns = useMemo<DataTableColumn<LoanApplication>[]>(
    () => [
      {
        id: "appNumber",
        header: t("columns.appNumber"),
        cell: (row) => <span className="font-semibold text-slate-900">{row.appNumber}</span>,
      },
      {
        id: "borrower",
        header: t("columns.borrower"),
        cell: (row) => row.borrower,
      },
      {
        id: "scheme",
        header: t("columns.scheme"),
        cell: (row) => row.scheme,
      },
      {
        id: "requested",
        header: t("columns.requested"),
        align: "end",
        cell: (row) => money(row.requestedAmount),
      },
      {
        id: "status",
        header: t("columns.status"),
        cell: (row) => (
          <Badge tone={statusTone(row.status)} caps>
            {t(`statuses.${row.status}`)}
          </Badge>
        ),
      },
    ],
    [format, t],
  );

  const statusOptions = LOAN_APPLICATION_STATUSES.map((status) => ({
    value: status,
    label: t(`statuses.${status}`),
  }));
  const schemeOptions = schemes.map((scheme) => ({ value: scheme, label: scheme }));

  return (
    <ModulePageShell page={pageMeta}>
      <PageToast message={successMessage} />

      <FilterPanel
        onReset={() => {
          setFilters(emptyFilters);
          setApplied(emptyFilters);
          setPage(1);
          setSuccessMessage(null);
        }}
      >
        <div className="min-w-[12rem] sm:max-w-[16rem]">
          <TextField
            label={t("filters.search")}
            value={filters.search}
            placeholder={t("filters.searchPlaceholder")}
            onChange={(value) => setFilters((current) => ({ ...current, search: value }))}
          />
        </div>
        <div className="min-w-[10rem] sm:max-w-[14rem]">
          <SelectField
            label={t("filters.status")}
            value={filters.status}
            searchable={false}
            placeholder={t("filters.all")}
            options={[{ value: "", label: t("filters.all") }, ...statusOptions]}
            onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
          />
        </div>
        <div className="min-w-[10rem] sm:max-w-[14rem]">
          <SelectField
            label={t("filters.scheme")}
            value={filters.scheme}
            searchable={false}
            placeholder={t("filters.all")}
            options={[{ value: "", label: t("filters.all") }, ...schemeOptions]}
            onChange={(value) => setFilters((current) => ({ ...current, scheme: value }))}
          />
        </div>
      </FilterPanel>

      <DataTable
        title={t("title")}
        description={t("description")}
        actions={
          <Button type="button" icon={Plus} onClick={openCreate}>
            {t("create")}
          </Button>
        }
        data={rows}
        columns={columns}
        getRowKey={(row) => row.id}
        loading={loading}
        error={loadError != null}
        errorMessage={loadError ?? undefined}
        onRetry={() => void load()}
        emptyTitle={t("emptyTitle")}
        emptyMessage={t("emptyMessage")}
        minWidth="760px"
        pagination={{
          page,
          pageSize,
          total,
          pageSizeOptions: [20, 50, 100],
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
        rowActions={{
          header: t("columns.actions"),
          render: (row) => (
            <div className="inline-flex items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                icon={Eye}
                tooltip={t("view")}
                onClick={() => setViewing(row)}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                icon={Pencil}
                tooltip={t("edit")}
                onClick={() => openEdit(row)}
              />
            </div>
          ),
        }}
      />

      <Modal
        open={viewing != null}
        size="lg"
        title={viewing?.appNumber ?? t("view")}
        subtitle={viewing?.borrower}
        onClose={() => setViewing(null)}
      >
        {viewing ? (
          <div className="flex flex-col gap-4">
            <Badge tone={statusTone(viewing.status)} caps>
              {t(`statuses.${viewing.status}`)}
            </Badge>
            <section>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">{t("summary.title")}</h3>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["requested", viewing.requestedAmount],
                    ["sanctioned", viewing.sanctionedAmount],
                    ["disbursed", viewing.disbursedAmount],
                    ["outstanding", viewing.principalOutstanding],
                    ["due", viewing.dueAmount],
                    ["collected", viewing.collectedAmount],
                    ["total", viewing.totalAmount],
                  ] as const
                ).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-border bg-background p-3">
                    <dt className="text-muted">{t(`summary.${key}`)}</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{money(value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <p className="text-sm text-muted">
              {viewing.score == null
                ? t("summary.noScore")
                : t("summary.score", {
                    score: viewing.score,
                    risk: t(`risk.${viewing.risk ?? "fair"}`),
                  })}
            </p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editing != null}
        size="lg"
        title={editing === "new" ? t("form.createTitle") : t("form.editTitle")}
        onClose={requestCloseForm}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={requestCloseForm}>
              {t("form.cancel")}
            </Button>
            <Button type="button" onClick={saveForm}>
              {t("form.save")}
            </Button>
          </div>
        }
      >
        {confirmDiscard ? (
          <Alert tone="warning" className="mb-4">
            {t("form.unsaved")}
            <span className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="danger" onClick={() => setEditing(null)}>
                {t("form.discard")}
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setConfirmDiscard(false)}>
                {t("form.keepEditing")}
              </Button>
            </span>
          </Alert>
        ) : null}
        {formError ? (
          <Alert tone="error" className="mb-4">
            {formError}
          </Alert>
        ) : null}
        <div className="flex flex-col gap-5">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 sm:col-span-2">{t("form.applicant")}</h3>
            <TextField
              label={t("form.borrower")}
              value={form.borrower}
              required
              error={formError && !form.borrower.trim() ? formError : undefined}
              onChange={(value) => patchForm({ borrower: value })}
            />
            <TextField
              label={t("form.purpose")}
              value={form.purpose}
              onChange={(value) => patchForm({ purpose: value })}
            />
          </section>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 sm:col-span-2">{t("form.schemeSection")}</h3>
            <SelectField
              label={t("form.scheme")}
              value={form.scheme}
              required
              placeholder={t("form.schemePlaceholder")}
              options={schemeOptions}
              onChange={(value) => patchForm({ scheme: value })}
            />
            <TextField
              label={t("form.amount")}
              value={form.requestedAmount}
              required
              restrict="decimal"
              onChange={(value) => patchForm({ requestedAmount: value })}
            />
            <TextField
              label={t("form.tenure")}
              value={form.tenureMonths}
              restrict="digits"
              onChange={(value) => patchForm({ tenureMonths: value })}
            />
            <TextField
              label={t("form.repayment")}
              value={form.repayment}
              onChange={(value) => patchForm({ repayment: value })}
            />
          </section>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 sm:col-span-2">{t("form.parties")}</h3>
            <TextField
              label={t("form.bank")}
              value={form.bankAccount}
              onChange={(value) => patchForm({ bankAccount: value })}
            />
            <TextField
              label={t("form.guarantor")}
              value={form.guarantor}
              onChange={(value) => patchForm({ guarantor: value })}
            />
            <TextField
              label={t("form.collateral")}
              value={form.collateral}
              onChange={(value) => patchForm({ collateral: value })}
            />
            <TextField
              label={t("form.charges")}
              value={form.chargesNote}
              onChange={(value) => patchForm({ chargesNote: value })}
            />
          </section>
        </div>
      </Modal>
    </ModulePageShell>
  );
}
