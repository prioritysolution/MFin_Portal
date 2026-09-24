"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PageToast } from "@/components/ui/PageToast";
import { Button } from "@/components/ui/Button";
import { CheckRow, DateField, SelectField, TextField } from "@/components/ui/Form";
import {
  staffCreateInputSchema,
  staffUpdateInputSchema,
} from "@/features/master/staff/schemas/staff.schema";
import {
  aadhaarPattern,
  formatIssue,
  mobilePattern,
  normalizeMobile,
  panPattern,
} from "@/lib/validation/formats";
import type {
  DesignationOption,
  ModuleAccessOption,
  Staff,
  StaffCreateInput,
  StaffUpdateInput,
} from "@/features/master/staff/types/staff.types";
import type { Branch } from "@/features/master/branch/types/branch.types";

type StaffFormProps = {
  open: boolean;
  mode: "create" | "edit";
  staff: Staff | null;
  branches: Branch[];
  designations: DesignationOption[];
  modules: ModuleAccessOption[];
  saving: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmitCreate: (input: StaffCreateInput) => Promise<void> | void;
  onSubmitUpdate: (input: StaffUpdateInput) => Promise<void> | void;
};

type FormState = {
  fullName: string;
  shortName: string;
  employeeCode: string;
  branchId: string;
  designationId: string;
  mobile: string;
  email: string;
  joinDate: string;
  aadhaar: string;
  pan: string;
  deviceId: string;
  userName: string;
  userPass: string;
  moduleIds: number[];
  status: number;
};

function toFormState(staff: Staff | null): FormState {
  if (!staff) {
    return {
      fullName: "",
      shortName: "",
      employeeCode: "",
      branchId: "",
      designationId: "",
      mobile: "",
      email: "",
      joinDate: "",
      aadhaar: "",
      pan: "",
      deviceId: "",
      userName: "",
      userPass: "",
      moduleIds: [],
      status: 1,
    };
  }
  return {
    fullName: staff.fullName,
    shortName: staff.shortName ?? "",
    employeeCode: staff.employeeCode,
    branchId: staff.branchId != null ? String(staff.branchId) : "",
    designationId:
      staff.designationId != null ? String(staff.designationId) : "",
    mobile: staff.mobile ?? "",
    email: staff.email ?? "",
    joinDate: staff.joinDate ?? "",
    aadhaar: staff.aadhaar ?? "",
    pan: staff.pan ?? "",
    deviceId: staff.deviceId != null ? String(staff.deviceId) : "",
    userName: "",
    userPass: "",
    moduleIds: staff.moduleAccess.map((item) => item.moduleId),
    status: staff.status,
  };
}

function parseOptionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toWritableFields(form: FormState) {
  return {
    fullName: form.fullName,
    shortName: form.shortName || null,
    employeeCode: form.employeeCode || null,
    branchId: form.branchId ? Number(form.branchId) : null,
    designationId: form.designationId ? Number(form.designationId) : null,
    mobile: form.mobile || null,
    email: form.email || null,
    joinDate: form.joinDate || null,
    aadhaar: form.aadhaar || null,
    pan: form.pan || null,
    deviceId: parseOptionalNumber(form.deviceId),
    moduleIds: form.moduleIds,
    status: form.status,
  };
}

export function StaffForm({
  open,
  mode,
  staff,
  branches,
  designations,
  modules,
  saving,
  errorMessage,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
}: StaffFormProps) {
  const t = useTranslations("master.staff");
  const tUi = useTranslations("ui");
  const formKey = mode === "edit" ? `edit-${staff?.staffId ?? 0}` : "create";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? t("createTitle") : t("editTitle")}
      size="xl"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button type="submit" form="staff-form" icon={Save} disabled={saving}>
            {saving ? t("saving") : t("save")}
          </Button>
        </>
      }
    >
      <StaffFormBody
        key={formKey}
        mode={mode}
        staff={staff}
        branches={branches}
        designations={designations}
        modules={modules}
        errorMessage={errorMessage}
        onSubmitCreate={onSubmitCreate}
        onSubmitUpdate={onSubmitUpdate}
        statusActiveLabel={t("statusActive")}
        statusInactiveLabel={t("statusInactive")}
        selectSearch={tUi("selectSearch")}
        selectEmpty={tUi("selectEmpty")}
        noneLabel={t("fields.none")}
        moduleAccessLabel={t("fields.moduleAccess")}
        fieldLabels={{
          fullName: t("fields.fullName"),
          shortName: t("fields.shortName"),
          employeeCode: t("fields.employeeCode"),
          branchId: t("fields.branch"),
          designationId: t("fields.designation"),
          mobile: t("fields.mobile"),
          email: t("fields.email"),
          joinDate: t("fields.joinDate"),
          aadhaar: t("fields.aadhaar"),
          pan: t("fields.pan"),
          deviceId: t("fields.deviceId"),
          userName: t("fields.userName"),
          userPass: t("fields.userPass"),
          status: t("fields.status"),
        }}
      />
    </Modal>
  );
}

