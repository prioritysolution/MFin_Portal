"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { ModulePageShell } from "@/components/shared/ModulePageShell";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { masterModulePages } from "@/lib/modules/module.types";
import {
  AcctCategoryFilters,
  type AcctCategoryFilterValues,
} from "@/features/master/acct-category/components/AcctCategoryFilters";
import { AcctCategoryTable } from "@/features/master/acct-category/components/AcctCategoryTable";
import { AcctCategoryForm } from "@/features/master/acct-category/components/AcctCategoryForm";
import {
  createAcctCategory,
  fetchAcctCategoryList,
  isAcctCategoryClientError,
  updateAcctCategory,
} from "@/features/master/acct-category/services/acct-category-client";
import type {
  AcctCategory,
  AcctCategoryCreateInput,
  AcctCategoryUpdateInput,
  PaginationMeta,
} from "@/features/master/acct-category/types/acct-category.types";
import { ACCT_CATEGORY_DEFAULT_PER_PAGE } from "@/features/master/acct-category/types/acct-category.types";

const DEFAULT_FILTERS: AcctCategoryFilterValues = {
  keyword: "",
  categoryType: "",
};

const SEARCH_DEBOUNCE_MS = 350;

function filtersEqual(
  a: AcctCategoryFilterValues,
  b: AcctCategoryFilterValues,
): boolean {
  return a.keyword === b.keyword && a.categoryType === b.categoryType;
}

export function AcctCategoryView() {
  const t = useTranslations("master.acctCategory");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const pageMeta = masterModulePages.acctCategory.toJSON();

  const [filters, setFilters] =
    useState<AcctCategoryFilterValues>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<AcctCategoryFilterValues>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ACCT_CATEGORY_DEFAULT_PER_PAGE);
  const [items, setItems] = useState<AcctCategory[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<AcctCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (filtersEqual(filters, appliedFilters)) return;
    const timer = window.setTimeout(() => {
      setPage(1);
      setAppliedFilters(filters);
      setSuccessMessage(null);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filters, appliedFilters]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      setErrorMessage(undefined);
      try {
        const result = await fetchAcctCategoryList({
          page,
          perPage: pageSize,
          keyword: appliedFilters.keyword.trim() || undefined,
          categoryType: appliedFilters.categoryType || undefined,
        });
        if (cancelled) return;
        setItems(result.items);
        setMeta(result.meta);
      } catch (err) {
        if (cancelled) return;
        if (isAcctCategoryClientError(err) && err.status === 401) {
          router.replace("/login");
          return;
        }
        setError(true);
        setErrorMessage(
          isAcctCategoryClientError(err) ? err.message : tErrors("generic"),
        );
        setItems([]);
        setMeta(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [appliedFilters, page, pageSize, reloadKey, router, tErrors]);

  function openCreate() {
    setFormMode("create");
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(category: AcctCategory) {
    setFormMode("edit");
    setEditing(category);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleCreate(input: AcctCategoryCreateInput) {
    setSaving(true);
    setFormError(null);
    try {
      await createAcctCategory(input);
      setFormOpen(false);
      setEditing(null);
      setSuccessMessage(t("createSuccess"));
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (isAcctCategoryClientError(err) && err.status === 401) {
        router.replace("/login");
        return;
      }
      setFormError(
        isAcctCategoryClientError(err) ? err.message : tErrors("generic"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(input: AcctCategoryUpdateInput) {
    setSaving(true);
    setFormError(null);
    try {
      await updateAcctCategory(input);
      setFormOpen(false);
      setEditing(null);
      setSuccessMessage(t("updateSuccess"));
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (isAcctCategoryClientError(err) && err.status === 401) {
        router.replace("/login");
        return;
      }
      setFormError(
        isAcctCategoryClientError(err) ? err.message : tErrors("generic"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModulePageShell
      page={pageMeta}
      actions={
        <Button type="button" icon={Plus} onClick={openCreate}>
          {t("add")}
        </Button>
      }
    >
      {successMessage ? (
        <Alert tone="success">{successMessage}</Alert>
      ) : null}

      <AcctCategoryFilters
        values={filters}
        onChange={setFilters}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setAppliedFilters(DEFAULT_FILTERS);
          setPage(1);
          setSuccessMessage(null);
        }}
      />

      <AcctCategoryTable
        items={items}
        meta={meta}
        page={page}
        pageSize={pageSize}
        loading={loading}
        error={error}
        errorMessage={errorMessage}
        onRetry={() => setReloadKey((key) => key + 1)}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={openEdit}
      />

      <AcctCategoryForm
        open={formOpen}
        mode={formMode}
        category={editing}
        saving={saving}
        errorMessage={formError}
        onClose={() => {
          if (saving) return;
          setFormOpen(false);
          setFormError(null);
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </ModulePageShell>
  );
}
