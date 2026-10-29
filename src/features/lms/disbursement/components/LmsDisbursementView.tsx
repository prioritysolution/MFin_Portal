"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Filter,
  Plus,
  RotateCw,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { ModulePageShell } from "@/components/shared/ModulePageShell";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Form";
import { PageToast, useToastText } from "@/components/ui/PageToast";
import { loanModulePage } from "@/features/loan/loan-screen.data";
import {
  fetchDisbursements,
  isDisbursementClientError,
} from "../services/disbursement-client";
import { fetchBranchList } from "@/features/master/branch/services/branch-client";
import { LmsDisbursementModal } from "./LmsDisbursementModal";
import { LmsDisbursementApproveModal } from "./LmsDisbursementApproveModal";
import type {
  LoanDisbursementAddResult,
  LoanDisbursementRow,
} from "../types/disbursement.types";

function approvalTone(status: string): BadgeTone {
  const s = status.toLowerCase();
  if (s === "approved") return "success";
  if (s === "pending") return "warning";
  if (s === "rejected") return "danger";
  return "neutral";
}

function modeTone(modeCd: number): BadgeTone {
  if (modeCd === 1) return "neutral"; // Cash
  if (modeCd === 2) return "info"; // Cheque
  if (modeCd === 3) return "violet"; // Transfer
  if (modeCd === 4) return "success"; // SB
  return "neutral";
}

