"use client";

import { RotateCcw, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/Form";
import { ACCT_CATEGORY_TYPE_OPTIONS } from "@/features/master/acct-category/types/acct-category.types";

export type AcctCategoryFilterValues = {
  keyword: string;
  categoryType: string;
};

type AcctCategoryFiltersProps = {
  values: AcctCategoryFilterValues;
  onChange: (values: AcctCategoryFilterValues) => void;
  onReset: () => void;
};

export function AcctCategoryFilters({
  values,
  onChange,
  onReset,
}: AcctCategoryFiltersProps) {
  const t = useTranslations("master.acctCategory");
  const tUi = useTranslations("ui");
  const tCommon = useTranslations("common");

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <label className="relative block min-w-[14rem] flex-1 sm:max-w-md">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            {t("filters.search")}
          </span>
          <span className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-soft" />
            <Input
              value={values.keyword}
              onChange={(event) =>
                onChange({ ...values, keyword: event.target.value })
              }
              placeholder={t("filters.searchPlaceholder")}
              className="pl-9"
            />
          </span>
        </label>

        <div className="min-w-[10rem] sm:max-w-[14rem]">
          <SelectField
            label={t("filters.categoryType")}
            value={values.categoryType}
            searchable={false}
            placeholder={t("filters.categoryTypeAll")}
            searchPlaceholder={tUi("selectSearch")}
            emptyMessage={tUi("selectEmpty")}
            onChange={(categoryType) => onChange({ ...values, categoryType })}
            options={[
              { value: "", label: t("filters.categoryTypeAll") },
              ...ACCT_CATEGORY_TYPE_OPTIONS.map((code) => ({
                value: code,
                label: t(`types.${code}`),
              })),
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
