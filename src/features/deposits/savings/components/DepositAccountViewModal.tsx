"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutList, PenLine, UserRound, Users } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { SectionTabs } from "@/components/shared/SectionTabs";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { parseYmd } from "../deposit-account.rules";
import type { DepositAccount } from "../types/deposit-account.types";

type PanelId = "overview" | "nominees" | "signatories" | "transactions";

type DepositAccountViewModalProps = {
  account: DepositAccount | null;
  onClose: () => void;
};

function statusTone(statusCd: number): BadgeTone {
  if (statusCd === 1) return "success";
  if (statusCd === 7) return "warning";
  if (statusCd === 4) return "danger";
  if (statusCd === 5 || statusCd === 6) return "amber";
  return "neutral";
}

function formatDate(
  format: ReturnType<typeof useFormatter>,
  value: string | null,
  dash: string,
) {
  if (!value) return dash;
  const parsed = parseYmd(value);
  if (!parsed) return dash;
  return format.dateTime(parsed, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function DepositAccountViewModal({
  account,
  onClose,
}: DepositAccountViewModalProps) {
  const t = useTranslations("deposits.savings");
  const format = useFormatter();
  const [tab, setTab] = useState<PanelId>("overview");

  useEffect(() => {
    setTab("overview");
  }, [account?.accountId]);

  const tabs = useMemo(
    () => [
      { id: "overview" as const, title: t("view.overview"), icon: LayoutList },
      {
        id: "nominees" as const,
        title: t("view.nominees", { count: account?.nomineeCount ?? 0 }),
        icon: UserRound,
      },
      {
        id: "signatories" as const,
        title: t("view.signatories", { count: account?.signatoryCount ?? 0 }),
        icon: Users,
      },
      {
        id: "transactions" as const,
        title: t("view.transactions"),
        icon: PenLine,
      },
    ],
    [account?.nomineeCount, account?.signatoryCount, t],
  );

  return (
    <Modal
      open={account != null}
      onClose={onClose}
      title={account?.holderName || t("view.title")}
      subtitle={
        account
          ? t("view.subtitle", {
              applNo: account.applNo || t("dash"),
              accountNo:
                account.accountNo != null
                  ? String(account.accountNo)
                  : t("dash"),
            })
          : undefined
      }
      size="lg"
    >
      {account ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={account.isClosed ? "neutral" : statusTone(account.statusCd)} caps={false}>
              {account.isClosed ? t("closed") : account.statusDesc || t("dash")}
            </Badge>
            {account.currentBalance != null ? (
              <p className="text-lg font-semibold tabular-nums text-slate-900">
                {format.number(account.currentBalance, {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            ) : (
              <p className="text-sm text-muted">{t("view.noAccountYet")}</p>
            )}
          </div>

          {account.nomRegd && account.nomineeCount === 0 ? (
            <Alert tone="warning">{t("view.nomineeWarning")}</Alert>
          ) : null}

          <SectionTabs
            tabs={tabs}
            activeId={tab}
            onChange={setTab}
            label={t("view.title")}
          />

          {tab === "overview" ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <Fact label={t("view.scheme")} value={account.schemeName || t("dash")} />
              <Fact
                label={t("view.type")}
                value={account.depositTypeDesc || t("dash")}
              />
              <Fact
                label={t("view.roi")}
                value={
                  account.schemeRoiPercent == null
                    ? t("dash")
                    : t("roiPercent", {
                        value: format.number(account.schemeRoiPercent, {
                          maximumFractionDigits: 2,
                        }),
                      })
                }
              />
              <Fact
                label={t("view.category")}
                value={account.specialCatgDesc || t("dash")}
              />
              <Fact label={t("view.mode")} value={account.opModeDesc || t("dash")} />
              <Fact
                label={t("view.primary")}
                value={
                  [account.primaryName, account.primaryRefCode]
                    .filter(Boolean)
                    .join(" · ") || t("dash")
                }
              />
              <Fact
                label={t("view.jointHolder")}
                value={
                  [account.joint1Name, account.joint2Name].filter(Boolean).join(" · ") ||
                  t("dash")
                }
              />
              <Fact
                label={t("view.branch")}
                value={
                  [account.branchCode, account.branchName].filter(Boolean).join(" · ") ||
                  t("dash")
                }
              />
              <Fact
                label={t("view.fieldOfficer")}
                value={
                  [account.foName, account.foCode].filter(Boolean).join(" · ") ||
                  t("dash")
                }
              />
              <Fact
                label={t("view.applDate")}
                value={formatDate(format, account.applDate, t("dash"))}
              />
              <Fact
                label={t("view.createdBy")}
                value={
                  [account.createdByName, formatDate(format, account.createdAt, "")]
                    .filter(Boolean)
                    .join(" · ") || t("dash")
                }
              />
              {account.isClosed ? (
                <Fact
                  label={t("view.closeReason")}
                  value={
                    [account.closingReason, formatDate(format, account.closingDate, "")]
                      .filter(Boolean)
                      .join(" · ") || t("dash")
                  }
                />
              ) : null}
            </dl>
          ) : null}

          {tab === "nominees" ? (
            <p className="text-sm text-muted">
              {t("view.nomineesEmpty", { count: account.nomineeCount })}
            </p>
          ) : null}
          {tab === "signatories" ? (
            <p className="text-sm text-muted">
              {t("view.signatoriesEmpty", { count: account.signatoryCount })}
            </p>
          ) : null}
          {tab === "transactions" ? (
            <p className="text-sm text-muted">{t("view.transactionsEmpty")}</p>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-slate-600">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{value}</dd>
    </div>
  );
}
