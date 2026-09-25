"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { ModulePageShell } from "@/components/shared/ModulePageShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { PageToast, useToastText } from "@/components/ui/PageToast";
import { masterModulePages } from "@/lib/modules/module.types";
import {
  AcctLedgerFilters,
  type AcctLedgerFilterValues,
  type AcctLedgerMainHeadOption,
} from "@/features/master/acct-ledger/components/AcctLedgerFilters";
import { AcctLedgerTable } from "@/features/master/acct-ledger/components/AcctLedgerTable";
import { AcctLedgerForm } from "@/features/master/acct-ledger/components/AcctLedgerForm";
import {
  createAcctLedger,
  fetchAcctLedgerList,
  isAcctLedgerClientError,
  updateAcctLedger,
} from "@/features/master/acct-ledger/services/acct-ledger-client";
import {
  fetchAcctHeadList,
  isAcctHeadClientError,
} from "@/features/master/acct-head/services/acct-head-client";
import type {
  AcctLedger,
  AcctLedgerCreateInput,
  AcctLedgerUpdateInput,
  PaginationMeta,
} from "@/features/master/acct-ledger/types/acct-ledger.types";
import { ACCT_LEDGER_DEFAULT_PER_PAGE } from "@/features/master/acct-ledger/types/acct-ledger.types";

const DEFAULT_FILTERS: AcctLedgerFilterValues = {
  keyword: "",
  mainhdId: "",
  ledgerType: "",
  isActive: "",
};

const SEARCH_DEBOUNCE_MS = 350;

function filtersEqual(
  a: AcctLedgerFilterValues,
  b: AcctLedgerFilterValues,
): boolean {
  return (
    a.keyword === b.keyword &&
    a.mainhdId === b.mainhdId &&
    a.ledgerType === b.ledgerType &&
    a.isActive === b.isActive
  );
}

export type AcctLedgerViewProps = {
  embedded?: boolean;
};

