"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, GitBranch, GitFork, Layers, Tag } from "lucide-react";
import { AcctCategoryView } from "@/features/master/acct-category";
import { AcctHeadView } from "@/features/master/acct-head";
import { AcctLedgerView } from "@/features/master/acct-ledger";
import { AcctSubledgerView } from "@/features/master/acct-subledger";
import { AcctSubledgerBranchView } from "@/features/master/acct-subledger-branch";

export type PanelId =
  | "categories"
  | "heads"
  | "ledgers"
  | "subledgers"
  | "branches";

const TAB_IDS: PanelId[] = [
  "categories",
  "heads",
  "ledgers",
  "subledgers",
  "branches",
];

function normalizeTab(value: string | null | undefined): PanelId | null {
  if (!value) return null;
  if (value === "sub-ledger") return "subledgers";
  if (TAB_IDS.includes(value as PanelId)) return value as PanelId;
  return null;
}

export type CoaTreeViewProps = {
  initialTab?: string;
};

export function CoaTreeView({
  initialTab = "categories",
}: CoaTreeViewProps = {}) {
  const tCategory = useTranslations("master.acctCategory");
  const tHead = useTranslations("master.acctHead");
  const tLedger = useTranslations("master.acctLedger");
  const tSubledger = useTranslations("master.acctSubledger");
  const tBranch = useTranslations("master.acctSubledgerBranch");

  const tabs = useMemo(
    () => [
      { id: "categories" as const, title: tCategory("title"), icon: Layers },
      { id: "heads" as const, title: tHead("title"), icon: Tag },
      { id: "ledgers" as const, title: tLedger("title"), icon: BookOpen },
      {
        id: "subledgers" as const,
        title: tSubledger("title"),
        icon: GitBranch,
      },
      { id: "branches" as const, title: tBranch("title"), icon: GitFork },
    ],
    [tBranch, tCategory, tHead, tLedger, tSubledger],
  );

  const [activeTab, setActiveTab] = useState<PanelId>(
    () => normalizeTab(initialTab) ?? "categories",
  );

  // Sync from URL only after mount — never during useState (avoids hydration mismatch).
  useEffect(() => {
    const fromUrl = normalizeTab(
      new URLSearchParams(window.location.search).get("tab"),
    );
    if (fromUrl && fromUrl !== activeTab) {
      setActiveTab(fromUrl);
    }

    function onPopState() {
      const tabParam = new URLSearchParams(window.location.search).get("tab");
      const next = normalizeTab(tabParam);
      if (next) setActiveTab(next);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // Intentionally run once on mount for URL sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only URL hydration
  }, []);

  function handleSelectTab(id: PanelId) {
    setActiveTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url.toString());
  }

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id)}
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

      {activeTab === "categories" ? <AcctCategoryView embedded /> : null}
      {activeTab === "heads" ? <AcctHeadView embedded /> : null}
      {activeTab === "ledgers" ? <AcctLedgerView embedded /> : null}
      {activeTab === "subledgers" ? <AcctSubledgerView embedded /> : null}
      {activeTab === "branches" ? <AcctSubledgerBranchView embedded /> : null}
    </div>
  );
}

export { CoaTreeView as AccountLedgerSetupView };
