"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Eye, History, RotateCw, Search } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { ModulePageShell } from "@/components/shared/ModulePageShell";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SelectField, TextField } from "@/components/ui/Form";
import { PageToast, useToastText } from "@/components/ui/PageToast";
import { loanModulePage } from "@/features/loan/loan-screen.data";
import { fetchLoanApplications, fetchLoanApplicationTimeline, isLosClientError } from "../services/los-client";
import type {
  LoanApplicationRow,
  LoanApplicationTimelineEvent,
} from "../types/los.types";

function stageTone(stage: string): BadgeTone {
  if (stage === "disbursed") return "success";
  if (stage === "sanctioned") return "info";
  if (stage === "approval" || stage === "assessment") return "warning";
  if (stage === "field_verification") return "violet";
  if (stage === "rejected") return "danger";
  return "neutral";
}

export function LosTrackingView() {
  const t = useTranslations("loanModule.screens.tracking");
  const tModule = useTranslations("loanModule");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const [rows, setRows] = useState<LoanApplicationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStage, setAppliedStage] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Tracking Modal
  const [trackingApp, setTrackingApp] = useState<LoanApplicationRow | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<LoanApplicationTimelineEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const pageMeta = useMemo(
    () => loanModulePage("/los/tracking", "loanModule.screens.tracking"),
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await fetchLoanApplications({
        page,
        per_page: pageSize,
        keyword: appliedSearch || undefined,
        stage: appliedStage || undefined,
      });
      const items = Array.isArray(result?.items) ? result.items : [];
      setRows(items);
      setTotal(result?.meta?.total ?? items.length);
    } catch (err: unknown) {
      setLoadError(
        isLosClientError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : tModule("loadError"),
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, appliedStage, page, pageSize, tModule]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setAppliedSearch(search);
      setAppliedStage(stage);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, stage]);

  useEffect(() => {
    void load();
  }, [load]);

  const money = (val: number | null | undefined) => {
    if (val == null) return "—";
    return format.number(val, { style: "currency", currency: "INR" });
  };

  const handleOpenTimeline = async (app: LoanApplicationRow) => {
    setTrackingApp(app);
    setLoadingTimeline(true);
    try {
      const evts = await fetchLoanApplicationTimeline(app.application_id);
      setTimelineEvents(evts);
    } catch {
      setTimelineEvents([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const columns = useMemo<DataTableColumn<LoanApplicationRow>[]>(
    () => [
      {
        id: "application_no",
        header: t("columns.appNo"),
        cell: (row) => (
          <span className="font-bold text-slate-900 block">{row.application_no}</span>
        ),
      },
      {
        id: "member_name",
        header: t("columns.customer"),
        cell: (row) => (
          <div>
            <span className="font-semibold text-slate-900 block">{row.member_name}</span>
            <span className="text-[11px] text-slate-500">{row.member_ref_code}</span>
          </div>
        ),
      },
      {
        id: "branch_name",
        header: t("columns.branch"),
        cell: (row) => (
          <div>
            <span className="font-medium text-slate-800 block">{row.branch_name}</span>
            <span className="text-[11px] text-slate-500">{row.scheme_name}</span>
          </div>
        ),
      },
      {
        id: "application_date",
        header: t("columns.date"),
        cell: (row) => <span className="text-slate-700">{row.application_date}</span>,
      },
      {
        id: "current_owner",
        header: t("columns.owner"),
        cell: (row) => (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-500 inline-block" />
            <span className="font-medium text-slate-800">{row.current_owner}</span>
          </div>
        ),
      },
      {
        id: "stage",
        header: t("columns.status"),
        cell: (row) => (
          <Badge tone={stageTone(row.stage)} caps>
            {row.stage.replace("_", " ")}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return (
    <ModulePageShell page={pageMeta}>
      <FilterPanel
        onReset={() => {
          setSearch("");
          setStage("");
          setAppliedSearch("");
          setAppliedStage("");
          setPage(1);
        }}
      >
        <div className="min-w-[12rem] sm:max-w-[18rem]">
          <TextField
            label="Search Application"
            value={search}
            placeholder="Application no, borrower, ref code..."
            onChange={setSearch}
          />
        </div>
        <div className="min-w-[10rem] sm:max-w-[14rem]">
          <SelectField
            label="Filter Stage"
            value={stage}
            options={[
              { value: "", label: "All Stages" },
              { value: "field_verification", label: "Field Verification" },
              { value: "approval", label: "Approval Desk" },
              { value: "sanctioned", label: "Sanctioned" },
              { value: "disbursed", label: "Disbursed" },
              { value: "rejected", label: "Rejected" },
            ]}
            onChange={setStage}
          />
        </div>
      </FilterPanel>

      <DataTable
        title={t("title")}
        description={t("description")}
        actions={
          <Button
            type="button"
            variant="secondary"
            icon={RotateCw}
            onClick={() => void load()}
          >
            {tCommon("retry")}
          </Button>
        }
        data={rows}
        columns={columns}
        getRowKey={(row) => String(row.application_id)}
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
          render: (row) => (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={History}
              tooltip="View Lifecycle Timeline"
              onClick={() => handleOpenTimeline(row)}
            >
              Timeline
            </Button>
          ),
        }}
      />

      {/* TRACKING TIMELINE MODAL */}
      <Modal
        open={trackingApp != null}
        title={`Lifecycle Tracking — ${trackingApp?.application_no}`}
        subtitle={`${trackingApp?.member_name} · Current Owner: ${trackingApp?.current_owner}`}
        size="lg"
        onClose={() => setTrackingApp(null)}
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setTrackingApp(null)}>
              Close
            </Button>
          </div>
        }
      >
        {loadingTimeline ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          </div>
        ) : timelineEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No history recorded for this application yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative border-l-2 border-teal-500/30 pl-6 ml-4 space-y-6">
              {timelineEvents.map((evt) => (
                <div key={evt.seq} className="relative">
                  <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white text-[10px] font-bold">
                    {evt.seq}
                  </span>
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        {evt.stage.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-400">{evt.date}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">Action: <span className="font-semibold text-slate-800">{evt.by}</span></p>
                    {evt.result && (
                      <p className="mt-0.5 text-xs font-semibold text-teal-700">Outcome: {evt.result}</p>
                    )}
                    {evt.amount && (
                      <p className="mt-0.5 text-xs text-slate-700">Amount: <span className="font-bold text-slate-900">{money(evt.amount)}</span></p>
                    )}
                    {evt.ref_no && (
                      <p className="text-[11px] font-mono text-slate-500">Ref: {evt.ref_no}</p>
                    )}
                    {evt.remarks && (
                      <p className="mt-2 text-xs italic text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        &ldquo;{evt.remarks}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </ModulePageShell>
  );
}
