"use client";

import { useEffect, useState } from "react";
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

type TabConfig = {
  id: PanelId;
  title: string;
  bangla: string;
  icon: typeof Layers;
};

const tabs: TabConfig[] = [
  {
    id: "categories",
    title: "Account Categories",
    bangla: "অ্যাকাউন্ট ক্যাটাগরি",
    icon: Layers,
  },
  {
    id: "heads",
    title: "Account Heads",
    bangla: "অ্যাকাউন্ট মেইন হেড",
    icon: Tag,
  },
  {
    id: "ledgers",
    title: "Account Ledgers",
    bangla: "অ্যাকাউন্ট লেজার",
    icon: BookOpen,
  },
  {
    id: "subledgers",
    title: "Account Sub-Ledgers",
    bangla: "অ্যাকাউন্ট সাব-লেজার",
    icon: GitBranch,
  },
  {
    id: "branches",
    title: "Subledger Branches",
    bangla: "সাব-লেজার শাখা",
    icon: GitFork,
  },
];

function resolveInitialTab(initialTab?: string): PanelId {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam) {
      if (tabParam === "sub-ledger") return "subledgers";
      if (tabs.some((t) => t.id === tabParam)) {
        return tabParam as PanelId;
      }
    }
  }
  if (initialTab) {
    if (initialTab === "sub-ledger") return "subledgers";
    if (tabs.some((t) => t.id === initialTab)) {
      return initialTab as PanelId;
    }
  }
  return "categories";
}

export type CoaTreeViewProps = {
  initialTab?: string;
};

export function CoaTreeView({
  initialTab = "categories",
}: CoaTreeViewProps = {}) {
  const [activeTab, setActiveTab] = useState<PanelId>(() =>
    resolveInitialTab(initialTab),
  );

  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        const normalized = tabParam === "sub-ledger" ? "subledgers" : tabParam;
        if (tabs.some((t) => t.id === normalized)) {
          setActiveTab(normalized as PanelId);
        }
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function handleSelectTab(id: PanelId) {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", id);
      window.history.replaceState(null, "", url.toString());
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      {/* Horizontal Card Menu */}
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
                  : "border-border bg-surface-muted text-slate-600 hover:border-brand/30 hover:bg-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${active ? "text-white" : "text-slate-500"}`}
              />
              <span className="text-xs font-semibold leading-snug">
                {tab.title}
              </span>
              <span
                className={`text-[11px] leading-snug ${
                  active ? "text-white/80" : "text-muted"
                }`}
              >
                {tab.bangla}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Module Panel Content */}
      {activeTab === "categories" ? <AcctCategoryView embedded /> : null}
      {activeTab === "heads" ? <AcctHeadView embedded /> : null}
      {activeTab === "ledgers" ? <AcctLedgerView embedded /> : null}
      {activeTab === "subledgers" ? <AcctSubledgerView embedded /> : null}
      {activeTab === "branches" ? <AcctSubledgerBranchView embedded /> : null}
    </div>
  );
}

export { CoaTreeView as AccountLedgerSetupView };
