"use client";

import { Headset } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const SUPPORT_DESK_HREF = "/support/my-tickets";

type SupportDeskLinkProps = {
  className?: string;
  variant?: "icon" | "menu";
};

export function SupportDeskLink({
  className = "",
  variant = "icon",
}: SupportDeskLinkProps) {
  const t = useTranslations("navigation");
  const label = t("supportDesk");

  if (variant === "menu") {
    return (
      <Link
        href={SUPPORT_DESK_HREF}
        role="menuitem"
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-surface-muted ${className}`.trim()}
      >
        <Headset className="h-4 w-4 text-muted-soft" aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={SUPPORT_DESK_HREF}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-slate-600 shadow-sm transition hover:bg-surface-muted ${className}`.trim()}
    >
      <Headset className="h-4 w-4" aria-hidden />
    </Link>
  );
}