export function LmsDisbursementView() {
  const t = useTranslations("loanModule.screens.disbursement");
  const tModule = useTranslations("loanModule");
  const tCommon = useTranslations("common");
  const format = useFormatter();

  const [rows, setRows] = useState<LoanDisbursementRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters
  const [tab, setTab] = useState<"" | "pending" | "approved">("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [paymentModeCd, setPaymentModeCd] = useState("");
  const [branchOptions, setBranchOptions] = useState<{ value: string; label: string }[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState<LoanDisbursementRow | null>(null);

  const [toastMessage, setToastMessage] = useToastText();

  const pageMeta = useMemo(
    () => loanModulePage("/lms/disbursement", "loanModule.screens.disbursement"),
    [],
  );

  useEffect(() => {
    fetchBranchList({ page: 1, perPage: 100, isActive: 1 })
      .then((res) => {
        setBranchOptions(res.items.map((b) => ({ value: String(b.branchId), label: b.branchName })));
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetchDisbursements({
        page,
        per_page: pageSize,
        approval: tab || undefined,
        branch_id: branchId ? Number(branchId) : undefined,
        payment_mode_cd: paymentModeCd ? Number(paymentModeCd) : undefined,
        keyword: appliedSearch || undefined,
      });

      const items = Array.isArray(res?.items) ? res.items : [];
      setRows(items);
      setTotal(res?.total ?? items.length);
    } catch (err: unknown) {
      setLoadError(
        isDisbursementClientError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : tModule("loadError"),
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, branchId, page, pageSize, paymentModeCd, tModule, tab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setAppliedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  const money = (val: number | null | undefined) => {
    if (val == null) return "—";
    return format.number(val, { style: "currency", currency: "INR" });
  };

  // Metrics summary calculated from rows
  const metrics = useMemo(() => {
    const totalGross = rows.reduce((acc, r) => acc + (r.gross_amount || 0), 0);
    const totalNet = rows.reduce((acc, r) => acc + (r.net_amount || 0), 0);
    const pendingCount = rows.filter((r) => r.approval_status?.toLowerCase() === "pending").length;
    const finalCount = rows.filter((r) => r.is_final).length;
    return { totalGross, totalNet, pendingCount, finalCount };
  }, [rows]);

  const columns = useMemo<DataTableColumn<LoanDisbursementRow>[]>(
    () => [
      {
        id: "disbursement_no",
        header: t("columns.disbursementNo"),
        cell: (row) => (
          <div>
            <span className="font-bold text-slate-900 block font-mono">{row.disbursement_no}</span>
            <span className="text-[11px] text-slate-400">{row.disbursement_date}</span>
          </div>
        ),
      },
      {
        id: "loan_account",
        header: t("columns.loanAccount"),
        cell: (row) => (
          <div>
            <span className="font-mono font-semibold text-slate-800 block">{row.loan_account_no}</span>
            <span className="text-[11px] text-slate-500 font-mono">{row.application_no}</span>
          </div>
        ),
      },
      {
        id: "borrower",
        header: "Borrower / Member",
        cell: (row) => (
          <div>
            <span className="font-semibold text-slate-900 block">{row.member_name}</span>
            <span className="text-[11px] text-slate-500">{row.branch_name}</span>
          </div>
        ),
      },
      {
        id: "gross",
        header: t("columns.gross"),
        align: "end",
        cell: (row) => (
          <span className="font-bold text-slate-900 block text-right">{money(row.gross_amount)}</span>
        ),
      },
      {
        id: "deductions",
        header: t("columns.deductions"),
        align: "end",
        cell: (row) => {
          const totalDeductions = (row.charge_deduction || 0) + (row.other_deduction || 0);
          return (
            <span className="font-semibold text-rose-700 block text-right">
              {totalDeductions > 0 ? `-${money(totalDeductions)}` : "₹0.00"}
            </span>
          );
        },
      },
      {
        id: "net",
        header: t("columns.net"),
        align: "end",
        cell: (row) => (
          <div className="text-right">
            <span className="font-black text-teal-800 block">{money(row.net_amount)}</span>
            <Badge tone={modeTone(row.payment_mode_cd)}>
              {row.payment_mode}
            </Badge>
          </div>
        ),
      },
      {
        id: "tranche",
        header: "Tranche",
        cell: (row) => (
          <Badge tone={row.is_final ? "success" : "neutral"} caps>
            {row.is_final ? "Final" : "Draft"}
          </Badge>
        ),
      },
      {
        id: "status",
        header: t("columns.status"),
        cell: (row) => (
          <div>
            <Badge tone={approvalTone(row.approval_status)} caps>
              {row.approval_status}
            </Badge>
            {row.voucher_no && (
              <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                {row.voucher_no}
              </span>
            )}
          </div>
        ),
      },
    ],
    [format, t],
  );

  return (
    <ModulePageShell page={pageMeta}>
      <PageToast message={toastMessage} />

      {/* KPI METRIC CARDS HEADER */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5 text-teal-600" />
            Total Disbursed (Gross)
          </span>
          <p className="mt-1 text-xl font-black text-slate-900">{money(metrics.totalGross)}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-emerald-600" />
            Net Paid Out
          </span>
          <p className="mt-1 text-xl font-black text-emerald-700">{money(metrics.totalNet)}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            Pending Checker Authorization
          </span>
          <p className="mt-1 text-xl font-black text-amber-600">{metrics.pendingCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck2 className="h-3.5 w-3.5 text-indigo-600" />
            Final Tranches Settled
          </span>
          <p className="mt-1 text-xl font-black text-indigo-700">{metrics.finalCount}</p>
        </div>
      </div>

      {/* QUICK FILTER TABS */}
      <div className="flex border-b border-slate-200 bg-white px-2 mb-2 rounded-t-xl">
        <button
          type="button"
          onClick={() => {
            setTab("");
            setPage(1);
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            tab === ""
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          All Disbursements
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("pending");
            setPage(1);
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            tab === "pending"
              ? "border-amber-600 text-amber-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Pending Authorization
          {metrics.pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 text-amber-900 px-1.5 py-0.2 text-[10px]">
              {metrics.pendingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("approved");
            setPage(1);
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            tab === "approved"
              ? "border-teal-600 text-teal-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Approved & Settled
        </button>
      </div>

      <FilterPanel
        onReset={() => {
          setSearch("");
          setBranchId("");
          setPaymentModeCd("");
          setAppliedSearch("");
          setPage(1);
        }}
      >
        <div className="min-w-[12rem] sm:max-w-[18rem]">
          <TextField
            label={tModule("search")}
            value={search}
            placeholder="Disbursement no, account, borrower..."
            onChange={setSearch}
          />
        </div>

        <div className="min-w-[10rem] sm:max-w-[14rem]">
          <SelectField
            label="Branch"
            value={branchId}
            options={[{ value: "", label: "All Branches" }, ...branchOptions]}
            onChange={setBranchId}
          />
        </div>

        <div className="min-w-[10rem] sm:max-w-[14rem]">
          <SelectField
            label="Payment Mode"
            value={paymentModeCd}
            options={[
              { value: "", label: "All Modes" },
              { value: "1", label: "Cash" },
              { value: "2", label: "Bank Cheque" },
              { value: "3", label: "Bank Transfer" },
              { value: "4", label: "S/B Account" },
            ]}
            onChange={setPaymentModeCd}
          />
        </div>
      </FilterPanel>

      <DataTable
        title={t("title")}
        description={t("description")}
        actions={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              icon={RotateCw}
              onClick={() => void load()}
            >
              {tCommon("retry")}
            </Button>
            <Button
              type="button"
              icon={Plus}
              onClick={() => setAddModalOpen(true)}
            >
              Disburse Loan
            </Button>
          </div>
        }
        data={rows}
        columns={columns}
        getRowKey={(row) => String(row.disbursement_id)}
        loading={loading}
        error={loadError != null}
        errorMessage={loadError ?? undefined}
        onRetry={() => void load()}
        emptyTitle={tModule("emptyTitle")}
        emptyMessage={tModule("emptyMessage")}
        minWidth="840px"
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
          header: tModule("actions"),
          render: (row) => {
            const isPending = row.approval_status?.toLowerCase() === "pending";
            return (
              <div className="inline-flex items-center gap-1">
                {isPending && (
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    icon={ShieldAlert}
                    tooltip="Checker Authorization (Approve / Reject)"
                    onClick={() => {
                      setSelectedDisbursement(row);
                      setApproveModalOpen(true);
                    }}
                  >
                    Authorize
                  </Button>
                )}
              </div>
            );
          },
        }}
      />

      {/* CREATE DISBURSEMENT MODAL */}
      <LmsDisbursementModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={(res: LoanDisbursementAddResult) => {
          void load();
          setToastMessage(
            res.approval_status?.toLowerCase() === "pending"
              ? "Disbursement recorded and sent for checker approval"
              : `Disbursement ${res.disbursement_no} settled successfully`,
          );
        }}
      />

      {/* CHECKER AUTHORIZATION MODAL */}
      <LmsDisbursementApproveModal
        disbursement={selectedDisbursement}
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onSuccess={() => {
          void load();
          setToastMessage("Disbursement approval decision updated");
        }}
      />
    </ModulePageShell>
  );
}
