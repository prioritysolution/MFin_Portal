"use client";

import type { ReactNode } from "react";
import { CloudOff, RefreshCw, ServerCrash } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

type ErrorStateProps = {
  title?: string;
  message?: string;
  action?: ReactNode;
  onRetry?: () => void;
  className?: string;
};

function isConnectivityError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("timeout") ||
    lower.includes("network") ||
    lower.includes("timed out") ||
    lower.includes("connection") ||
    lower.includes("unreachable") ||
    lower.includes("offline") ||
    lower.includes("failed to fetch") ||
    lower.includes("fetch failed") ||
    lower.includes("econnrefused") ||
    lower.includes("server off") ||
    lower.includes("abort")
  );
}

export function ErrorState({
  title,
  message,
  action,
  onRetry,
  className = "",
}: ErrorStateProps) {
  const t = useTranslations("ui");
  const tCommon = useTranslations("common");
  const resolvedTitle = title ?? t("errorTitle");
  const resolvedMessage = message ?? t("errorMessage");
  const connectivity = isConnectivityError(resolvedMessage);
  const Icon = connectivity ? CloudOff : ServerCrash;

  return (
    <div
      role="alert"
      className={`error-state flex w-full items-center justify-center px-4 py-8 text-center sm:py-10 ${className}`.trim()}
    >
      <div className="error-state-card relative w-full max-w-md overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50/40 via-surface to-surface p-6 shadow-[0_12px_32px_-12px_rgba(244,63,94,0.18)] sm:p-7 dark:border-rose-900/50 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900">
        <div className="error-state-sheen pointer-events-none absolute inset-0" aria-hidden />
        <div className="error-state-blob error-state-blob--one pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full bg-rose-100/60 blur-2xl dark:bg-rose-900/20" aria-hidden />
        <div className="error-state-blob error-state-blob--two pointer-events-none absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-rose-50/80 blur-2xl dark:bg-rose-950/30" aria-hidden />

        <div className="error-state-icon-wrap relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center">
          <span className="error-state-wave error-state-wave--1 absolute inset-0 rounded-full" aria-hidden />
          <span className="error-state-wave error-state-wave--2 absolute inset-0 rounded-full" aria-hidden />
          <span className="error-state-wave error-state-wave--3 absolute inset-0 rounded-full" aria-hidden />
          <span className="error-state-orbit absolute inset-[0.25rem]" aria-hidden />
          <span className="error-state-glow absolute inset-4 rounded-full bg-rose-200/50 blur-[3px] dark:bg-rose-800/30" aria-hidden />
          <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-[0_4px_14px_-4px_rgba(244,63,94,0.45)] ring-1 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:ring-rose-800/60">
            <Icon
              className="error-state-icon h-6 w-6"
              aria-hidden="true"
              strokeWidth={1.75}
            />
          </span>
          <span className="error-state-dot error-state-dot--a absolute" aria-hidden />
          <span className="error-state-dot error-state-dot--b absolute" aria-hidden />
          <span className="error-state-dot error-state-dot--c absolute" aria-hidden />
        </div>

        <div className="error-state-copy relative z-10 space-y-2">
          <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {resolvedTitle}
          </p>
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted sm:text-sm dark:text-slate-400">
            {resolvedMessage}
          </p>
          <div className="pt-1">
            <span className="error-state-status inline-flex items-center gap-1.5 rounded-full border border-rose-200/70 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-rose-700 uppercase dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
              <span className="error-state-status-dot h-1.5 w-1.5 rounded-full bg-rose-500" />
              {connectivity ? t("errorOfflineHint") : t("errorServerHint")}
            </span>
          </div>
        </div>

        <div className="error-state-action relative z-10 mt-5">
          {action ? (
            action
          ) : onRetry ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="error-state-retry min-w-[7.5rem] border-rose-200 bg-white font-medium text-rose-700 shadow-xs hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-800/60 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
              icon={RefreshCw}
              onClick={onRetry}
            >
              {tCommon("retry")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
