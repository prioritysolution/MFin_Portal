"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { ModulePageShell } from "@/components/shared/ModulePageShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { PageToast, useToastText } from "@/components/ui/PageToast";
import { masterModulePages } from "@/lib/modules/module.types";
import {
  MakerCheckerFilters,
  type MakerCheckerFilterValues,
} from "@/features/master/maker-checker/components/MakerCheckerFilters";
import { MakerCheckerTable } from "@/features/master/maker-checker/components/MakerCheckerTable";
import { MakerCheckerForm } from "@/features/master/maker-checker/components/MakerCheckerForm";
import {
  createMakerCheckerRule,
  fetchMakerCheckerList,
  isMakerCheckerClientError,
  updateMakerCheckerRule,
} from "@/features/master/maker-checker/services/maker-checker-client";
import {
  fetchRoleList,
  isRoleClientError,
} from "@/features/master/roles/services/role-client";
import type {
  MakerCheckerCreateInput,
  MakerCheckerRule,
  MakerCheckerUpdateInput,
  PaginationMeta,
} from "@/features/master/maker-checker/types/maker-checker.types";

const DEFAULT_FILTERS: MakerCheckerFilterValues = {
  voucherType: "",
  isActive: "",
};

const SEARCH_DEBOUNCE_MS = 350;

function filtersEqual(
  a: MakerCheckerFilterValues,
  b: MakerCheckerFilterValues,
): boolean {
  return a.voucherType === b.voucherType && a.isActive === b.isActive;
}

export function MakerCheckerView() {
  const t = useTranslations("master.makerChecker");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const pageMeta = masterModulePages.makerChecker.toJSON();

  const [filters, setFilters] =
    useState<MakerCheckerFilterValues>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<MakerCheckerFilterValues>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [items, setItems] = useState<MakerCheckerRule[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [reloadKey, setReloadKey] = useState(0);

  const [roleOptions, setRoleOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [roleNameById, setRoleNameById] = useState<Record<string, string>>({});

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<MakerCheckerRule | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState<number | null>(null);
  const [statusConfirmTarget, setStatusConfirmTarget] =
    useState<MakerCheckerRule | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useToastText();

  useEffect(() => {
    if (filtersEqual(filters, appliedFilters)) return;
    const timer = window.setTimeout(() => {
      setPage(1);
      setAppliedFilters(filters);
      setSuccessMessage(null);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filters, appliedFilters, setSuccessMessage]);

  useEffect(() => {
    let cancelled = false;

    async function loadRoles() {
      try {
        const result = await fetchRoleList({
          page: 1,
          perPage: 200,
          status: 1,
        });
        if (cancelled) return;
        const options = result.items.map((role) => ({
          value: String(role.id),
          label: role.roleName,
        }));
        const names: Record<string, string> = {};
        for (const role of result.items) {
          names[String(role.id)] = role.roleName;
        }
        setRoleOptions(options);
        setRoleNameById(names);
      } catch (err) {
        if (cancelled) return;
        if (isRoleClientError(err) && err.status === 401) {
          router.replace("/login");
          router.refresh();
        }
      }
    }

    void loadRoles();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      setErrorMessage(undefined);
      try {
        const voucherRaw = appliedFilters.voucherType.trim();
        const result = await fetchMakerCheckerList({
          page,
          perPage: pageSize,
          voucherType:
            voucherRaw !== "" && /^\d+$/.test(voucherRaw)
              ? Number(voucherRaw)
              : undefined,
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
        if (isMakerCheckerClientError(err) && err.status === 401) {
          router.replace("/login");
          router.refresh();
          return;
        }
        setError(true);
        setErrorMessage(
          isMakerCheckerClientError(err) ? err.message : tErrors("generic"),
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

  const resolvedRoleOptions = useMemo(() => {
    if (!editing) return roleOptions;
    const id = editing.checkerRoleId;
    if (!id || roleOptions.some((opt) => opt.value === id)) return roleOptions;
    const label = roleNameById[id] ?? id;
    return [{ value: id, label }, ...roleOptions];
  }, [editing, roleNameById, roleOptions]);

  function openCreate() {
    setFormMode("create");
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(rule: MakerCheckerRule) {
    setFormMode("edit");
    setEditing(rule);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleCreate(input: MakerCheckerCreateInput) {
    setSaving(true);
    setFormError(null);
    try {
      await createMakerCheckerRule(input);
      setFormOpen(false);
      setSuccessMessage(t("createSuccess"));
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (isMakerCheckerClientError(err) && err.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      setFormError(
        isMakerCheckerClientError(err) ? err.message : tErrors("generic"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(input: MakerCheckerUpdateInput) {
    setSaving(true);
    setFormError(null);
    try {
      await updateMakerCheckerRule(input);
      setFormOpen(false);
      setEditing(null);
      setSuccessMessage(t("updateSuccess"));
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (isMakerCheckerClientError(err) && err.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      setFormError(
        isMakerCheckerClientError(err) ? err.message : tErrors("generic"),
      );
    } finally {
      setSaving(false);
    }
  }

  function handleToggleStatus(rule: MakerCheckerRule) {
    setStatusConfirmTarget(rule);
  }

  async function executeToggleStatus(rule: MakerCheckerRule) {
    const nextActive = !rule.isActive;
    setStatusBusyId(rule.id);
    setSuccessMessage(null);
    try {
      await updateMakerCheckerRule({
        id: rule.id,
        voucherType: rule.voucherType,
        thresholdLimit: rule.thresholdLimit,
        checkerRoleId: rule.checkerRoleId,
        dualAuthReq: rule.dualAuthReq,
        autoApprv: rule.autoApprv,
        isActive: nextActive,
      });
      setSuccessMessage(
        nextActive ? t("activateSuccess") : t("deactivateSuccess"),
      );
      setReloadKey((key) => key + 1);
    } catch (err) {
      if (isMakerCheckerClientError(err) && err.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      setError(true);
      setErrorMessage(
        isMakerCheckerClientError(err) ? err.message : tErrors("generic"),
      );
    } finally {
      setStatusBusyId(null);
    }
  }

  return (
    <ModulePageShell page={pageMeta}>
      <PageToast message={successMessage} />

      <MakerCheckerFilters
        values={filters}
        onChange={setFilters}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setAppliedFilters(DEFAULT_FILTERS);
          setPage(1);
          setSuccessMessage(null);
        }}
      />

      <MakerCheckerTable
        items={items}
        meta={meta}
        page={page}
        pageSize={pageSize}
        loading={loading}
        error={error}
        errorMessage={errorMessage}
        statusBusyId={statusBusyId}
        roleNameById={roleNameById}
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

      <MakerCheckerForm
        open={formOpen}
        mode={formMode}
        rule={editing}
        saving={saving}
        errorMessage={formError}
        roleOptions={resolvedRoleOptions}
        onClose={() => {
          if (saving) return;
          setFormOpen(false);
          setFormError(null);
        }}
        onSubmitCreate={handleCreate}
        onSubmitUpdate={handleUpdate}
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
        actionType={statusConfirmTarget?.isActive ? "deactivate" : "activate"}
        itemName={
          statusConfirmTarget
            ? t("confirmItemName", {
                voucherType: statusConfirmTarget.voucherType,
              })
            : undefined
        }
        itemType={t("confirmItemType")}
      />
    </ModulePageShell>
  );
}
