"use client";

import { useMemo, useState } from "react";
import { Banknote, Calculator, Search } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InterestPostingModal } from "@/features/deposits/components/DepositModals";
import {
  depositAccounts,
  formatInr,
  metricToneClass,
} from "@/features/deposits/components/deposits-data";

export function DepositsInterestView() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      depositAccounts
        .filter((row) => row.status === "Active")
        .map((row) => ({
          ...row,
          monthlyInterest:
            Math.round(((row.balance * row.rate) / 100 / 12) * 100) / 100,
        })),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.account.toLowerCase().includes(q) ||
        row.member.toLowerCase().includes(q),
    );
  }, [query, rows]);

  const totalInterest = rows.reduce((sum, row) => sum + row.monthlyInterest, 0);

  const columns: DataTableColumn<(typeof rows)[number]>[] = [
      {
        id: "account",
        header: "Account No.",
        className: "font-semibold text-slate-900",
        cell: (row) => row.account,
      },
      {
        id: "member",
        header: "Member",
        className: "font-medium text-slate-800",
        cell: (row) => row.member,
      },
      {
        id: "product",
        header: "Product",
        className: "text-slate-600",
        cell: (row) => row.productLabel,
      },
      {
        id: "balance",
        header: "Balance",
        align: "end",
        className: "font-semibold text-slate-900",
        cell: (row) => formatInr(row.balance),
      },
      {
        id: "rate",
        header: "Rate",
        className: "text-slate-700",
        cell: (row) => `${row.rate}% p.a.`,
      },
      {
        id: "monthlyInterest",
        header: "Monthly Interest",
        align: "end",
        className: "font-semibold text-emerald-700",
        cell: (row) => formatInr(row.monthlyInterest),
      },
      {
        id: "status",
        header: "Status",
        cell: () => (
          <Badge tone="info" caps={false}>
            Accrued
          </Badge>
        ),
      },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <div className="flex justify-end">
        <Button variant="success" icon={Banknote} onClick={() => setOpen(true)}>
          Run Month-End Posting
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Accounts in Batch",
            value: String(rows.length),
            hint: "Active deposits only",
            tone: "blue" as const,
          },
          {
            label: "Total Accrual",
            value: formatInr(totalInterest),
            hint: "Sep 2026 period",
            tone: "green" as const,
          },
          {
            label: "GL Credit Head",
            value: "421000",
            hint: "Interest Payable",
            tone: "violet" as const,
          },
          {
            label: "Posting Status",
            value: "Ready",
            hint: "Maker-checker enabled",
            tone: "amber" as const,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className={`rounded-2xl border px-4 py-3.5 ${metricToneClass[metric.tone]}`}
          >
            <p className="text-xs font-semibold tracking-wide uppercase opacity-80">
              {metric.label}
            </p>
            <p className="mt-1.5 text-xl font-bold tracking-tight">
              {metric.value}
            </p>
            <p className="mt-1 text-xs opacity-75">{metric.hint}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-soft" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter records..."
            className="w-full rounded-xl border border-border bg-surface-muted py-2.5 pr-3 pl-9 text-sm outline-none focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
          />
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        getRowKey={(row) => row.account}
        minWidth="920px"
        title={
          <span className="inline-flex items-center gap-2">
            <Calculator className="h-4 w-4 text-slate-500" />
            Interest Calculation Preview
          </span>
        }
        description="Balance × Rate / 12 — preview before committing month-end batch"
      />

      <InterestPostingModal
        open={open}
        onClose={() => setOpen(false)}
        accountCount={rows.length}
        totalInterest={totalInterest}
      />
    </div>
  );
}
