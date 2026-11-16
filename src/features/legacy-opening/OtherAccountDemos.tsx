"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Check, FileDown, FileUp, Pencil, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { BatchFormActions } from "./BatchFormActions";
import { Card } from "@/components/ui/Card";
import { CheckboxField, DateField, SelectField, TextField } from "@/components/ui/Form";
import { loanExamples, thriftExamples, type LoanEntry, type ThriftEntry } from "./other-account-demo-data";

const money = (value: number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const options = (values: string[]) => values.map((value) => ({ value, label: value }));
const validAmount = (value: string) => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;
const outstanding = (row: LoanEntry) => Number(row.principal || 0) + Number(row.overduePrincipal || 0) + Number(row.interest || 0) + Number(row.overdueInterest || 0);

function Group({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-4 rounded-xl border border-border p-4"><h3 className="text-sm font-semibold text-foreground">{title}</h3>{children}</section>;
}
function Footer({ count, remove }: { count: number; remove: () => void }) {
  return <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="danger" icon={Trash2} disabled={!count} onClick={remove}>Delete selected ({count})</Button><div className="flex flex-wrap gap-2"><Button variant="secondary" icon={FileUp} disabled>Import from Excel</Button><Button variant="secondary" icon={FileDown} disabled>Export to Excel</Button><Button icon={Check} disabled>Finalize batch</Button></div><p className="w-full text-sm text-muted">Import, export and finalization will be available after backend integration.</p></div>;
}
function Actions({ edit, remove, account }: { edit: () => void; remove: () => void; account: string }) {
  return <div className="flex gap-1"><Button size="sm" variant="secondary" icon={Pencil} aria-label={`Edit ${account}`} onClick={edit} /><Button size="sm" variant="danger" icon={Trash2} aria-label={`Delete ${account}`} onClick={remove} /></div>;
}
export function ThriftFundDemo({ visible }: { visible: boolean }) {
  const [form, setForm] = useState<ThriftEntry>({ ...thriftExamples[0], id: "" });
  const [rows, setRows] = useState(thriftExamples);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const set = (key: keyof ThriftEntry, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const clear = () => { setForm({ ...thriftExamples[0], id: "", member: "", name: "", account: "", installment: "", rate: "", balance: "", start: "", last: "", nominee: "", relation: "", remarks: "", autoCredit: false, closure: false }); setError(""); };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form.member.trim() || !form.name.trim() || !form.account.trim() || !form.scheme || !form.date || !form.start || !form.payable || !validAmount(form.installment) || Number(form.installment) <= 0 || !validAmount(form.rate) || !validAmount(form.balance)) { setError("Complete the required fields with valid amounts and dates."); return; }
    const entry = { ...form, id: form.id || crypto.randomUUID() };
    setRows((current) => form.id ? current.map((row) => row.id === form.id ? entry : row) : [...current, entry]); clear();
  };
  const remove = (ids: string[]) => { setRows((current) => current.filter((row) => !ids.includes(row.id))); setSelected((current) => current.filter((id) => !ids.includes(id))); };
  const columns: DataTableColumn<ThriftEntry>[] = [
    { id: "sl", header: "Sl.", cell: (_, i) => i + 1 }, { id: "type", header: "Account type", cell: () => "TF" },
    { id: "account", header: "Account no.", cell: (r) => r.account }, { id: "member", header: "Member no.", cell: (r) => r.member },
    { id: "name", header: "Member name", cell: (r) => r.name }, { id: "scheme", header: "TF scheme", cell: (r) => r.scheme },
    { id: "installment", header: "Monthly installment (₹)", align: "end", cell: (r) => money(Number(r.installment)) },
    { id: "rate", header: "ROI (p.a.)", align: "end", cell: (r) => `${r.rate} %` }, { id: "balance", header: "Opening balance (₹)", align: "end", cell: (r) => money(Number(r.balance)) },
  ];
  return <div hidden={!visible} className="space-y-5"><Card title="Account Opening Details (Thrift Fund - TF)"><form onSubmit={save} className="space-y-5"><div className="grid gap-4 xl:grid-cols-3">
    <Group title="Basic Details"><TextField label="Member no." value={form.member} onChange={(v) => set("member", v)} required /><TextField label="Member name" value={form.name} onChange={(v) => set("name", v)} required /><TextField label="Account no." value={form.account} onChange={(v) => set("account", v)} required /><SelectField label="TF scheme" value={form.scheme} onChange={(v) => set("scheme", v)} options={options(["TF - Thrift Fund"])} required /><DateField label="Opening date" value={form.date} onChange={(v) => set("date", v)} required /><TextField label="Remarks" value={form.remarks} onChange={(v) => set("remarks", v)} /></Group>
    <Group title="TF Details"><TextField label="Monthly installment" value={form.installment} onChange={(v) => set("installment", v)} inputMode="decimal" required /><TextField label="Interest rate (p.a.) %" value={form.rate} onChange={(v) => set("rate", v)} inputMode="decimal" required /><SelectField label="Interest payable" value={form.payable} onChange={(v) => set("payable", v)} options={options(["Yearly", "Half-yearly", "Quarterly", "Monthly"])} required /><DateField label="Installment start date" value={form.start} onChange={(v) => set("start", v)} required /><DateField label="Last installment up to" value={form.last} onChange={(v) => set("last", v)} /><TextField label="Opening balance" value={form.balance} onChange={(v) => set("balance", v)} inputMode="decimal" required /></Group>
    <Group title="Other Details"><div className="flex flex-col items-start gap-4"><CheckboxField label="Auto credit interest" checked={form.autoCredit} onChange={(v) => set("autoCredit", v)} /><CheckboxField label="Maturity / closure allowed" checked={form.closure} onChange={(v) => set("closure", v)} /></div><TextField label="Nominee name" value={form.nominee} onChange={(v) => set("nominee", v)} /><SelectField label="Relation" value={form.relation} onChange={(v) => set("relation", v)} options={options(["Spouse", "Parent", "Child", "Other"])} placeholder="Select relation" /><SelectField label="Maturity instruction" value={form.instruction} onChange={(v) => set("instruction", v)} options={options(["Pay Principal + Interest"])} /></Group>
    </div>{error && <p role="alert" className="text-sm text-rose-600">{error}</p>}<BatchFormActions editing={Boolean(form.id)} clear={clear} /></form></Card>
    <DataTable data={rows} columns={columns} getRowKey={(r) => r.id} minHeight="0" minWidth="1100px" title="Batch Entry List (Current Session)" description={`Total: ${rows.length}  |  Total opening balance: ₹ ${money(rows.reduce((sum, row) => sum + Number(row.balance), 0))}`} emptyTitle="No Thrift Fund entries" emptyMessage="Add an account above to begin." selection={{ getRowKey: (r) => r.id, selectedKeys: selected, onSelectionChange: setSelected }} rowActions={{ header: "Action", render: (r) => <Actions account={r.account} edit={() => { setForm(r); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} remove={() => remove([r.id])} /> }} /><Footer count={selected.length} remove={() => remove(selected)} /></div>;
}

export function LoanAccountDemo({ visible }: { visible: boolean }) {
  const [form, setForm] = useState<LoanEntry>({ ...loanExamples[0], id: "" });
  const [rows, setRows] = useState(loanExamples);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const set = (key: keyof LoanEntry, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const clear = () => { setForm({ ...loanExamples[0], id: "", member: "", name: "", account: "", sanctionNo: "", sanctionDate: "", disbursementDate: "", sanction: "", disbursement: "", rate: "", tenure: "", emi: "", repaymentStart: "", maturity: "", principal: "", overduePrincipal: "", interest: "", overdueInterest: "", remarks: "" }); setError(""); };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form.member.trim() || !form.name.trim() || !form.account.trim() || !form.product || !form.repayment || !validAmount(form.sanction) || Number(form.sanction) <= 0 || !validAmount(form.disbursement) || !validAmount(form.rate) || [form.principal, form.overduePrincipal, form.interest, form.overdueInterest, form.emi].some((v) => v !== "" && !validAmount(v)) || (form.tenure !== "" && (!/^\d+$/.test(form.tenure) || Number(form.tenure) <= 0))) { setError("Complete the required fields with valid loan amounts and rate."); return; }
    const entry = { ...form, id: form.id || crypto.randomUUID() };
    setRows((current) => form.id ? current.map((row) => row.id === form.id ? entry : row) : [...current, entry]); clear();
  };
  const remove = (ids: string[]) => { setRows((current) => current.filter((row) => !ids.includes(row.id))); setSelected((current) => current.filter((id) => !ids.includes(id))); };
  const columns: DataTableColumn<LoanEntry>[] = [
    { id: "sl", header: "Sl.", cell: (_, i) => i + 1 }, { id: "type", header: "Account type", cell: () => "LOAN" },
    { id: "account", header: "Account no.", cell: (r) => r.account }, { id: "member", header: "Member no.", cell: (r) => r.member },
    { id: "name", header: "Member name", cell: (r) => r.name }, { id: "product", header: "Product / Loan type", cell: (r) => r.product },
    { id: "sanction", header: "Sanction amount", align: "end", cell: (r) => money(Number(r.sanction)) }, { id: "outstanding", header: "Outstanding", align: "end", cell: (r) => money(outstanding(r)) },
  ];
  const preview = outstanding(form);
  return <div hidden={!visible} className="space-y-5"><Card title="Account Opening Details (Loan Account)"><form onSubmit={save} className="space-y-5"><div className="grid gap-4 xl:grid-cols-3">
    <Group title="Basic Details"><TextField label="Member no." value={form.member} onChange={(v) => set("member", v)} required /><TextField label="Member name" value={form.name} onChange={(v) => set("name", v)} required /><TextField label="Account no." value={form.account} onChange={(v) => set("account", v)} required /><SelectField label="Loan product" value={form.product} onChange={(v) => set("product", v)} options={options(["PL - Personal Loan", "BL - Business Loan", "HL - Housing Loan", "VL - Vehicle Loan"])} required /><TextField label="Sanction no." value={form.sanctionNo} onChange={(v) => set("sanctionNo", v)} /><DateField label="Sanction date" value={form.sanctionDate} onChange={(v) => set("sanctionDate", v)} /><DateField label="Disbursement date" value={form.disbursementDate} onChange={(v) => set("disbursementDate", v)} /></Group>
    <Group title="Loan Details"><TextField label="Sanction amount" value={form.sanction} onChange={(v) => set("sanction", v)} inputMode="decimal" required /><TextField label="Disbursement amount" value={form.disbursement} onChange={(v) => set("disbursement", v)} inputMode="decimal" required /><TextField label="Rate of interest (ROI) %" value={form.rate} onChange={(v) => set("rate", v)} inputMode="decimal" required /><SelectField label="Repayment type" value={form.repayment} onChange={(v) => set("repayment", v)} options={options(["EMI"])} required /><TextField label="Tenure (months)" value={form.tenure} onChange={(v) => set("tenure", v)} inputMode="numeric" /><TextField label="EMI amount" value={form.emi} onChange={(v) => set("emi", v)} inputMode="decimal" /><DateField label="Repayment start date" value={form.repaymentStart} onChange={(v) => set("repaymentStart", v)} /><DateField label="Maturity date" value={form.maturity} onChange={(v) => set("maturity", v)} /></Group>
    <Group title="Outstanding at Opening"><TextField label="Current principal" value={form.principal} onChange={(v) => set("principal", v)} inputMode="decimal" /><TextField label="Overdue principal" value={form.overduePrincipal} onChange={(v) => set("overduePrincipal", v)} inputMode="decimal" /><TextField label="Current interest (due interest)" value={form.interest} onChange={(v) => set("interest", v)} inputMode="decimal" /><TextField label="Overdue interest" value={form.overdueInterest} onChange={(v) => set("overdueInterest", v)} inputMode="decimal" /><TextField label="Total outstanding" value={Number.isFinite(preview) ? money(preview) : "0.00"} readOnly /><TextField label="Remarks" value={form.remarks} onChange={(v) => set("remarks", v)} /></Group>
    </div>{error && <p role="alert" className="text-sm text-rose-600">{error}</p>}<BatchFormActions editing={Boolean(form.id)} clear={clear} /></form></Card>
    <DataTable data={rows} columns={columns} getRowKey={(r) => r.id} minHeight="0" minWidth="1000px" title="Batch Entry List (Current Session)" description={`Total: ${rows.length}  |  Total outstanding: ₹ ${money(rows.reduce((sum, row) => sum + outstanding(row), 0))}`} emptyTitle="No loan entries" emptyMessage="Add an account above to begin." selection={{ getRowKey: (r) => r.id, selectedKeys: selected, onSelectionChange: setSelected }} rowActions={{ header: "Action", render: (r) => <Actions account={r.account} edit={() => { setForm(r); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} remove={() => remove([r.id])} /> }} /><Footer count={selected.length} remove={() => remove(selected)} /></div>;
}
