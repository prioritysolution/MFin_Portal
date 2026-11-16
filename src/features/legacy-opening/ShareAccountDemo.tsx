"use client";

import { useState, type FormEvent } from "react";
import { Check, FileDown, FileUp, Pencil, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { BatchFormActions } from "./BatchFormActions";
import { Card } from "@/components/ui/Card";
import { CheckboxField, DateField, SelectField, TextField } from "@/components/ui/Form";
import { initialShareEntry, shareExamples, type ShareEntry } from "./share-demo-data";

const amount = (row: ShareEntry) => Number(row.shares) * Number(row.faceValue);
const total = (row: ShareEntry) => amount(row) + Number(row.premium);
const money = (value: number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const options = (values: string[]) => values.map((value) => ({ value, label: value }));

export function ShareAccountDemo({ visible }: { visible: boolean }) {
  const [form, setForm] = useState<ShareEntry>(initialShareEntry);
  const [rows, setRows] = useState<ShareEntry[]>(shareExamples);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const set = (key: keyof ShareEntry, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const clear = () => {
    setForm({ ...initialShareEntry, member: "", name: "", account: "", shares: "", faceValue: "", premium: "0", dividend: false, dividendRate: "", dividendDate: "", nominee: "", relation: "", remarks: "" });
    setError("");
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    const nonnegative = (value: string) => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;
    if (!form.member.trim() || !form.name.trim() || !form.account.trim() || !form.scheme || !form.date || !/^\d+$/.test(form.shares) || Number(form.shares) <= 0 || !nonnegative(form.faceValue) || Number(form.faceValue) <= 0 || !nonnegative(form.premium) || (form.dividend && (!nonnegative(form.dividendRate) || !form.dividendDate))) {
      setError("Complete the required fields with valid share and dividend details."); return;
    }
    const entry = { ...form, id: form.id || crypto.randomUUID() };
    setRows((current) => form.id ? current.map((row) => row.id === form.id ? entry : row) : [...current, entry]);
    clear();
  };
  const remove = (ids: string[]) => { setRows((current) => current.filter((row) => !ids.includes(row.id))); setSelected((current) => current.filter((id) => !ids.includes(id))); };
  const columns: DataTableColumn<ShareEntry>[] = [
    { id: "sl", header: "Sl.", cell: (_row, index) => index + 1 },
    { id: "type", header: "Account type", cell: () => "SHARE" },
    { id: "account", header: "Account no.", cell: (row) => row.account },
    { id: "member", header: "Member no.", cell: (row) => row.member },
    { id: "name", header: "Member name", cell: (row) => row.name },
    { id: "shares", header: "No. of shares", align: "end", cell: (row) => row.shares },
    { id: "faceValue", header: "Face value (₹)", align: "end", cell: (row) => money(Number(row.faceValue)) },
    { id: "amount", header: "Share amount (₹)", align: "end", cell: (row) => money(amount(row)) },
    { id: "premium", header: "Premium (₹)", align: "end", cell: (row) => money(Number(row.premium)) },
    { id: "total", header: "Total amount (₹)", align: "end", cell: (row) => money(total(row)) },
  ];
  const validPreview = (value: number) => Number.isFinite(value) ? money(value) : "0.00";
  return (
    <div hidden={!visible} className="space-y-5">
      <Card title="Account Opening Details (Share Account)">
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-3">
            <section className="space-y-4 rounded-xl border border-border p-4" aria-labelledby="share-basic">
              <h3 id="share-basic" className="text-sm font-semibold text-foreground">Basic Details</h3>
              <TextField label="Member no." value={form.member} onChange={(v) => set("member", v)} required />
              <TextField label="Member name" value={form.name} onChange={(v) => set("name", v)} required />
              <TextField label="Account no." value={form.account} onChange={(v) => set("account", v)} required />
              <SelectField label="Share scheme" value={form.scheme} onChange={(v) => set("scheme", v)} options={options(["SC - Share Capital"])} required />
              <DateField label="Opening date" value={form.date} onChange={(v) => set("date", v)} required />
              <TextField label="Remarks" value={form.remarks} onChange={(v) => set("remarks", v)} />
            </section>
            <section className="space-y-4 rounded-xl border border-border p-4" aria-labelledby="share-details">
              <h3 id="share-details" className="text-sm font-semibold text-foreground">Share Details</h3>
              <TextField label="No. of shares" value={form.shares} onChange={(v) => set("shares", v)} inputMode="numeric" required />
              <TextField label="Face value (₹)" value={form.faceValue} onChange={(v) => set("faceValue", v)} inputMode="decimal" required />
              <TextField label="Share amount" value={validPreview(amount(form))} readOnly />
              <TextField label="Share premium" value={form.premium} onChange={(v) => set("premium", v)} inputMode="decimal" />
              <TextField label="Total share value" value={validPreview(total(form))} readOnly />
            </section>
            <section className="space-y-4 rounded-xl border border-border p-4" aria-labelledby="share-other">
              <h3 id="share-other" className="text-sm font-semibold text-foreground">Other Details</h3>
              <CheckboxField label="Dividend applicable" checked={form.dividend} onChange={(v) => set("dividend", v)} />
              <TextField label="Dividend rate (p.a.) %" value={form.dividendRate} onChange={(v) => set("dividendRate", v)} inputMode="decimal" disabled={!form.dividend} required={form.dividend} />
              <DateField label="Dividend start date" value={form.dividendDate} onChange={(v) => set("dividendDate", v)} disabled={!form.dividend} required={form.dividend} />
              <TextField label="Nominee name" value={form.nominee} onChange={(v) => set("nominee", v)} />
              <SelectField label="Relation" value={form.relation} onChange={(v) => set("relation", v)} options={options(["Spouse", "Parent", "Child", "Other"])} placeholder="Select relation" />
            </section>
          </div>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <BatchFormActions editing={Boolean(form.id)} clear={clear} />
        </form>
      </Card>
      <DataTable data={rows} columns={columns} getRowKey={(row) => row.id} minHeight="0" minWidth="1200px" title="Batch Entry List (Current Session)" description={`Total: ${rows.length}  |  Total share amount: ₹ ${money(rows.reduce((sum, row) => sum + amount(row), 0))}`} emptyTitle="No share account entries" emptyMessage="Add an account above to begin." selection={{ getRowKey: (row) => row.id, selectedKeys: selected, onSelectionChange: setSelected }} rowActions={{ header: "Action", render: (row) => <div className="flex gap-1"><Button size="sm" variant="secondary" icon={Pencil} aria-label={`Edit ${row.account}`} onClick={() => { setForm(row); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} /><Button size="sm" variant="danger" icon={Trash2} aria-label={`Delete ${row.account}`} onClick={() => remove([row.id])} /></div> }} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="danger" icon={Trash2} disabled={!selected.length} onClick={() => remove(selected)}>Delete selected ({selected.length})</Button>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" icon={FileUp} disabled>Import from Excel</Button><Button variant="secondary" icon={FileDown} disabled>Export to Excel</Button><Button icon={Check} disabled>Finalize batch</Button></div>
        <p className="w-full text-sm text-muted">Import, export and finalization will be available after backend integration.</p>
      </div>
    </div>
  );
}
