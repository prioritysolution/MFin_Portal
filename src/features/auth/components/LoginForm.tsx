"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { AuthLanguageSelect, authFieldClass } from "@/features/auth/components/AuthShell";
import { Link, useRouter } from "@/i18n/navigation";
import { endpoints } from "@/lib/api/endpoints";
import { clearMenuClientCache } from "@/features/navigation/services/menu-client";

export function LoginForm() {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const login = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const response = await fetch(endpoints.auth.login, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ login, password }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || payload.success === false) {
        setError(payload.message || t("invalidCredentials"));
        return;
      }

      // remember flag reserved for future device preference; session uses httpOnly cookie.
      void remember;
      // Full login payload (token + user + roleId) is already sealed server-side in the
      // AUTH_SESSION cookie by /api/auth/login — do not store token in localStorage.
      // Soft replace keeps Network log; avoid refresh() (it remounts Sidebar → 2nd menu call).
      clearMenuClientCache();
      router.replace("/");
      return;
    } catch {
      setError(tErrors("network"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthLanguageSelect />

      <label className="auth-field-group block text-sm">
        <span className="auth-label mb-1.5 block font-medium text-slate-700">
          {t("username")}
        </span>
        <input
          type="text"
          name="username"
          required
          autoComplete="username"
          placeholder={t("usernamePlaceholder")}
          className={authFieldClass}
        />
      </label>

      <label className="auth-field-group block text-sm">
        <span className="auth-label mb-1.5 block font-medium text-slate-700">
          {t("password")}
        </span>
        <span className="relative block">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            className={`${authFieldClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 end-3 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </span>
      </label>

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5 text-sm">
        <label className="inline-flex items-center gap-2.5 text-slate-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.currentTarget.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
          />
          {t("rememberDevice")}
        </label>
        <Link
          href="/forgot-password"
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          {t("forgotPassword")}
        </Link>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary mt-1 w-full justify-center gap-2 py-3.5 text-[0.9375rem] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.55)]"
      >
        <LogIn className="h-4 w-4" />
        {submitting ? t("signingIn") : t("signIn")}
      </button>

      <p className="text-center text-sm text-slate-500">
        {t("newStaffUser")}{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-ink hover:underline"
        >
          {t("registerAccount")}
        </Link>
      </p>
    </form>
  );
}
