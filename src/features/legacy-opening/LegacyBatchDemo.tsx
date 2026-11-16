"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BadgeIndianRupee, Banknote, Check, Coins, FileDown, FileUp, HandHeart, Pencil, Trash2, Users } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { SectionTabs } from "@/components/shared/SectionTabs";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/Button";
import { BatchFormActions } from "./BatchFormActions";
import { Card } from "@/components/ui/Card";
import { DateField, SelectField, TextField } from "@/components/ui/Form";
import { demoEntries, initialEntry, type BatchEntry } from "./demo-data";
import { TermDepositDemo } from "./TermDepositDemo";
import { ShareAccountDemo } from "./ShareAccountDemo";
import { GeneralFundDemo } from "./GeneralFundDemo";
import { ThriftFundDemo, LoanAccountDemo } from "./OtherAccountDemos";

const tabs = [
  { id: "deposit", title: "Deposit A/c", icon: Coins },
  { id: "share", title: "Share A/c", icon: Users },
  { id: "gf", title: "GF A/c", icon: HandHeart },
  { id: "tf", title: "TF A/c", icon: Banknote },
  { id: "loan", title: "Loan A/c", icon: BadgeIndianRupee },
] as const;
type Tab = (typeof tabs)[number]["id"];
const TAB_STORAGE_KEY = "mfin.opening.active-tab";
function rememberTab(value: string) {
  try { window.sessionStorage.setItem(TAB_STORAGE_KEY, value); } catch { /* Storage may be unavailable. */ }
}
const products: Record<Tab, { type: string; scheme: string }> = {
  deposit: { type: "RD", scheme: "RD - Regular Deposit" },
  share: { type: "SHARE", scheme: "Share Capital" },
  gf: { type: "GF", scheme: "General Fund" },
  tf: { type: "TF", scheme: "Thrift Fund" },
  loan: { type: "LOAN", scheme: "Personal Loan" },
};
const money = (value: number) => new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export function LegacyBatchDemo() {
  const [tab, setTab] = useState<Tab>("deposit");
  const [form, setForm] = useState<BatchEntry>(initialEntry);
  const [rows, setRows] = useState<BatchEntry[]>(demoEntries);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [tabRestored, setTabRestored] = useState(false);
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(TAB_STORAGE_KEY);
      if (saved === "deposit-fd") {
        setTab("deposit");
        setForm((current) => ({ ...current, type: "FD", scheme: "FD - Term Deposit (12M)" }));
      } else if (saved && tabs.some((item) => item.id === saved)) {
        setTab(saved as Tab);
        setForm((current) => ({ ...current, ...products[saved as Tab] }));
      }
    } catch { /* Fall back to the default tab if storage is unavailable. */ }
    setTabRestored(true);
  }, []);
  const set = (key: keyof BatchEntry, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const clear = () => { setForm({ ...initialEntry, ...products[tab], id: "", account: "", member: "", name: "", balance: "", amount: "", installment: "", remarks: "" }); setError(""); };
  const changeTab = (next: Tab) => { setTab(next); setForm((current) => ({ ...current, ...products[next] })); rememberTab(next); };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!form.member.trim() || !form.name.trim() || !form.account.trim() || !form.scheme || !form.date || !form.balance || !form.amount || !form.rate || !Number.isFinite(Number(form.balance)) || Number(form.balance) < 0 || !Number.isFinite(Number(form.amount)) || Number(form.amount) < 0 || !Number.isFinite(Number(form.rate)) || Number(form.rate) < 0) {
      setError("Complete the required fields with valid amounts and interest rate."); return;
    }
    const entry = { ...form, id: form.id || crypto.randomUUID() };
    setRows((current) => form.id ? current.map((row) => row.id === form.id ? entry : row) : [...current, entry]);
    clear();
  };
  const remove = (ids: string[]) => { setRows((current) => current.filter((row) => !ids.includes(row.id))); setSelected((current) => current.filter((id) => !ids.includes(id))); };
  const edit = (row: BatchEntry) => {
    const nextTab = row.type === "RD" || row.type === "FD" ? "deposit" : row.type.toLowerCase() as Tab;
    setTab(nextTab);
    rememberTab(row.type === "FD" ? "deposit-fd" : nextTab);
    setForm(row); setError(""); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const columns: DataTableColumn<BatchEntry>[] = [
    { id: "sl", header: "Sl.", cell: (_row, index) => index + 1 },
    { id: "type", header: "Account type", cell: (row) => row.type },
    { id: "account", header: "Account no.", cell: (row) => row.account },
    { id: "member", header: "Member no.", cell: (row) => row.member },
    { id: "name", header: "Member name", cell: (row) => row.name },
    { id: "scheme", header: "Scheme / Product", cell: (row) => row.scheme },
    { id: "date", header: "Opening date", cell: (row) => row.date.split("-").reverse().join("-") },
    { id: "balance", header: "Opening balance", align: "end", cell: (row) => money(Number(row.balance)) },
  ];
  const total = rows.reduce((sum, row) => sum + Number(row.balance), 0);
  if (!tabRestored) return <LoadingState />;
  return (
    <div className="space-y-5">
      <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Demo data only. Changes are kept in this page session and are not saved to the server.</div>
      <Card>
        <SectionTabs tabs={tabs} activeId={tab} onChange={changeTab} label="Account type" />
        {tab === "deposit" && <fieldset className="mt-4 flex flex-wrap gap-5 text-sm text-foreground">
          <legend className="sr-only">Deposit type</legend>
          {[{ type: "RD", scheme: "RD - Regular Deposit", label: "Regular Deposit (RD)" }, { type: "FD", scheme: "FD - Term Deposit (12M)", label: "Term Deposit (FD/TD)" }].map((option) => <label key={option.type} className="flex cursor-pointer items-center gap-2"><input type="radio" name="depositType" checked={tab === "deposit" && form.type === option.type} onChange={() => { setTab("deposit"); setForm((current) => ({ ...current, type: option.type, scheme: option.scheme })); rememberTab(option.type === "FD" ? "deposit-fd" : "deposit"); }} />{option.label}</label>)}
        </fieldset>}
      </Card>
      <TermDepositDemo visible={tab === "deposit" && form.type === "FD"} />
      <ShareAccountDemo visible={tab === "share"} />
      <GeneralFundDemo visible={tab === "gf"} />
      <ThriftFundDemo visible={tab === "tf"} />
      <LoanAccountDemo visible={tab === "loan"} />
      <div className="space-y-5" hidden={tab !== "deposit" || form.type === "FD"}>
      <Card title="Account Opening Details">
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <TextField label="Member no." value={form.member} onChange={(v) => set("member", v)} required />
            <TextField label="Member name" value={form.name} onChange={(v) => set("name", v)} required />
            <TextField label="Interest rate (p.a.) %" value={form.rate} onChange={(v) => set("rate", v)} inputMode="decimal" required />
            <TextField label="Account no." value={form.account} onChange={(v) => set("account", v)} required />
            <SelectField label="Account holder" value={form.holder} onChange={(v) => set("holder", v)} options={[{ value: "Self", label: "Self" }, { value: "Joint", label: "Joint" }]} />
            <TextField label="Installment amount" value={form.installment} onChange={(v) => set("installment", v)} inputMode="decimal" />
            <TextField label="Scheme / Product" value={form.scheme} onChange={(v) => set("scheme", v)} required />
            <TextField label="Deposit amount" value={form.amount} onChange={(v) => set("amount", v)} inputMode="decimal" required />
            <DateField label="Maturity date" value={form.maturity} onChange={(v) => set("maturity", v)} />
            <DateField label="Opening date" value={form.date} onChange={(v) => set("date", v)} required />
            <TextField label="Opening balance" value={form.balance} onChange={(v) => set("balance", v)} inputMode="decimal" required />
            <TextField label="Remarks" value={form.remarks} onChange={(v) => set("remarks", v)} />
          </div>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <BatchFormActions editing={Boolean(form.id)} clear={clear} />
        </form>
      </Card>
      <DataTable data={rows} columns={columns} getRowKey={(row) => row.id} minHeight="0" minWidth="1050px" title="Batch Entry List (Current Session)" description={`Total: ${rows.length}  |  Amount: ₹ ${money(total)}`} emptyTitle="No batch entries" emptyMessage="Add an account above to begin." selection={{ getRowKey: (row) => row.id, selectedKeys: selected, onSelectionChange: setSelected }} rowActions={{ header: "Action", render: (row) => <div className="flex gap-1"><Button size="sm" variant="secondary" icon={Pencil} aria-label={`Edit ${row.account}`} onClick={() => edit(row)} /><Button size="sm" variant="danger" icon={Trash2} aria-label={`Delete ${row.account}`} onClick={() => remove([row.id])} /></div> }} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="danger" icon={Trash2} disabled={!selected.length} onClick={() => remove(selected)}>Delete selected ({selected.length})</Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={FileUp} disabled>Import from Excel</Button>
          <Button variant="secondary" icon={FileDown} disabled>Export to Excel</Button>
          <Button icon={Check} disabled>Finalize batch</Button>
        </div>
        <p className="w-full text-sm text-muted">Import, export and finalization will be available after backend integration.</p>
      </div>
      </div>
    </div>
  );
}
