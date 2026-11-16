"use client";

import { useState, type FormEvent } from "react";
import { Check, FileDown, FileUp, Pencil, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { BatchFormActions } from "./BatchFormActions";
import { Card } from "@/components/ui/Card";
import { CheckboxField, DateField, SelectField, TextField } from "@/components/ui/Form";
import { initialTermEntry, termExamples, type TermEntry } from "./term-demo-data";

const money = (value: string | number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value));
const formatDate = (value: string) => value.split("-").reverse().join("-");
const options = (values: string[]) => values.map((value) => ({ value, label: value }));

export function TermDepositDemo({ visible }: { visible: boolean }) {
  const [form, setForm] = useState<TermEntry>(initialTermEntry);
  const [rows, setRows] = useState<TermEntry[]>(termExamples);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const set = (key: keyof TermEntry, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const clear = () => {
    setForm({ ...initialTermEntry, member: "", name: "", account: "", amount: "", rate: "", tenure: "", maturity: "", maturityAmount: "", tdsApplicable: false, tdsRate: "", remarks: "" });
    setError("");
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    const validNumber = (value: string) => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;
    if (!form.member.trim() || !form.name.trim() || !form.account.trim() || !form.product || !form.scheme || !form.date || !form.maturity || form.maturity < form.date || !validNumber(form.amount) || Number(form.amount) <= 0 || !validNumber(form.rate) || !/^\d+$/.test(form.tenure) || Number(form.tenure) <= 0 || !validNumber(form.maturityAmount) || (form.tdsApplicable && !validNumber(form.tdsRate))) {
      setError("Complete the required fields with valid amounts, tenure and dates.");
      return;
    }
    const entry = { ...form, id: form.id || crypto.randomUUID() };
    setRows((current) => form.id ? current.map((row) => row.id === form.id ? entry : row) : [...current, entry]);
    clear();
  };
  const remove = (ids: string[]) => {
    setRows((current) => current.filter((row) => !ids.includes(row.id)));
    setSelected((current) => current.filter((id) => !ids.includes(id)));
  };
  const columns: DataTableColumn<TermEntry>[] = [
    { id: "sl", header: "Sl.", cell: (_row, index) => index + 1 },
    { id: "type", header: "Account type", cell: () => "FD" },
    { id: "account", header: "Account no.", cell: (row) => row.account },
    { id: "member", header: "Member no.", cell: (row) => row.member },
    { id: "name", header: "Member name", cell: (row) => row.name },
    { id: "scheme", header: "Scheme / Product", cell: (row) => row.scheme },
    { id: "amount", header: "Deposit amount", align: "end", cell: (row) => money(row.amount) },
    { id: "rate", header: "ROI (p.a.)", align: "end", cell: (row) => `${row.rate} %` },
    { id: "tenure", header: "Tenure", cell: (row) => `${row.tenure} M` },
    { id: "maturity", header: "Maturity date", cell: (row) => formatDate(row.maturity) },
    { id: "maturityAmount", header: "Maturity amount", align: "end", cell: (row) => money(row.maturityAmount) },
  ];
  const total = rows.reduce((sum, row) => sum + Number(row.amount), 0);
  return (
    <div hidden={!visible} className="space-y-5">
      <Card title="Account Opening Details (Term Deposit)">
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-3">
            <section className="space-y-4 rounded-xl border border-border p-4" aria-labelledby="term-basic">
              <h3 id="term-basic" className="text-sm font-semibold text-foreground">Basic Details</h3>
              <TextField label="Member no." value={form.member} onChange={(v) => set("member", v)} required />
              <TextField label="Member name" value={form.name} onChange={(v) => set("name", v)} required />
              <TextField label="Account no." value={form.account} onChange={(v) => set("account", v)} required />
              <SelectField label="Deposit product" value={form.product} onChange={(v) => set("product", v)} options={options(["FD - Fixed Deposit"])} required />
              <SelectField label="Scheme" value={form.scheme} onChange={(v) => set("scheme", v)} options={options(["FD - 12 Months", "FD - 24 Months", "FD - 36 Months"])} required />
              <DateField label="Opening date" value={form.date} onChange={(v) => set("date", v)} required />
            </section>
            <section className="space-y-4 rounded-xl border border-border p-4" aria-labelledby="term-deposit">
              <h3 id="term-deposit" className="text-sm font-semibold text-foreground">Deposit Details</h3>
              <TextField label="Deposit amount" value={form.amount} onChange={(v) => set("amount", v)} inputMode="decimal" required />
              <TextField label="Interest rate (p.a.) %" value={form.rate} onChange={(v) => set("rate", v)} inputMode="decimal" required />
              <SelectField label="Interest payout" value={form.payout} onChange={(v) => set("payout", v)} options={options(["On Maturity", "Monthly", "Quarterly"])} required />
              <SelectField label="Compounding" value={form.compounding} onChange={(v) => set("compounding", v)} options={options(["Quarterly", "Monthly", "Half-yearly", "Yearly"])} required />
              <TextField label="Tenure (months)" value={form.tenure} onChange={(v) => set("tenure", v)} inputMode="numeric" required />
            </section>
            <section className="space-y-4 rounded-xl border border-border p-4" aria-labelledby="term-maturity">
              <h3 id="term-maturity" className="text-sm font-semibold text-foreground">Maturity Details</h3>
              <DateField label="Maturity date" value={form.maturity} onChange={(v) => set("maturity", v)} required />
              <TextField label="Maturity amount" value={form.maturityAmount} onChange={(v) => set("maturityAmount", v)} inputMode="decimal" required hint="Enter the amount from the existing record." />
              <CheckboxField label="TDS applicable" checked={form.tdsApplicable} onChange={(v) => set("tdsApplicable", v)} />
              <TextField label="TDS rate %" value={form.tdsRate} onChange={(v) => set("tdsRate", v)} inputMode="decimal" disabled={!form.tdsApplicable} required={form.tdsApplicable} />
              <TextField label="Remarks" value={form.remarks} onChange={(v) => set("remarks", v)} />
            </section>
          </div>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <BatchFormActions editing={Boolean(form.id)} clear={clear} />
        </form>
      </Card>
      <DataTable data={rows} columns={columns} getRowKey={(row) => row.id} minHeight="0" minWidth="1300px" title="Batch Entry List (Current Session)" description={`Total: ${rows.length}  |  Total deposit amount: ₹ ${money(total)}`} emptyTitle="No term deposit entries" emptyMessage="Add an account above to begin." selection={{ getRowKey: (row) => row.id, selectedKeys: selected, onSelectionChange: setSelected }} rowActions={{ header: "Action", render: (row) => <div className="flex gap-1"><Button size="sm" variant="secondary" icon={Pencil} aria-label={`Edit ${row.account}`} onClick={() => { setForm(row); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} /><Button size="sm" variant="danger" icon={Trash2} aria-label={`Delete ${row.account}`} onClick={() => remove([row.id])} /></div> }} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="danger" icon={Trash2} disabled={!selected.length} onClick={() => remove(selected)}>Delete selected ({selected.length})</Button>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" icon={FileUp} disabled>Import from Excel</Button><Button variant="secondary" icon={FileDown} disabled>Export to Excel</Button><Button icon={Check} disabled>Finalize batch</Button></div>
        <p className="w-full text-sm text-muted">Import, export and finalization will be available after backend integration.</p>
      </div>
    </div>
  );
}
