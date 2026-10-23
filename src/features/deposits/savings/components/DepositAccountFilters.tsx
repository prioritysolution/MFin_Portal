"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { Button } from "@/components/ui/Button";
import { DateField, SelectField } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { fetchApplOptions } from "@/features/master/appl-options";
import { fetchBranchList } from "@/features/master/branch/services/branch-client";
import { fetchDepositSchemeSetups } from "@/features/master/deposit-schemes";
import {
  OPT_CUST_TYPE,
  OPT_STATUS,
  SAVINGS_DEPOSIT_TYPE,
} from "../deposit-account.constants";
import type { SavingsAccountFilters } from "../savings-filters";

type DepositAccountFiltersProps = {
  values: SavingsAccountFilters;
  isHead: boolean;
  branchName: string;
  onChange: (values: SavingsAccountFilters) => void;
  onReset: () => void;
};

export function DepositAccountFilters({
  values,
  isHead,
  branchName,
  onChange,
  onReset,
}: DepositAccountFiltersProps) {
  const t = useTranslations("deposits.savings");
  const tUi = useTranslations("ui");
  const [schemes, setSchemes] = useState<
    { value: string; label: string }[]
  >([]);
  const [branches, setBranches] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [statuses, setStatuses] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [customers, setCustomers] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [schemeResult, branchResult, statusOptions, customerOptions] =
        await Promise.all([
          fetchDepositSchemeSetups({
            perPage: 200,
            isActive: 1,
            depositTypeCd: SAVINGS_DEPOSIT_TYPE,
          }).catch(() => null),
          isHead
            ? fetchBranchList({ perPage: 200, isActive: 1 }).catch(() => null)
            : Promise.resolve(null),
          fetchApplOptions(OPT_STATUS).catch(() => []),
          fetchApplOptions(OPT_CUST_TYPE).catch(() => []),
        ]);
      if (cancelled) return;
      setSchemes(
        (schemeResult?.items ?? []).map((scheme) => ({
          value: String(scheme.id),
          label: scheme.schemeCode
            ? `${scheme.schemeCode} · ${scheme.schemeName}`
            : scheme.schemeName,
        })),
      );
      setBranches(
        (branchResult?.items ?? []).map((branch) => ({
          value: String(branch.branchId),
          label: branch.branchCode
            ? `${branch.branchCode} · ${branch.branchName}`
            : branch.branchName,
        })),
      );
      setStatuses(
        statusOptions.map((option) => ({
          value: String(option.optCode),
          label: option.optDescription,
        })),
      );
      setCustomers(
        customerOptions.map((option) => ({
          value: String(option.optCode),
          label: option.optDescription,
        })),
      );
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isHead]);

  const scope =
    values.memberId !== ""
      ? t("filters.memberScope")
      : values.groupId !== ""
        ? t("filters.groupScope")
        : null;

  return (
    <div className="flex flex-col gap-3">
      {scope ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <p>{scope}</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={X}
            onClick={() => onChange({ ...values, memberId: "", groupId: "" })}
          >
            {t("filters.clearScope")}
          </Button>
        </div>
      ) : null}

      <FilterPanel onReset={onReset}>
        <label className="relative block min-w-[14rem] flex-1 sm:max-w-md">
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
              aria-label={t("filters.search")}
            />
          </span>
        </label>

        {isHead ? (
          <SelectField
            label={t("filters.branch")}
            value={values.branchId}
            placeholder={t("filters.branchAll")}
            searchPlaceholder={tUi("selectSearch")}
            emptyMessage={tUi("selectEmpty")}
            onChange={(branchId) => onChange({ ...values, branchId })}
            options={[
              { value: "", label: t("filters.branchAll") },
              ...branches,
            ]}
          />
        ) : (
          <div className="min-w-[10rem]">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              {t("filters.branch")}
            </span>
            <p className="rounded-[var(--radius-control)] border border-border bg-surface-muted px-3 py-2.5 text-sm text-slate-700">
              {branchName || t("filters.branchFixed")}
            </p>
          </div>
        )}

        <SelectField
          label={t("filters.scheme")}
          value={values.schemeId}
          placeholder={t("filters.schemeAll")}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          onChange={(schemeId) => onChange({ ...values, schemeId })}
          options={[{ value: "", label: t("filters.schemeAll") }, ...schemes]}
        />

        <SelectField
          label={t("filters.customer")}
          value={values.custTypeCd}
          searchable={false}
          placeholder={t("filters.customerAll")}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          onChange={(custTypeCd) => onChange({ ...values, custTypeCd })}
          options={[
            { value: "", label: t("filters.customerAll") },
            ...customers,
          ]}
        />

        <SelectField
          label={t("filters.status")}
          value={values.statusCd}
          searchable={false}
          placeholder={t("filters.statusAll")}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          onChange={(statusCd) => onChange({ ...values, statusCd })}
          options={[{ value: "", label: t("filters.statusAll") }, ...statuses]}
        />

        <SelectField
          label={t("filters.openClosed")}
          value={values.isClosed}
          searchable={false}
          placeholder={t("filters.openOnly")}
          searchPlaceholder={tUi("selectSearch")}
          emptyMessage={tUi("selectEmpty")}
          onChange={(isClosed) =>
            onChange({
              ...values,
              isClosed: isClosed as SavingsAccountFilters["isClosed"],
            })
          }
          options={[
            { value: "0", label: t("filters.openOnly") },
            { value: "1", label: t("filters.closedOnly") },
            { value: "", label: t("filters.either") },
          ]}
        />

        <DateField
          label={t("filters.fromDate")}
          value={values.fromDate}
          onChange={(fromDate) => onChange({ ...values, fromDate })}
        />
        <DateField
          label={t("filters.toDate")}
          value={values.toDate}
          min={values.fromDate || undefined}
          onChange={(toDate) => onChange({ ...values, toDate })}
        />
      </FilterPanel>
    </div>
  );
}
