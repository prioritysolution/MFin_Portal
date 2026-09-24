"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarRange,
  FileSpreadsheet,
  Percent,
  Search,
  Wallet,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { DataTable } from "@/components/shared/DataTable";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatInr,
  lmsLoans,
  metricToneClass,
  type LmsLoan,
} from "@/features/lms/components/lms-data";

export function LmsLoanBookView() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lmsLoans.filter((row) => {
      const matchesQuery =
        !q ||
        row.loanId.toLowerCase().includes(q) ||
        row.borrower.toLowerCase().includes(q) ||
        row.group.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All" || row.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const totalOutstanding = lmsLoans.reduce(
    (sum, row) => sum + row.outstanding,
    0,
  );
  const totalCollected = lmsLoans.reduce((sum, row) => sum + row.collected, 0);
  const avgRate =
    lmsLoans.reduce((sum, row) => sum + row.rate, 0) / lmsLoans.length;

  const columns = useMemo<DataTableColumn<LmsLoan>[]>(
    () => [
      {
        id: "loanId",
        header: "Loan A/c",
        className: "font-semibold text-slate-900",
        cell: (row) => row.loanId,
      },
      {
        id: "borrower",
        header: "Borrower",
        cell: (row) => (
          <>
            <p className="font-medium text-slate-800">{row.borrower}</p>
            <p className="text-xs text-muted">{row.group}</p>
          </>
        ),
      },
      {
        id: "principal",
        header: "Principal",
        align: "end",
        className: "font-medium text-slate-800",
        cell: (row) => formatInr(row.principal),
      },
      {
        id: "outstanding",
        header: "Outstanding",
        align: "end",
        className: "font-semibold text-slate-900",
        cell: (row) => formatInr(row.outstanding),
      },
      {
        id: "collected",
        header: "Collected",
        align: "end",
        className: "font-semibold text-emerald-700",
        cell: (row) => formatInr(row.collected),
      },
      {
        id: "rate",
        header: "Rate",
        cell: (row) => (
          <span className="inline-flex items-center gap-1 text-slate-700">
            <Percent className="h-3 w-3 text-slate-400" />
            {row.rate}% p.a.
          </span>
        ),
      },
      {
        id: "dpd",
        header: "DPD",
        align: "center",
        cell: (row) => (
          <span
            className={`font-semibold ${
              row.dpd === 0
                ? "text-emerald-600"
                : row.dpd >= 90
                  ? "text-rose-600"
                  : "text-amber-700"
            }`}
          >
            {row.dpd}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => (
          <Badge
            tone={
              row.status === "Current"
                ? "success"
                : row.status === "NPA"
                  ? "danger"
                  : "warning"
            }
            caps={false}
          >
            {row.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <Button
            size="sm"
            variant="secondary"
            icon={CalendarRange}
            onClick={() => router.push("/lms/repayment-schedule")}
          >
            Schedule
          </Button>
        ),
      },
    ],
    [router],
  );

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" icon={FileSpreadsheet}>
          Export Loan Book
        </Button>
        <Button icon={Wallet}>Early Settlement Quote</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Active Accounts",
            value: String(lmsLoans.length),
            hint: "Live portfolio",
            tone: "blue" as const,
          },
          {
            label: "Gross Outstanding",
            value: formatInr(totalOutstanding, 0),
            hint: "Principal + accrued",
            tone: "violet" as const,
          },
          {
            label: "Total Collected",
            value: formatInr(totalCollected, 0),
            hint: "MTD + YTD receipts",
            tone: "green" as const,
          },
          {
            label: "Avg Interest Rate",
            value: `${avgRate.toFixed(1)}% p.a.`,
            hint: "Reducing balance EMI",
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

      <div className="flex flex-wrap items-center justify-end gap-2">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        >
          {["All", "Current", "PAR", "NPA"].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
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
        getRowKey={(row) => row.loanId}
        minWidth="1100px"
        title={
          <span className="inline-flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-500" />
            Portfolio Loan Register
          </span>
        }
        description="Outstanding GLP with DPD and product rate snapshot"
      />

      <div className="flex items-center justify-between text-xs text-muted">
        <p>
          Showing {filtered.length} of {lmsLoans.length} loan accounts
        </p>
        <p>Portfolio balances · Collections · DPD · Early settlements</p>
      </div>
    </div>
  );
}
