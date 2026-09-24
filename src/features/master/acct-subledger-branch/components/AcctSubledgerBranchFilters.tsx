"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/Form";

export type AcctSubledgerBranchFilterValues = {
  subledgId: string;
  branchId: string;
  isActive: "" | "1" | "0";
};

export type SelectOption = {
  value: string;
  label: string;
};

type AcctSubledgerBranchFiltersProps = {
  values: AcctSubledgerBranchFilterValues;
  subledgers: SelectOption[];
  branches: SelectOption[];
  onChange: (values: AcctSubledgerBranchFilterValues) => void;
  onReset: () => void;
};

export function AcctSubledgerBranchFilters({
  values,
  subledgers,
  branches,
  onChange,
  onReset,
}: AcctSubledgerBranchFiltersProps) {
  const t = useTranslations("master.acctSubledgerBranch");
  const tUi = useTranslations("ui");
  const tCommon = useTranslations("common");

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="min-w-[12rem] sm:max-w-[16rem]">
          <SelectField
            label={t("filters.subledger")}
            value={values.subledgId}
            searchable
            placeholder={t("filters.subledgerAll")}
            searchPlaceholder={tUi("selectSearch")}
            emptyMessage={tUi("selectEmpty")}
            onChange={(subledgId) => onChange({ ...values, subledgId })}
            options={[
              { value: "", label: t("filters.subledgerAll") },
              ...subledgers,
            ]}
          />
        </div>

        <div className="min-w-[12rem] sm:max-w-[16rem]">
          <SelectField
            label={t("filters.branch")}
            value={values.branchId}
            searchable
            placeholder={t("filters.branchAll")}
            searchPlaceholder={tUi("selectSearch")}
            emptyMessage={tUi("selectEmpty")}
            onChange={(branchId) => onChange({ ...values, branchId })}
            options={[
              { value: "", label: t("filters.branchAll") },
              ...branches,
            ]}
          />
        </div>

        <div className="min-w-[9rem] sm:max-w-[12rem]">
          <SelectField
            label={t("filters.status")}
            value={values.isActive}
            searchable={false}
            placeholder={t("filters.statusAll")}
            searchPlaceholder={tUi("selectSearch")}
            emptyMessage={tUi("selectEmpty")}
            onChange={(isActive) =>
              onChange({
                ...values,
                isActive: isActive as AcctSubledgerBranchFilterValues["isActive"],
              })
            }
            options={[
              { value: "", label: t("filters.statusAll") },
              { value: "1", label: t("statusActive") },
              { value: "0", label: t("statusInactive") },
            ]}
          />
        </div>

        <Button type="button" variant="secondary" icon={RotateCcw} onClick={onReset}>
          {tCommon("reset")}
        </Button>
      </div>
    </div>
  );
}
