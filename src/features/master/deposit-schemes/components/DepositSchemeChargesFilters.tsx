"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/Form";
import type { ApplOption } from "@/features/master/appl-options";

export type DepositSchemeChargesFilterValues = {
  search: string;
  schemeId: string;
  chargesCd: string;
  isActive: "" | "1" | "0";
};

type DepositSchemeChargesFiltersProps = {
  values: DepositSchemeChargesFilterValues;
  schemes?: { id: number; schemeName: string }[];
  chargesOptions?: ApplOption[];
  onChange: (values: DepositSchemeChargesFilterValues) => void;
  onReset: () => void;
};

export function DepositSchemeChargesFilters({
  values,
  schemes = [],
  chargesOptions = [],
  onChange,
  onReset,
}: DepositSchemeChargesFiltersProps) {
  const t = useTranslations("master.depositSchemes.charges");
  const tUi = useTranslations("ui");

  const schemeFilterOptions = [
    { value: "", label: t("filters.schemeAll", { fallback: "All Schemes" }) },
    ...schemes.map((s) => ({ value: String(s.id), label: s.schemeName })),
  ];

  const chargeTypeFilterOptions = [
    {
      value: "",
      label: t("filters.chargesTypeAll", { fallback: "All Charge Types" }),
    },
    ...chargesOptions.map((o) => ({
      value: String(o.optCode),
      label: o.optDescription,
    })),
  ];

  return (
    <FilterPanel onReset={onReset}>
      <label className="relative block min-w-[14rem] flex-1 sm:max-w-xs">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">
          {t("filters.search")}
        </span>
        <span className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-soft" />
          <Input
            value={values.search}
            onChange={(event) =>
              onChange({ ...values, search: event.target.value })
            }
            placeholder={t("filters.searchPlaceholder")}
            className="pl-9"
          />
        </span>
      </label>

      <div className="min-w-[10rem] sm:max-w-[13rem]">
        <SelectField
          label={t("filters.scheme", { fallback: "Scheme" })}
          value={values.schemeId}
          placeholder={t("filters.schemeAll", { fallback: "All Schemes" })}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          onChange={(schemeId) => onChange({ ...values, schemeId })}
          options={schemeFilterOptions}
        />
      </div>

      <div className="min-w-[10rem] sm:max-w-[13rem]">
        <SelectField
          label={t("filters.chargesType", { fallback: "Charge Type" })}
          value={values.chargesCd}
          placeholder={t("filters.chargesTypeAll", {
            fallback: "All Charge Types",
          })}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          onChange={(chargesCd) => onChange({ ...values, chargesCd })}
          options={chargeTypeFilterOptions}
        />
      </div>

      <div className="min-w-[8rem] sm:max-w-[10rem]">
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
              isActive: isActive as DepositSchemeChargesFilterValues["isActive"],
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
