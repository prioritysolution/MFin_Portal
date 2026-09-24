"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/Form";

export type AcctLedgerFilterValues = {
  keyword: string;
  mainhdId: string;
  ledgerType: string;
  isActive: "" | "1" | "0";
};

export type AcctLedgerMainHeadOption = {
  value: string;
  label: string;
};

type AcctLedgerFiltersProps = {
  values: AcctLedgerFilterValues;
  mainHeads: AcctLedgerMainHeadOption[];
  onChange: (values: AcctLedgerFilterValues) => void;
  onReset: () => void;
};

export function AcctLedgerFilters({
  values,
  mainHeads,
  onChange,
  onReset,
}: AcctLedgerFiltersProps) {
  const t = useTranslations("master.acctLedger");
  const tUi = useTranslations("ui");
  return (
    <FilterPanel onReset={onReset}>
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

        <div className="min-w-[12rem] sm:max-w-[16rem]">
          <SelectField
            label={t("filters.mainHead")}
            value={values.mainhdId}
            searchable
            placeholder={t("filters.mainHeadAll")}
            searchPlaceholder={tUi("selectSearch")}
            emptyMessage={tUi("selectEmpty")}
            onChange={(mainhdId) => onChange({ ...values, mainhdId })}
            options={[
              { value: "", label: t("filters.mainHeadAll") },
              ...mainHeads,
            ]}
          />
        </div>

        <label className="block min-w-[6rem] sm:max-w-[8rem]">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            {t("filters.ledgerType")}
          </span>
          <Input
            value={values.ledgerType}
            maxLength={1}
            onChange={(event) =>
              onChange({
                ...values,
                ledgerType: event.target.value.toUpperCase().slice(0, 1),
              })
            }
            placeholder={t("filters.ledgerTypePlaceholder")}
          />
        </label>

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
                isActive: isActive as AcctLedgerFilterValues["isActive"],
              })
            }
            options={[
              { value: "", label: t("filters.statusAll") },
              { value: "1", label: t("statusActive") },
              { value: "0", label: t("statusInactive") },
            ]}
          />
        </div>

    </FilterPanel>
  );
}
