"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { SelectField, TextField } from "@/components/ui/Form";

export type MakerCheckerFilterValues = {
  voucherType: string;
  isActive: "" | "1" | "0";
};

type MakerCheckerFiltersProps = {
  values: MakerCheckerFilterValues;
  onChange: (values: MakerCheckerFilterValues) => void;
  onReset: () => void;
};

export function MakerCheckerFilters({
  values,
  onChange,
  onReset,
}: MakerCheckerFiltersProps) {
  const t = useTranslations("master.makerChecker");
  const tUi = useTranslations("ui");

  return (
    <FilterPanel onReset={onReset}>
      <div className="min-w-[10rem] sm:max-w-[14rem]">
        <TextField
          label={t("filters.voucherType")}
          value={values.voucherType}
          inputMode="numeric"
          restrict="digits"
          onChange={(voucherType) => onChange({ ...values, voucherType })}
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
              isActive: isActive as MakerCheckerFilterValues["isActive"],
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
