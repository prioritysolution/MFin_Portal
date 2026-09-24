"use client";

import { useMemo, useState } from "react";
import {
  CalendarRange,
  Download,
  Printer,
  Search,
} from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  buildSchedule,
  formatInr,
  lmsLoans,
  metricToneClass,
} from "@/features/lms/components/lms-data";

export function LmsRepaymentScheduleView() {
  const [loanId, setLoanId] = useState(lmsLoans[0]!.loanId);
  const [query, setQuery] = useState("");

  const loan = lmsLoans.find((row) => row.loanId === loanId) ?? lmsLoans[0]!;
  const schedule = useMemo(() => buildSchedule(loan), [loan]);

  const filteredLoans = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lmsLoans;
    return lmsLoans.filter(
      (row) =>
        row.loanId.toLowerCase().includes(q) ||
        row.borrower.toLowerCase().includes(q),
    );
  }, [query]);

  const paid = schedule.filter((row) => row.status === "Paid").length;
  const upcoming = schedule.filter((row) => row.status === "Upcoming").length;

  const columns = useMemo<DataTableColumn<(typeof schedule)[number]>[]>(
    () => [
      {
        id: "installment",
        header: "#",
        className: "font-semibold text-slate-900",
        cell: (row) => `#${row.installment}`,
      },
      {
        id: "dueDate",
        header: "Due Date",
        className: "text-slate-700",
        cell: (row) => row.dueDate,
      },
      {
        id: "principal",
        header: "Principal",
        align: "end",
        className: "font-medium text-slate-800",
        cell: (row) => formatInr(row.principal),
      },
      {
        id: "interest",
        header: "Interest",
        align: "end",
        className: "text-slate-600",
        cell: (row) => formatInr(row.interest),
      },
      {
        id: "total",
        header: "EMI Total",
        align: "end",
        className: "font-semibold text-slate-900",
        cell: (row) => formatInr(row.total),
      },
      {
        id: "balance",
        header: "Balance",
        align: "end",
        className: "text-slate-600",
        cell: (row) => formatInr(row.balance),
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => (
          <Badge
            tone={
              row.status === "Paid"
                ? "success"
                : row.status === "Due"
                  ? "warning"
                  : "neutral"
            }
            caps={false}
          >
            {row.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" icon={Download}>
          Export Schedule
        </Button>
        <Button icon={Printer}>Print Schedule</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Loan Account",
            value: loan.loanId,
            hint: loan.borrower,
            tone: "blue" as const,
          },
          {
            label: "Sanctioned Principal",
            value: formatInr(loan.principal),
            hint: `${loan.rate}% p.a. reducing`,
            tone: "slate" as const,
          },
          {
            label: "Installments Paid",
            value: `${paid} / ${loan.tenure}`,
            hint: `${upcoming} upcoming`,
            tone: "green" as const,
          },
          {
            label: "Scheduled EMI",
            value: formatInr(loan.emi),
            hint: `Next due ${loan.nextDue}`,
            tone: "violet" as const,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className={`rounded-2xl border px-4 py-3.5 ${metricToneClass[metric.tone]}`}
          >
            <p className="text-xs font-semibold tracking-wide uppercase opacity-80">
              {metric.label}
            </p>
            <p className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl">
              {metric.value}
            </p>
            <p className="mt-1 text-xs opacity-75">{metric.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-semibold text-slate-900">Select Loan</h2>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-soft" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search loan / borrower..."
              className="w-full rounded-xl border border-border bg-surface-muted py-2.5 pr-3 pl-9 text-sm outline-none focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
          </div>
          <ul className="mt-3 max-h-[420px] space-y-1.5 overflow-y-auto scrollbar-thin">
            {filteredLoans.map((row) => (
              <li key={row.loanId}>
                <button
                  type="button"
                  onClick={() => setLoanId(row.loanId)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                    row.loanId === loanId
                      ? "border-blue-200 bg-blue-50"
                      : "border-transparent hover:border-border hover:bg-surface-muted"
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-900">
                    {row.loanId}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {row.borrower}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <DataTable
          data={schedule}
          columns={columns}
          getRowKey={(row) => String(row.installment)}
          minWidth="760px"
          title={
            <span className="flex w-full flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-slate-500" />
                Account No: {loan.loanId}
              </span>
              <Badge
                tone={
                  loan.status === "Current"
                    ? "success"
                    : loan.status === "NPA"
                      ? "danger"
                      : "warning"
                }
                caps={false}
              >
                {loan.status}
              </Badge>
            </span>
          }
          description={`${loan.borrower} · ${loan.group} · ${loan.product}`}
        />
      </div>
    </div>
  );
}
