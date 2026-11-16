export type BatchEntry = {
  id: string; type: string; account: string; member: string; name: string;
  scheme: string; date: string; balance: string; holder: string; amount: string;
  rate: string; installment: string; maturity: string; remarks: string;
};

// Temporary session-only examples; replace this module when the backend is available.
export const demoEntries: BatchEntry[] = [
  ["RD", "RD/000565", "MBR000452", "Arup Das", "RD - Regular Deposit", "5000"],
  ["FD", "FD/000132", "MBR000453", "Mita Saha", "FD - Term Deposit (12M)", "50000"],
  ["SHARE", "SH/001245", "MBR000454", "Tapas Pal", "Share Capital", "1000"],
  ["GF", "GF/000078", "MBR000455", "Kabita Roy", "General Fund", "2000"],
  ["TF", "TF/000091", "MBR000456", "Bimal Karmakar", "Thrift Fund", "3000"],
  ["LOAN", "LN/000987", "MBR000457", "Subhas Ghosh", "Personal Loan", "150000"],
].map(([type, account, member, name, scheme, balance], index) => ({
  id: String(index + 1), type, account, member, name, scheme, balance,
  date: "2026-04-01", holder: "Self", amount: balance, rate: "6.50",
  installment: "", maturity: "", remarks: "",
}));

export const initialEntry: BatchEntry = {
  id: "", type: "RD", account: "RD/000567", member: "MBR000458", name: "Sushanta Mondal",
  scheme: "RD - Regular Deposit", date: "2026-04-01", balance: "10000", holder: "Self",
  amount: "10000", rate: "6.50", installment: "1000", maturity: "2027-04-01",
  remarks: "Opening as per manual record",
};