export function AcctLedgerView({ embedded = false }: AcctLedgerViewProps = {}) {
  const t = useTranslations("master.acctLedger");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const pageMeta = masterModulePages.acctLedger.toJSON();

  const [filters, setFilters] =
    useState<AcctLedgerFilterValues>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<AcctLedgerFilterValues>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ACCT_LEDGER_DEFAULT_PER_PAGE);
  const [items, setItems] = useState<AcctLedger[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [mainHeads, setMainHeads] = useState<AcctLedgerMainHeadOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [reloadKey, setReloadKey] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<AcctLedger | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useToastText();
  const [statusBusyId, setStatusBusyId] = useState<number | null>(null);
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<AcctLedger | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMainHeads() {
      try {
        const result = await fetchAcctHeadList({
          page: 1,
          perPage: 200,
          isActive: 1,
        });
        if (cancelled) return;
        setMainHeads(
          result.items.map((item) => ({
            value: String(item.mainhdId),
            label: item.mainhdCode
              ? `${item.mainhdName} (${item.mainhdCode})`
              : item.mainhdName,
          })),
        );
      } catch (err) {
        if (cancelled) return;
        if (isAcctHeadClientError(err) && err.status === 401) {
          router.replace("/login");
        }
      }
    }

    void loadMainHeads();
    return () => {
      cancelled = true;
    };
  }, [router]);

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
        const mainhdId = Number(appliedFilters.mainhdId);
        const result = await fetchAcctLedgerList({
          page,
          perPage: pageSize,
          keyword: appliedFilters.keyword.trim() || undefined,
          mainhdId:
            Number.isFinite(mainhdId) && mainhdId > 0 ? mainhdId : undefined,
          ledgerType: appliedFilters.ledgerType.trim() || undefined,
          isActive:
            appliedFilters.isActive === ""
              ? undefined
              : Number(appliedFilters.isActive),
        });
        if (cancelled) return;
        setItems(result.items);
        setMeta(result.meta);
      } catch (err) {
        if (cancelled) return;
        if (isAcctLedgerClientError(err) && err.status === 401) {
          router.replace("/login");
          return;
        }
        setError(true);
        setErrorMessage(
          isAcctLedgerClientError(err) ? err.message : tErrors("generic"),
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

  function openEdit(ledger: AcctLedger) {
    setFormMode("edit");
    setEditing(ledger);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleCreate(input: AcctLedgerCreateInput) {
    setSaving(true);
    setFormError(null);
    try {
      await createAcctLedger(input);
      setFormOpen(false);
      setEditing(null);
      setSuccessMessage(t("createSuccess"));
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (isAcctLedgerClientError(err) && err.status === 401) {
        router.replace("/login");
        return;
      }
      setFormError(
        isAcctLedgerClientError(err) ? err.message : tErrors("generic"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(input: AcctLedgerUpdateInput) {
    setSaving(true);
    setFormError(null);
    try {
      await updateAcctLedger(input);
      setFormOpen(false);
      setEditing(null);
      setItems((prev) =>
        prev.map((item) =>
          item.ledgerId === input.ledgerId
            ? {
                ...item,
                ledgerName: input.ledgerName,
                mainhdId: input.mainhdId,
                ledgerType: input.ledgerType ?? item.ledgerType,
                isActive:
                  input.isActive !== undefined ? input.isActive : item.isActive,
              }
            : item,
        ),
      );
      setSuccessMessage(t("updateSuccess"));
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (isAcctLedgerClientError(err) && err.status === 401) {
        router.replace("/login");
        return;
      }
      setFormError(
        isAcctLedgerClientError(err) ? err.message : tErrors("generic"),
      );
    } finally {
      setSaving(false);
    }
  }

  function handleToggleStatus(ledger: AcctLedger) {
    setStatusConfirmTarget(ledger);
  }

  async function executeToggleStatus(ledger: AcctLedger) {
    const nextActive = !ledger.isActive;
    setStatusBusyId(ledger.ledgerId);
    setSuccessMessage(null);
    try {
      await updateAcctLedger({
        ledgerId: ledger.ledgerId,
        ledgerName: ledger.ledgerName,
        mainhdId: ledger.mainhdId,
        ledgerType: ledger.ledgerType,
        isActive: nextActive,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.ledgerId === ledger.ledgerId
            ? { ...item, isActive: nextActive }
            : item,
        ),
      );
      setSuccessMessage(
        nextActive ? t("activateSuccess") : t("deactivateSuccess"),
      );
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (isAcctLedgerClientError(err) && err.status === 401) {
        router.replace("/login");
        return;
      }
      setError(true);
      setErrorMessage(
        isAcctLedgerClientError(err) ? err.message : tErrors("generic"),
      );
    } finally {
      setStatusBusyId(null);
    }
  }

  const body = (
    <>
      <PageToast message={successMessage} />

      <AcctLedgerFilters
        values={filters}
        mainHeads={mainHeads}
        onChange={setFilters}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setAppliedFilters(DEFAULT_FILTERS);
          setPage(1);
          setSuccessMessage(null);
        }}
      />

      <AcctLedgerTable
        items={items}
        meta={meta}
        page={page}
        pageSize={pageSize}
        loading={loading}
        error={error}
        errorMessage={errorMessage}
        statusBusyId={statusBusyId}
        onRetry={() => setReloadKey((key) => key + 1)}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={openEdit}
        onToggleStatus={handleToggleStatus}
        headerActions={
          <Button type="button" icon={Plus} onClick={openCreate}>
            {t("add")}
          </Button>
        }
      />

      <AcctLedgerForm
        open={formOpen}
        mode={formMode}
        ledger={editing}
        mainHeads={mainHeads}
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

      <ConfirmDialog
        open={Boolean(statusConfirmTarget)}
        onClose={() => setStatusConfirmTarget(null)}
        onConfirm={async () => {
          if (!statusConfirmTarget) return;
          const target = statusConfirmTarget;
          setStatusConfirmTarget(null);
          await executeToggleStatus(target);
        }}
        actionType={
          statusConfirmTarget?.isActive ? "deactivate" : "activate"
        }
        itemName={statusConfirmTarget?.ledgerName}
        itemType="Account Ledger"
      />
    </>
  );

  if (embedded) {
    return <div className="flex min-w-0 flex-col gap-4 sm:gap-5">{body}</div>;
  }

  return <ModulePageShell page={pageMeta}>{body}</ModulePageShell>;
}
