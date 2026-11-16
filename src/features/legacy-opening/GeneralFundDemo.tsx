"use client";

import { useState, type FormEvent } from "react";
import { Check, FileDown, FileUp, Pencil, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { BatchFormActions } from "./BatchFormActions";
import { Card } from "@/components/ui/Card";
import { CheckboxField, DateField, SelectField, TextField } from "@/components/ui/Form";
import { generalFundExamples, initialGeneralFundEntry, type GeneralFundEntry } from "./general-fund-demo-data";

const money = (value: number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const options = (values: string[]) => values.map((value) => ({ value, label: value }));

export function GeneralFundDemo({ visible }: { visible: boolean }) {
  const [form, setForm] = useState<GeneralFundEntry>(initialGeneralFundEntry);
  const [rows, setRows] = useState<GeneralFundEntry[]>(generalFundExamples);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const set = (key: keyof GeneralFundEntry, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const clear = () => {
    setForm({ ...initialGeneralFundEntry, member: "", name: "", account: "", balance: "", rate: "", interestStart: "", interestPaidUntil: "", autoCredit: false, closureAllowed: false, nominee: "", relation: "", remarks: "" });
    setError("");
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    const nonnegative = (value: string) => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;
    if (!form.member.trim() || !form.name.trim() || !form.account.trim() || !form.scheme || !form.date || !nonnegative(form.balance) || (form.rate !== "" && !nonnegative(form.rate))) {
      setError("Complete the required fields with a valid opening balance and interest rate."); return;
    }
    const entry = { ...form, id: form.id || crypto.randomUUID() };
    setRows((current) => form.id ? current.map((row) => row.id === form.id ? entry : row) : [...current, entry]);
    clear();
  };
  const remove = (ids: string[]) => { setRows((current) => current.filter((row) => !ids.includes(row.id))); setSelected((current) => current.filter((id) => !ids.includes(id))); };
  const columns: DataTableColumn<GeneralFundEntry>[] = [
    { id: "sl", header: "Sl.", cell: (_row, index) => index + 1 },
    { id: "type", header: "Account type", cell: () => "GF" },
    { id: "account", header: "Account no.", cell: (row) => row.account },
    { id: "member", header: "Member no.", cell: (row) => row.member },
    { id: "name", header: "Member name", cell: (row) => row.name },
    { id: "scheme", header: "GF scheme", cell: (row) => row.scheme },
    { id: "balance", header: "Opening balance (₹)", align: "end", cell: (row) => money(Number(row.balance)) },
    { id: "rate", header: "ROI (p.a.)", align: "end", cell: (row) => row.rate ? `${row.rate} %` : "—" },
    { id: "payable", header: "Interest payable", cell: (row) => row.payable },
  ];
  return (
    <div hidden={!visible} className="space-y-5">
      <Card title="Account Opening Details (General Fund - GF)">
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-3">
            <section className="space-y-4 rounded-xl border border-border p-4" aria-labelledby="gf-basic">
              <h3 id="gf-basic" className="text-sm font-semibold text-foreground">Basic Details</h3>
              <TextField label="Member no." value={form.member} onChange={(v) => set("member", v)} required />
              <TextField label="Member name" value={form.name} onChange={(v) => set("name", v)} required />
              <TextField label="Account no." value={form.account} onChange={(v) => set("account", v)} required />
              <SelectField label="GF scheme" value={form.scheme} onChange={(v) => set("scheme", v)} options={options(["GF - General Fund"])} required />
              <DateField label="Opening date" value={form.date} onChange={(v) => set("date", v)} required />
              <TextField label="Remarks" value={form.remarks} onChange={(v) => set("remarks", v)} />
            </section>
            <section className="space-y-4 rounded-xl border border-border p-4" aria-labelledby="gf-details">
              <h3 id="gf-details" className="text-sm font-semibold text-foreground">GF Details</h3>
              <TextField label="Opening balance" value={form.balance} onChange={(v) => set("balance", v)} inputMode="decimal" required />
              <TextField label="Interest rate (p.a.) %" value={form.rate} onChange={(v) => set("rate", v)} inputMode="decimal" />
              <SelectField label="Interest payable" value={form.payable} onChange={(v) => set("payable", v)} options={options(["Yearly", "Half-yearly", "Quarterly", "Monthly"])} />
              <DateField label="Interest start date" value={form.interestStart} onChange={(v) => set("interestStart", v)} />
              <DateField label="Last interest paid up to" value={form.interestPaidUntil} onChange={(v) => set("interestPaidUntil", v)} />
            </section>
            <section className="space-y-4 rounded-xl border border-border p-4" aria-labelledby="gf-other">
              <h3 id="gf-other" className="text-sm font-semibold text-foreground">Other Details</h3>
              <div className="flex flex-col items-start gap-4">
                <CheckboxField label="Auto credit interest" checked={form.autoCredit} onChange={(v) => set("autoCredit", v)} />
                <CheckboxField label="Maturity / closure allowed" checked={form.closureAllowed} onChange={(v) => set("closureAllowed", v)} />
              </div>
              <TextField label="Nominee name" value={form.nominee} onChange={(v) => set("nominee", v)} />
              <SelectField label="Relation" value={form.relation} onChange={(v) => set("relation", v)} options={options(["Spouse", "Parent", "Child", "Other"])} placeholder="Select relation" />
            </section>
          </div>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <BatchFormActions editing={Boolean(form.id)} clear={clear} />
        </form>
      </Card>
      <DataTable data={rows} columns={columns} getRowKey={(row) => row.id} minHeight="0" minWidth="1100px" title="Batch Entry List (Current Session)" description={`Total: ${rows.length}  |  Total opening balance: ₹ ${money(rows.reduce((sum, row) => sum + Number(row.balance), 0))}`} emptyTitle="No General Fund entries" emptyMessage="Add an account above to begin." selection={{ getRowKey: (row) => row.id, selectedKeys: selected, onSelectionChange: setSelected }} rowActions={{ header: "Action", render: (row) => <div className="flex gap-1"><Button size="sm" variant="secondary" icon={Pencil} aria-label={`Edit ${row.account}`} onClick={() => { setForm(row); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} /><Button size="sm" variant="danger" icon={Trash2} aria-label={`Delete ${row.account}`} onClick={() => remove([row.id])} /></div> }} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="danger" icon={Trash2} disabled={!selected.length} onClick={() => remove(selected)}>Delete selected ({selected.length})</Button>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" icon={FileUp} disabled>Import from Excel</Button><Button variant="secondary" icon={FileDown} disabled>Export to Excel</Button><Button icon={Check} disabled>Finalize batch</Button></div>
        <p className="w-full text-sm text-muted">Import, export and finalization will be available after backend integration.</p>
      </div>
    </div>
  );
}
