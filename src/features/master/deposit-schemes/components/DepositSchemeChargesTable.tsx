"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Ban, CircleCheck, Pencil } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type {
  DepositSchemeCharge,
  PaginationMeta,
} from "@/features/master/deposit-schemes/types/deposit-schemes.types";

type DepositSchemeChargesTableProps = {
  items: DepositSchemeCharge[];
  meta: PaginationMeta | null;
  page: number;
  pageSize: number;
  loading: boolean;
  error: boolean;
  errorMessage?: string;
  statusBusyId?: number | null;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (row: DepositSchemeCharge) => void;
  onToggleActive: (row: DepositSchemeCharge) => void;
  headerActions?: ReactNode;
};

export function DepositSchemeChargesTable({
  items,
  meta,
  page,
  pageSize,
  loading,
  error,
  errorMessage,
  onRetry,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onToggleActive,
  statusBusyId = null,
  headerActions,
}: DepositSchemeChargesTableProps) {
  const t = useTranslations("master.depositSchemes.charges");
  const tGlobal = useTranslations("master.depositSchemes");

  const columns = useMemo<DataTableColumn<DepositSchemeCharge>[]>(
    () => [
      {
        id: "schemeName",
        header: t("fields.scheme"),
        cell: (row) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">{row.schemeName}</span>
            {row.schemeCode ? (
              <span className="font-mono text-xs text-slate-500">
                {row.schemeCode}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        id: "chargesDesc",
        header: t("fields.chargesType"),
        cell: (row) => (
          <span className="font-medium text-slate-700">
            {row.chargesDesc || `Charge #${row.chargesCd}`}
          </span>
        ),
      },
      {
        id: "chargesFig",
        header: t("fields.chargesFigures"),
        cell: (row) => {
          const isPercent =
            row.figureCd === 2 ||
            row.figureDesc?.toLowerCase().includes("percent");
          return (
            <span className="font-semibold text-slate-700">
              {row.chargesFig}
              {isPercent ? "%" : ` (${row.figureDesc || "Amount"})`}
            </span>
          );
        },
      },
      {
        id: "chargesGl",
        header: t("fields.chargesGl"),
        cell: (row) => (
          <span className="text-slate-700">
            {row.chargesGlName
              ? `${row.chargesGlName} (${row.chargesGlCode || `LD-${row.chargesGl}`})`
              : row.chargesGl
                ? `Ledger #${row.chargesGl}`
                : "—"}
          </span>
        ),
      },
      {
        id: "runDuration",
        header: t("fields.runDuration"),
        cell: (row) => (
          <span className="text-slate-700">
            {row.runDurationDesc ||
              (row.runDurationCd ? `Duration #${row.runDurationCd}` : "—")}
          </span>
        ),
      },
      {
        id: "effectiveDates",
        header: t("fields.effectFrom"),
        cell: (row) => (
          <div className="text-xs text-slate-600">
            <span>{row.effectFrm}</span>
            <span className="mx-1 text-slate-400">→</span>
            <span>{row.effectUpto || t("fields.openEnded", { fallback: "Open-ended" })}</span>
          </div>
        ),
      },
      {
        id: "isActive",
        header: t("fields.isActive"),
        cell: (row) => (
          <Badge tone={row.isActive ? "success" : "neutral"} caps>
            {row.isActive ? t("statusActive") : t("statusInactive")}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return (
    <DataTable<DepositSchemeCharge>
      title={t("tableCaption")}
      description={""}
      actions={headerActions}
      data={items}
      columns={columns}
      getRowKey={(row) => String(row.id)}
      loading={loading}
      error={error}
      errorTitle={t("loadErrorTitle")}
      errorMessage={errorMessage}
      onRetry={onRetry}
      emptyTitle={t("emptyTitle")}
      emptyMessage={t("emptyMessage")}
      minWidth="980px"
      caption={t("tableCaption")}
      rowActions={{
        header: tGlobal("columns.actions", { fallback: "Actions" }),
        render: (row) => (
          <div className="inline-flex items-center gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Pencil}
              tooltip={t("edit")}
              onClick={() => onEdit(row)}
            />
            <Button
              type="button"
              variant={row.isActive ? "warning" : "success"}
              size="sm"
              icon={row.isActive ? Ban : CircleCheck}
              tooltip={row.isActive ? t("deactivate") : t("activate")}
              disabled={statusBusyId === row.id}
              onClick={() => onToggleActive(row)}
            />
          </div>
        ),
      }}
      pagination={{
        page,
        pageSize,
        total: meta?.total ?? items.length,
        totalPages: meta?.lastPage,
        pageSizeOptions: [20, 50, 100, 200],
        onPageChange,
        onPageSizeChange,
      }}
    />
  );
}
