"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import type { Branch } from "@/features/master/branch/types/branch.types";
import type { PaginationMeta, Staff } from "@/features/master/staff/types/staff.types";

type Props = {
  items: Staff[]; branches: Branch[]; meta: PaginationMeta | null; page: number; pageSize: number;
  loading: boolean; error: boolean; errorMessage?: string; onRetry: () => void;
  onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void;
};
const modules = ["members", "collections", "loanApplications", "reports"] as const;
type Module = (typeof modules)[number];

export function FieldStaffPreview({ items, branches, meta, page, pageSize, loading, error, errorMessage, onRetry, onPageChange, onPageSizeChange }: Props) {
  const t = useTranslations("master.staff");
  const [selected, setSelected] = useState<Staff | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Module[]>>({});
  const columns: DataTableColumn<Staff>[] = [
    { id: "code", header: t("columns.employeeCode"), cell: (row) => row.employeeCode },
    { id: "name", header: t("columns.fullName"), cell: (row) => row.fullName },
    { id: "branch", header: t("fields.branch"), cell: (row) => branches.find((branch) => branch.branchId === row.branchId)?.branchName ?? "—" },
    { id: "designation", header: t("columns.designation"), cell: (row) => row.designationName ?? "—" },
    { id: "mobile", header: t("columns.mobile"), cell: (row) => row.mobile ?? "—" },
  ];
  return <div className="space-y-4">
    <p role="note" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{t("phoneAccess.demoNotice")}</p>
    <DataTable title={t("phoneAccess.fieldStaff")} description={t("phoneAccess.chooseStaff")} data={items} columns={columns} getRowKey={(row) => String(row.staffId)} loading={loading} error={error} errorTitle={t("loadErrorTitle")} errorMessage={errorMessage} onRetry={onRetry} emptyTitle={t("emptyTitle")} emptyMessage={t("emptyMessage")} minWidth="850px" rowActions={{ header: t("columns.actions"), render: (row) => <Button size="sm" variant="secondary" icon={ShieldCheck} onClick={() => setSelected(row)}>{t("phoneAccess.configure")}</Button> }} pagination={{ page, pageSize, total: meta?.total ?? items.length, totalPages: meta?.lastPage, pageSizeOptions: [10, 20, 50, 100], onPageChange, onPageSizeChange }} />
    <Modal open={selected !== null} onClose={() => setSelected(null)} title={t("phoneAccess.title")} size="md" footer={<Button variant="secondary" onClick={() => setSelected(null)}>{t("phoneAccess.done")}</Button>}>
      {selected && <div className="space-y-4"><p className="font-semibold text-slate-900">{selected.fullName} ({selected.employeeCode})</p><p role="note" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{t("phoneAccess.demoNotice")}</p><fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-3 text-sm font-semibold">{t("phoneAccess.modules")}</legend>{modules.map((module) => <CheckboxField key={module} label={t(`phoneAccess.${module}`)} checked={(drafts[selected.staffId] ?? []).includes(module)} onChange={(checked) => setDrafts((previous) => { const existing = previous[selected.staffId] ?? []; return { ...previous, [selected.staffId]: checked ? [...existing, module] : existing.filter((item) => item !== module) }; })} />)}</fieldset></div>}
    </Modal>
  </div>;
}
