"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type {
  AcctCategory,
  PaginationMeta,
} from "@/features/master/acct-category/types/acct-category.types";
import { ACCT_CATEGORY_TYPE_OPTIONS } from "@/features/master/acct-category/types/acct-category.types";

type AcctCategoryTableProps = {
  items: AcctCategory[];
  meta: PaginationMeta | null;
  page: number;
  pageSize: number;
  loading: boolean;
  error: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (row: AcctCategory) => void;
  headerActions?: ReactNode;
};

function isKnownType(
  value: string,
): value is (typeof ACCT_CATEGORY_TYPE_OPTIONS)[number] {
  return (ACCT_CATEGORY_TYPE_OPTIONS as readonly string[]).includes(value);
}

export function AcctCategoryTable({
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
  headerActions,
}: AcctCategoryTableProps) {
  const t = useTranslations("master.acctCategory");

  const columns = useMemo<DataTableColumn<AcctCategory>[]>(
    () => [
      {
        id: "categCode",
        header: t("columns.categCode"),
        cell: (row) => (
          <span className="font-mono text-xs text-slate-700">
            {row.categCode}
          </span>
        ),
      },
      {
        id: "categName",
        header: t("columns.categName"),
        cell: (row) => (
          <span className="font-medium text-slate-800">{row.categName}</span>
        ),
      },
      {
        id: "categoryType",
        header: t("columns.categoryType"),
        cell: (row) => {
          if (!row.categoryType) {
            return <span className="text-slate-400">—</span>;
          }
          const label = isKnownType(row.categoryType)
            ? t(`types.${row.categoryType}`)
            : row.categoryType;
          return (
            <Badge tone="info" caps={false}>
              {label}
            </Badge>
          );
        },
      },
      {
        id: "headCount",
        header: t("columns.headCount"),
        cell: (row) => (
          <span className="tabular-nums text-slate-700">{row.headCount}</span>
        ),
      },
    ],
    [t],
  );

  return (
    <DataTable<AcctCategory>
      title={t("title")}
      description={t("description")}
      actions={headerActions}
      data={items}
      columns={columns}
      getRowKey={(row) => String(row.categId)}
      loading={loading}
      error={error}
      errorTitle={t("loadErrorTitle")}
      errorMessage={errorMessage}
      onRetry={onRetry}
      emptyTitle={t("emptyTitle")}
      emptyMessage={t("emptyMessage")}
      minWidth="760px"
      caption={t("tableCaption")}
      rowActions={{
        header: t("columns.actions"),
        render: (row) => (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Pencil}
            tooltip={t("edit")}
            onClick={() => onEdit(row)}
          />
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
