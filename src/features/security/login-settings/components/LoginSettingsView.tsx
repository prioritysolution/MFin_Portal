"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { ModulePageShell } from "@/components/shared/ModulePageShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckboxField, TextField } from "@/components/ui/Form";
import { securityModulePages } from "@/lib/modules/module.types";
import { loginSecurityDraftSchema } from "@/features/security/login-settings/schemas/login-settings.schema";
import {
  LOGIN_SECURITY_DEFAULTS,
  type LoginSecurityDraft,
} from "@/features/security/login-settings/types/login-settings.types";

function readNumber(raw: string, fallback: number): number {
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function LoginSettingsView() {
  const t = useTranslations("security.loginSettings");
  const pageMeta = securityModulePages.loginSettings.toJSON();
  const [form, setForm] = useState<LoginSecurityDraft>(LOGIN_SECURITY_DEFAULTS);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  function update<K extends keyof LoginSecurityDraft>(
    key: K,
    value: LoginSecurityDraft[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    const parsed = loginSecurityDraftSchema.safeParse(form);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: Record<string, string> = {};
      for (const key of Object.keys(flat)) {
        next[key] = t(`errors.${key}` as "errors.maxAttempts");
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    setForm(parsed.data);
    setNotice(t("validatedNotice"));
  }

  return (
    <ModulePageShell page={pageMeta}>
      <Alert tone="info">{t("pendingApi")}</Alert>
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <form id="login-settings-form" onSubmit={handleSubmit}>
        <Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card
              className="bg-surface-muted shadow-none"
              title={t("attempts.title")}
              description={t("attempts.description")}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label={t("attempts.maxAttempts")}
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={form.maxAttempts}
                  hint={t("attempts.maxAttemptsHint")}
                  error={fieldErrors.maxAttempts}
                  onChange={(value) =>
                    update("maxAttempts", readNumber(value, form.maxAttempts))
                  }
                />
                <TextField
                  label={t("attempts.lockMinutes")}
                  type="number"
                  min={1}
                  max={1440}
                  required
                  value={form.lockMinutes}
                  hint={t("attempts.lockMinutesHint")}
                  error={fieldErrors.lockMinutes}
                  onChange={(value) =>
                    update("lockMinutes", readNumber(value, form.lockMinutes))
                  }
                />
                <TextField
                  label={t("attempts.dailyResetTime")}
                  type="time"
                  required
                  value={form.dailyResetTime}
                  hint={t("attempts.dailyResetTimeHint")}
                  error={fieldErrors.dailyResetTime}
                  onChange={(value) => update("dailyResetTime", value)}
                />
              </div>
            </Card>

            <Card
              className="bg-surface-muted shadow-none"
              title={t("password.title")}
              description={t("password.description")}
            >
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label={t("password.minLength")}
                    type="number"
                    min={6}
                    max={64}
                    required
                    value={form.minLength}
                    hint={t("password.minLengthHint")}
                    error={fieldErrors.minLength}
                    onChange={(value) =>
                      update("minLength", readNumber(value, form.minLength))
                    }
                  />
                  <TextField
                    label={t("password.maxLength")}
                    type="number"
                    min={6}
                    max={128}
                    required
                    value={form.maxLength}
                    hint={t("password.maxLengthHint")}
                    error={fieldErrors.maxLength}
                    onChange={(value) =>
                      update("maxLength", readNumber(value, form.maxLength))
                    }
                  />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-600">
                    {t("password.complexity")}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <CheckboxField
                      label={t("password.requireUppercase")}
                      checked={form.requireUppercase}
                      onChange={(checked) => update("requireUppercase", checked)}
                    />
                    <CheckboxField
                      label={t("password.requireLowercase")}
                      checked={form.requireLowercase}
                      onChange={(checked) => update("requireLowercase", checked)}
                    />
                    <CheckboxField
                      label={t("password.requireDigit")}
                      checked={form.requireDigit}
                      onChange={(checked) => update("requireDigit", checked)}
                    />
                    <CheckboxField
                      label={t("password.requireSpecial")}
                      checked={form.requireSpecial}
                      onChange={(checked) => update("requireSpecial", checked)}
                    />
                  </div>
                </div>

                <TextField
                  label={t("password.uniquePasswordCount")}
                  type="number"
                  min={0}
                  max={24}
                  required
                  value={form.uniquePasswordCount}
                  hint={t("password.uniquePasswordCountHint")}
                  error={fieldErrors.uniquePasswordCount}
                  onChange={(value) =>
                    update(
                      "uniquePasswordCount",
                      readNumber(value, form.uniquePasswordCount),
                    )
                  }
                />

                <CheckboxField
                  label={t("password.expirationEnabled")}
                  checked={form.expirationEnabled}
                  onChange={(checked) => update("expirationEnabled", checked)}
                />
                {form.expirationEnabled ? (
                  <TextField
                    label={t("password.expirationDays")}
                    type="number"
                    min={1}
                    max={365}
                    required
                    value={form.expirationDays}
                    hint={t("password.expirationDaysHint")}
                    error={fieldErrors.expirationDays}
                    onChange={(value) =>
                      update(
                        "expirationDays",
                        readNumber(value, form.expirationDays),
                      )
                    }
                  />
                ) : null}
              </div>
            </Card>
          </div>

          <div className="btn-actions mt-5 border-t border-border pt-4">
            <Button type="submit" icon={Save}>
              {t("save")}
            </Button>
          </div>
        </Card>
      </form>
    </ModulePageShell>
  );
}
