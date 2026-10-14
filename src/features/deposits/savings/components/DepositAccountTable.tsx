"use client";

import { useMemo, type ReactNode } from "react";
import { Ban, Eye, Pencil, SlidersHorizontal, Users } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { DataTable } from "@/components/shared/DataTable";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { parseYmd } from "../deposit-account.rules";
import type { DepositAccount, PaginationMeta } from "../types/deposit-account.types";

type DepositAccountTableProps = {
  items: DepositAccount[];
  meta: PaginationMeta | null;
  page: number;
  pageSize: number;
  loading: boolean;
  error: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onView: (row: DepositAccount) => void;
  onEdit: (row: DepositAccount) => void;
  onStatus: (row: DepositAccount) => void;
  onCloseAccount: (row: DepositAccount) => void;
  onOpen: () => void;
  headerActions?: ReactNode;
};

function statusTone(statusCd: number): BadgeTone {
  if (statusCd === 1) return "success";
  if (statusCd === 7) return "warning";
  if (statusCd === 4) return "danger";
  if (statusCd === 5 || statusCd === 6) return "amber";
  return "neutral";
}

export function DepositAccountTable({
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
  onView,
  onEdit,
  onStatus,
  onCloseAccount,
  onOpen,
  headerActions,
}: DepositAccountTableProps) {
  const t = useTranslations("deposits.savings");
  const format = useFormatter();

  const columns = useMemo<DataTableColumn<DepositAccount>[]>(
    () => [
      {
        id: "applNo",
        header: t("columns.applNo"),
        cell: (row) => (
          <div>
            <p className="font-semibold text-slate-900">{row.applNo || t("dash")}</p>
            <p className="text-xs text-muted">
              {row.accountNo != null
                ? t("columns.accountLine", {
                    number: row.accountNo,
                    type: row.depositTypeDesc || t("dash"),
                  })
                : t("columns.accountPending", {
                    type: row.depositTypeDesc || t("dash"),
                  })}
            </p>
          </div>
        ),
      },
      {
        id: "holder",
        header: t("columns.holder"),
        cell: (row) => (
          <div>
            <p className="inline-flex items-center gap-1.5 font-medium text-slate-800">
              {row.custIdJoint1 != null ? (
                <Users
                  className="h-3.5 w-3.5 shrink-0 text-slate-500"
                  aria-label={t("columns.joint")}
                />
              ) : null}
              <span>{row.holderName || row.primaryName || t("dash")}</span>
            </p>
            <p className="text-xs text-muted">
              {t("columns.holderMeta", {
                ref: row.primaryRefCode || t("dash"),
                customerType: row.custTypeDesc || t("dash"),
              })}
            </p>
          </div>
        ),
      },
      {
        id: "scheme",
        header: t("columns.scheme"),
        cell: (row) => (
          <div>
            <p className="text-slate-800">{row.schemeName || t("dash")}</p>
            <p className="text-xs text-muted">
              {t("columns.schemeMeta", {
                code: row.schemeCode || t("dash"),
                roi:
                  row.schemeRoiPercent == null
                    ? t("dash")
                    : t("roiPercent", {
                        value: format.number(row.schemeRoiPercent, {
                          maximumFractionDigits: 2,
                        }),
                      }),
              })}
            </p>
          </div>
        ),
      },
      {
        id: "mode",
        header: t("columns.mode"),
        cell: (row) => (
          <span className="text-slate-700">{row.opModeDesc || t("dash")}</span>
        ),
      },
      {
        id: "balance",
        header: t("columns.balance"),
        align: "end",
        className: "font-semibold tabular-nums text-slate-900",
        cell: (row) =>
          row.currentBalance == null
            ? t("dash")
            : format.number(row.currentBalance, {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
      },
      {
        id: "status",
        header: t("columns.status"),
        cell: (row) =>
          row.isClosed ? (
            <div>
              <Badge tone="neutral" caps={false}>
                {t("closed")}
              </Badge>
              {row.closingDate ? (
                <p className="mt-1 text-xs text-muted">
                  {t("closedOn", {
                    date: format.dateTime(parseYmd(row.closingDate) ?? new Date(row.closingDate), {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }),
                  })}
                </p>
              ) : null}
            </div>
          ) : (
            <Badge tone={statusTone(row.statusCd)} caps={false}>
              {row.statusDesc || t("dash")}
            </Badge>
          ),
      },
    ],
    [format, t],
  );

  return (
    <DataTable
      title={t("tableCaption")}
      description={t("description")}
      actions={headerActions}
      data={items}
      columns={columns}
      getRowKey={(row) => String(row.accountId)}
      getRowClassName={(row) => (row.isClosed ? "opacity-60" : undefined)}
      loading={loading}
      error={error}
      errorTitle={t("loadErrorTitle")}
      errorMessage={errorMessage}
      onRetry={onRetry}
      emptyTitle={t("emptyTitle")}
      emptyMessage={t("emptyMessage")}
      emptyAction={
        <Button type="button" onClick={onOpen}>
          {t("openAccount")}
        </Button>
      }
      minWidth="960px"
      caption={t("tableCaption")}
      rowActions={{
        header: t("columns.actions"),
        render: (row) => (
          <div className="inline-flex items-center gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Eye}
              tooltip={t("actions.view")}
              onClick={() => onView(row)}
            />
            {row.isClosed ? null : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Pencil}
                  tooltip={t("actions.edit")}
                  onClick={() => onEdit(row)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={SlidersHorizontal}
                  tooltip={t("actions.changeStatus")}
                  onClick={() => onStatus(row)}
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  icon={Ban}
                  tooltip={t("actions.close")}
                  onClick={() => onCloseAccount(row)}
                />
              </>
            )}
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
