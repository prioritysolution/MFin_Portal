"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Banknote, Landmark } from "lucide-react";
import { DataPage } from "@/components/shared/DataPage";
import { PageToast, useToastText } from "@/components/ui/PageToast";
import { fetchAcctLedgerList } from "@/features/master/acct-ledger";
import { fetchApplOptions } from "@/features/master/appl-options";
import type { ApplOption } from "@/features/master/appl-options";
import type { AcctLedger } from "@/features/master/acct-ledger/types/acct-ledger.types";
import { masterModulePages } from "@/lib/modules/module.types";
import { ChargesSetupSection } from "./ChargesSetupSection";
import {
  CHARGE_FIGURE_OPT_GRP_ID,
  DEPOSIT_CHARGES_DURING_OPT_GRP_ID,
  LOAN_CHARGES_DURING_OPT_GRP_ID,
} from "../constants";

type PanelId = "deposit" | "loan";

const TAB_IDS: PanelId[] = ["deposit", "loan"];

function normalizeTab(value: string | null | undefined): PanelId | null {
  if (!value) return null;
  if (TAB_IDS.includes(value as PanelId)) return value as PanelId;
  return null;
}

export function ChargesSetupView() {
  const t = useTranslations("master.chargesSetup");
  const pageMeta = useMemo(() => masterModulePages.chargesSetup.toJSON(), []);
  const [optionsError, setOptionsError] = useToastText();

  const [activeTab, setActiveTab] = useState<PanelId>("deposit");

  const [figureOptions, setFigureOptions] = useState<ApplOption[]>([]);
  const [depositDuringOptions, setDepositDuringOptions] = useState<
    ApplOption[]
  >([]);
  const [loanDuringOptions, setLoanDuringOptions] = useState<ApplOption[]>([]);
  const [ledgers, setLedgers] = useState<AcctLedger[]>([]);

  const tabs = useMemo(
    () => [
      { id: "deposit" as const, title: t("tabs.deposit"), icon: Banknote },
      { id: "loan" as const, title: t("tabs.loan"), icon: Landmark },
    ],
    [t],
  );

  useEffect(() => {
    const fromUrl = normalizeTab(
      new URLSearchParams(window.location.search).get("tab"),
    );
    if (fromUrl) setActiveTab(fromUrl);

    function onPopState() {
      const next = normalizeTab(
        new URLSearchParams(window.location.search).get("tab"),
      );
      if (next) setActiveTab(next);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      const [figure, depositDuring, loanDuring, ledgerResult] =
        await Promise.allSettled([
          fetchApplOptions(CHARGE_FIGURE_OPT_GRP_ID),
          fetchApplOptions(DEPOSIT_CHARGES_DURING_OPT_GRP_ID),
          fetchApplOptions(LOAN_CHARGES_DURING_OPT_GRP_ID),
          fetchAcctLedgerList({ isActive: 1, perPage: 200 }),
        ]);

      if (cancelled) return;

      if (figure.status === "fulfilled") setFigureOptions(figure.value);
      if (depositDuring.status === "fulfilled") {
        setDepositDuringOptions(depositDuring.value);
      }
      if (loanDuring.status === "fulfilled") {
        setLoanDuringOptions(loanDuring.value);
      }
      if (ledgerResult.status === "fulfilled") {
        setLedgers(ledgerResult.value.items);
      }

      const failed = [figure, depositDuring, loanDuring, ledgerResult].some(
        (result) => result.status === "rejected",
      );
      if (failed) {
        setOptionsError(t("optionsError"));
      }
    }

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [setOptionsError, t]);

  function handleSelectTab(id: PanelId) {
    setActiveTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url.toString());
  }

  return (
    <DataPage page={pageMeta}>
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        <PageToast message={optionsError} tone="error" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                aria-pressed={active}
                className={`flex flex-col items-start gap-1.5 rounded-2xl border px-3.5 py-3 text-left transition ${
                  active
                    ? "border-brand bg-brand text-white shadow-sm"
                    : "border-border bg-surface-muted text-slate-600 hover:border-brand/30 hover:bg-surface"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${active ? "text-white" : "text-slate-500"}`}
                />
                <span className="text-xs font-semibold leading-snug">
                  {tab.title}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === "deposit" ? (
          <ChargesSetupSection
            kind="deposit"
            figureOptions={figureOptions}
            duringOptions={depositDuringOptions}
            ledgers={ledgers}
          />
        ) : (
          <ChargesSetupSection
            kind="loan"
            figureOptions={figureOptions}
            duringOptions={loanDuringOptions}
            ledgers={ledgers}
          />
        )}
      </div>
    </DataPage>
  );
}
