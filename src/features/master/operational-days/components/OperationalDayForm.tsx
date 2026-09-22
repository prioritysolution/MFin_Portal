"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  CheckboxField,
  SelectField,
  TextField,
} from "@/components/ui/Form";
import {
  operationalDayCreateInputSchema,
  operationalDayUpdateInputSchema,
} from "@/features/master/operational-days/schemas/operational-days.schema";
import type {
  OperationalDay,
  OperationalDayCreateInput,
  OperationalDayUpdateInput,
} from "@/features/master/operational-days/types/operational-days.types";

type Option = { value: string; label: string };

type OperationalDayFormProps = {
  open: boolean;
  mode: "create" | "edit";
  day: OperationalDay | null;
  branchOptions: Option[];
  dayOptions: Option[];
  saving: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onCreate: (input: OperationalDayCreateInput) => Promise<void> | void;
  onUpdate: (input: OperationalDayUpdateInput) => Promise<void> | void;
};

type FormState = {
  branchId: string;
  dayOfWeek: string;
  isOperational: boolean;
  isHalfDay: boolean;
  openTime: string;
  closeTime: string;
  isActive: boolean;
};

function toFormState(
  day: OperationalDay | null,
  defaultBranchId: string,
): FormState {
  if (!day) {
    return {
      branchId: defaultBranchId,
      dayOfWeek: "1",
      isOperational: true,
      isHalfDay: false,
      openTime: "09:00",
      closeTime: "18:00",
      isActive: true,
    };
  }
  return {
    branchId: String(day.branchId),
    dayOfWeek: String(day.dayOfWeek),
    isOperational: day.isOperational,
    isHalfDay: day.isHalfDay,
    openTime: day.openTime ?? "",
    closeTime: day.closeTime ?? "",
    isActive: day.isActive,
  };
}

export function OperationalDayForm({
  open,
  mode,
  day,
  branchOptions,
  dayOptions,
  saving,
  errorMessage,
  onClose,
  onCreate,
  onUpdate,
}: OperationalDayFormProps) {
  const t = useTranslations("master.operationalDays");
  const formKey = mode === "edit" ? `edit-${day?.recId ?? 0}` : "create";
  const defaultBranchId = branchOptions[0]?.value ?? "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? t("createTitle") : t("editTitle")}
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="operational-day-form"
            icon={Save}
            disabled={saving}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </>
      }
    >
      <OperationalDayFormBody
        key={formKey}
        mode={mode}
        day={day}
        branchOptions={branchOptions}
        dayOptions={dayOptions}
        defaultBranchId={defaultBranchId}
        errorMessage={errorMessage}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />
    </Modal>
  );
}

function OperationalDayFormBody({
  mode,
  day,
  branchOptions,
  dayOptions,
  defaultBranchId,
  errorMessage,
  onCreate,
  onUpdate,
}: {
  mode: "create" | "edit";
  day: OperationalDay | null;
  branchOptions: Option[];
  dayOptions: Option[];
  defaultBranchId: string;
  errorMessage?: string | null;
  onCreate: (input: OperationalDayCreateInput) => Promise<void> | void;
  onUpdate: (input: OperationalDayUpdateInput) => Promise<void> | void;
}) {
  const t = useTranslations("master.operationalDays");
  const tUi = useTranslations("ui");
  const [form, setForm] = useState<FormState>(() =>
    toFormState(day, defaultBranchId),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function normalizeTime(value: string): string {
    const trimmed = value.trim();
    if (/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(trimmed)) {
      return trimmed.slice(0, 5);
    }
    return trimmed;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const branchId = Number(form.branchId);
    const dayOfWeek = Number(form.dayOfWeek);
    const openTime = normalizeTime(form.openTime);
    const closeTime = normalizeTime(form.closeTime);
    const base = {
      branchId: Number.isFinite(branchId) ? branchId : 0,
      dayOfWeek: Number.isFinite(dayOfWeek) ? dayOfWeek : 0,
      isOperational: form.isOperational,
      isHalfDay: form.isHalfDay,
      openTime: openTime || null,
      closeTime: closeTime || null,
      isActive: form.isActive,
    };

    if (mode === "edit" && day) {
      const payload: OperationalDayUpdateInput = {
        ...base,
        recId: day.recId,
      };
      const parsed = operationalDayUpdateInputSchema.safeParse(payload);
      if (!parsed.success) {
        const flat = parsed.error.flatten().fieldErrors;
        setFieldErrors({
          branchId: flat.branchId?.[0] ?? "",
          dayOfWeek: flat.dayOfWeek?.[0] ?? "",
          openTime: flat.openTime?.[0] ?? "",
          closeTime: flat.closeTime?.[0] ?? "",
        });
        return;
      }
      await onUpdate(parsed.data);
      return;
    }

    const parsed = operationalDayCreateInputSchema.safeParse(base);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        branchId: flat.branchId?.[0] ?? "",
        dayOfWeek: flat.dayOfWeek?.[0] ?? "",
        openTime: flat.openTime?.[0] ?? "",
        closeTime: flat.closeTime?.[0] ?? "",
      });
      return;
    }
    await onCreate(parsed.data);
  }

  return (
    <form
      id="operational-day-form"
      className="space-y-4"
      onSubmit={(e) => void handleSubmit(e)}
    >
      {errorMessage ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <SelectField
        label={t("fields.branch")}
        value={form.branchId}
        required
        searchable
        placeholder={t("fields.branchPlaceholder")}
        searchPlaceholder={tUi("selectSearch")}
        emptyMessage={tUi("selectEmpty")}
        error={fieldErrors.branchId || undefined}
        onChange={(branchId) => updateField("branchId", branchId)}
        options={branchOptions}
      />

      <SelectField
        label={t("fields.dayOfWeek")}
        value={form.dayOfWeek}
        required
        searchable={false}
        placeholder={t("fields.dayOfWeekPlaceholder")}
        searchPlaceholder={tUi("selectSearch")}
        emptyMessage={tUi("selectEmpty")}
        error={fieldErrors.dayOfWeek || undefined}
        onChange={(dayOfWeek) => updateField("dayOfWeek", dayOfWeek)}
        options={dayOptions}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label={t("fields.openTime")}
          type="time"
          value={form.openTime}
          hint={t("hints.time")}
          error={fieldErrors.openTime || undefined}
          onChange={(value) => updateField("openTime", normalizeTime(value))}
        />
        <TextField
          label={t("fields.closeTime")}
          type="time"
          value={form.closeTime}
          hint={t("hints.time")}
          error={fieldErrors.closeTime || undefined}
          onChange={(value) => updateField("closeTime", normalizeTime(value))}
        />
      </div>

      <CheckboxField
        label={t("fields.isOperational")}
        checked={form.isOperational}
        onChange={(checked) => updateField("isOperational", checked)}
      />
      <CheckboxField
        label={t("fields.isHalfDay")}
        checked={form.isHalfDay}
        onChange={(checked) => updateField("isHalfDay", checked)}
      />
      <CheckboxField
        label={t("fields.isActive")}
        checked={form.isActive}
        onChange={(checked) => updateField("isActive", checked)}
      />
    </form>
  );
}
