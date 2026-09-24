"use client";

import { useMemo, useState } from "react";
import {
  Award,
  Minus,
  PiggyBank,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  DepositTxnModal,
  OpenDepositAccountModal,
  ShareCertificateModal,
} from "@/features/deposits/components/DepositModals";
import {
  accountsByProduct,
  formatInr,
  metricToneClass,
  type DepositAccount,
} from "@/features/deposits/components/deposits-data";

export function DepositsSavingsView() {
  const accounts = accountsByProduct(["Savings", "Voluntary"]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DepositAccount | null>(null);
  const [modal, setModal] = useState<
    "deposit" | "withdraw" | "share" | "open" | null
  >(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (row) =>
        row.account.toLowerCase().includes(q) ||
        row.member.toLowerCase().includes(q) ||
        row.group.toLowerCase().includes(q),
    );
  }, [accounts, query]);

  const totalBalance = accounts.reduce((sum, row) => sum + row.balance, 0);

  const columns: DataTableColumn<DepositAccount>[] = [
      {
        id: "account",
        header: "Account No.",
        className: "font-semibold text-slate-900",
        cell: (row) => row.account,
      },
      {
        id: "member",
        header: "Member",
        cell: (row) => (
          <>
            <p className="font-medium text-slate-800">{row.member}</p>
            <p className="text-xs text-muted">{row.memberId}</p>
          </>
        ),
      },
      {
        id: "group",
        header: "JLG Group",
        className: "text-slate-600",
        cell: (row) => row.group,
      },
      {
        id: "product",
        header: "Product",
        className: "text-slate-700",
        cell: (row) => row.productLabel,
      },
      {
        id: "rate",
        header: "Interest",
        className: "text-slate-700",
        cell: (row) => `${row.rate}% p.a.`,
      },
      {
        id: "balance",
        header: "Balance",
        align: "end",
        className: "font-semibold text-emerald-700",
        cell: (row) => formatInr(row.balance),
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => (
          <Badge tone="success" caps={false}>
            {row.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (row) => (
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant="success"
              icon={Plus}
              onClick={() => {
                setSelected(row);
                setModal("deposit");
              }}
            >
              Deposit
            </Button>
            <Button
              size="sm"
              variant="amber"
              icon={Minus}
              onClick={() => {
                setSelected(row);
                setModal("withdraw");
              }}
            >
              Withdraw
            </Button>
          </div>
        ),
      },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="secondary"
          icon={Award}
          onClick={() => {
            setSelected(accounts[0] ?? null);
            setModal("share");
          }}
        >
          Share Certificate
        </Button>
        <Button icon={UserPlus} onClick={() => setModal("open")}>
          Open Savings A/c
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Savings Accounts",
            value: String(accounts.length),
            hint: "Compulsory + Voluntary",
            tone: "blue" as const,
          },
          {
            label: "Total Balance",
            value: formatInr(totalBalance, 0),
            hint: "Vault-reconciled",
            tone: "green" as const,
          },
          {
            label: "Interest Rate",
            value: "6.5% p.a.",
            hint: "Compulsory savings",
            tone: "violet" as const,
          },
          {
            label: "Share Face Value",
            value: "₹100",
            hint: "COOP-WB/2026/8942",
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
        minWidth="1000px"
        title={
          <span className="inline-flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-slate-500" />
            Compulsory Group Savings Register
          </span>
        }
        description="Interest rates, total deposits, and instant ledger passbooks"
      />

      <DepositTxnModal
        open={modal === "deposit" || modal === "withdraw"}
        onClose={() => setModal(null)}
        account={selected}
        kind={modal === "withdraw" ? "withdrawal" : "deposit"}
      />
      <ShareCertificateModal
        open={modal === "share"}
        onClose={() => setModal(null)}
        account={selected}
      />
      <OpenDepositAccountModal
        open={modal === "open"}
        onClose={() => setModal(null)}
        product="Savings"
      />
    </div>
  );
}