type BodyProps = {
  mode: "create" | "edit";
  staff: Staff | null;
  branches: Branch[];
  designations: DesignationOption[];
  modules: ModuleAccessOption[];
  errorMessage?: string | null;
  onSubmitCreate: (input: StaffCreateInput) => Promise<void> | void;
  onSubmitUpdate: (input: StaffUpdateInput) => Promise<void> | void;
  statusActiveLabel: string;
  statusInactiveLabel: string;
  selectSearch: string;
  selectEmpty: string;
  noneLabel: string;
  moduleAccessLabel: string;
  fieldLabels: {
    fullName: string;
    shortName: string;
    employeeCode: string;
    branchId: string;
    designationId: string;
    mobile: string;
    email: string;
    joinDate: string;
    aadhaar: string;
    pan: string;
    deviceId: string;
    userName: string;
    userPass: string;
    status: string;
  };
};

function staffFieldErrors(
  flat: Record<string, string[] | undefined>,
  translate: (key: "errors.fullName") => string,
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const key of Object.keys(flat)) {
    if (flat[key]?.length) {
      next[key] = translate(`errors.${key}` as "errors.fullName");
    }
  }
  return next;
}

function StaffFormBody({
  mode,
  staff,
  branches,
  designations,
  modules,
  errorMessage,
  onSubmitCreate,
  onSubmitUpdate,
  statusActiveLabel,
  statusInactiveLabel,
  selectSearch,
  selectEmpty,
  noneLabel,
  moduleAccessLabel,
  fieldLabels,
}: BodyProps) {
  const t = useTranslations("master.staff");
  const [form, setForm] = useState<FormState>(() => toFormState(staff));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!errorMessage || !/password/i.test(errorMessage)) return;
    setFieldErrors((prev) => ({ ...prev, userPass: errorMessage }));
  }, [errorMessage]);

  function toggleModule(moduleId: number, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      moduleIds: checked
        ? [...new Set([...prev.moduleIds, moduleId])]
        : prev.moduleIds.filter((id) => id !== moduleId),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    if (mode === "create") {
      const payload: StaffCreateInput = {
        ...toWritableFields(form),
        userName: form.userName,
        userPass: form.userPass,
      };
      const parsed = staffCreateInputSchema.safeParse(payload);
      if (!parsed.success) {
        setFieldErrors(staffFieldErrors(parsed.error.flatten().fieldErrors, t));
        return;
      }
      await onSubmitCreate(parsed.data);
      return;
    }

    if (!staff) return;
    const writable = toWritableFields(form);
    const payload: StaffUpdateInput = {
      ...writable,
      staffId: staff.staffId,
      employeeCode: form.employeeCode.trim() || staff.employeeCode,
    };
    const parsed = staffUpdateInputSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(staffFieldErrors(parsed.error.flatten().fieldErrors, t));
      return;
    }
    await onSubmitUpdate(parsed.data);
  }

  return (
    <form
      id="staff-form"
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-4"
    >
      <PageToast message={errorMessage ?? null} tone="error" />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={fieldLabels.fullName}
          required
          value={form.fullName}
          maxLength={100}
          error={fieldErrors.fullName}
          onChange={(fullName) => setForm((prev) => ({ ...prev, fullName }))}
        />
        <TextField
          label={fieldLabels.shortName}
          value={form.shortName}
          maxLength={50}
          error={fieldErrors.shortName}
          onChange={(shortName) => setForm((prev) => ({ ...prev, shortName }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={fieldLabels.employeeCode}
          value={form.employeeCode}
          maxLength={50}
          error={fieldErrors.employeeCode}
          onChange={(employeeCode) =>
            setForm((prev) => ({ ...prev, employeeCode }))
          }
        />
        <TextField
          label={fieldLabels.deviceId}
          type="number"
          value={form.deviceId}
          error={fieldErrors.deviceId}
          onChange={(deviceId) => setForm((prev) => ({ ...prev, deviceId }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={fieldLabels.branchId}
          value={form.branchId}
          error={fieldErrors.branchId || undefined}
          searchable
          searchPlaceholder={selectSearch}
          emptyMessage={selectEmpty}
          onChange={(branchId) => setForm((prev) => ({ ...prev, branchId }))}
          options={[
            { value: "", label: noneLabel },
            ...branches.map((branch) => ({
              value: String(branch.branchId),
              label: `${branch.branchCode} — ${branch.branchName}`,
            })),
          ]}
        />
        <SelectField
          label={fieldLabels.designationId}
          value={form.designationId}
          error={fieldErrors.designationId || undefined}
          searchable
          searchPlaceholder={selectSearch}
          emptyMessage={selectEmpty}
          onChange={(designationId) =>
            setForm((prev) => ({ ...prev, designationId }))
          }
          options={[
            { value: "", label: noneLabel },
            ...designations.map((item) => ({
              value: String(item.designationId),
              label: item.designationName,
            })),
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={fieldLabels.mobile}
          value={form.mobile}
          maxLength={10}
          inputMode="numeric"
          hint={t("hints.mobile")}
          error={fieldErrors.mobile}
          validate={(value, final) =>
            formatIssue(
              normalizeMobile(value),
              final,
              10,
              mobilePattern,
              t("errors.mobile"),
            )
          }
          onChange={(mobile) => setForm((prev) => ({ ...prev, mobile }))}
        />
        <TextField
          label={fieldLabels.email}
          type="email"
          value={form.email}
          error={fieldErrors.email}
          onChange={(email) => setForm((prev) => ({ ...prev, email }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DateField
          label={fieldLabels.joinDate}
          value={form.joinDate}
          error={fieldErrors.joinDate}
          onChange={(joinDate) => setForm((prev) => ({ ...prev, joinDate }))}
        />
        <SelectField
          label={fieldLabels.status}
          value={String(form.status)}
          error={fieldErrors.status || undefined}
          searchable={false}
          searchPlaceholder={selectSearch}
          emptyMessage={selectEmpty}
          onChange={(status) =>
            setForm((prev) => ({ ...prev, status: Number(status) }))
          }
          options={[
            { value: "1", label: statusActiveLabel },
            { value: "0", label: statusInactiveLabel },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={fieldLabels.aadhaar}
          value={form.aadhaar}
          maxLength={12}
          inputMode="numeric"
          hint={t("hints.aadhaar")}
          error={fieldErrors.aadhaar}
          validate={(value, final) =>
            formatIssue(
              value.replace(/\s/g, ""),
              final,
              12,
              aadhaarPattern,
              t("errors.aadhaar"),
            )
          }
          onChange={(aadhaar) => setForm((prev) => ({ ...prev, aadhaar }))}
        />
        <TextField
          label={fieldLabels.pan}
          value={form.pan}
          maxLength={10}
          restrict="code"
          hint={t("hints.pan")}
          error={fieldErrors.pan}
          validate={(value, final) =>
            formatIssue(value, final, 10, panPattern, t("errors.pan"))
          }
          onChange={(pan) => setForm((prev) => ({ ...prev, pan }))}
        />
      </div>

      {mode === "create" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={fieldLabels.userName}
            required
            value={form.userName}
            maxLength={100}
            autoComplete="off"
            error={fieldErrors.userName}
            onChange={(userName) => setForm((prev) => ({ ...prev, userName }))}
          />
          <TextField
            label={fieldLabels.userPass}
            required
            type="password"
            value={form.userPass}
            maxLength={128}
            hint={t("hints.userPass")}
            autoComplete="new-password"
            error={fieldErrors.userPass}
            validate={(value, final) => {
              if (!final || value) return undefined;
              return t("errors.userPass");
            }}
            onChange={(userPass) => setForm((prev) => ({ ...prev, userPass }))}
          />
        </div>
      ) : null}

      {modules.length > 0 ? (
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold text-slate-600">
            {moduleAccessLabel}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {modules.map((mod) => (
              <CheckRow
                key={mod.moduleId}
                label={mod.moduleLabel}
                checked={form.moduleIds.includes(mod.moduleId)}
                onChange={(checked) => toggleModule(mod.moduleId, checked)}
              />
            ))}
          </div>
        </fieldset>
      ) : null}
    </form>
  );
}
