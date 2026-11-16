export type TermEntry = {
  id: string; member: string; name: string; account: string; product: string; scheme: string;
  date: string; amount: string; rate: string; payout: string; compounding: string; tenure: string;
  maturity: string; maturityAmount: string; tdsApplicable: boolean; tdsRate: string; remarks: string;
};

// Temporary examples for the session-only term deposit screen.
export const termExamples: TermEntry[] = [
  ["Sushanta Mondal", "MBR000458", "FD/000567", "12", "500000", "7.50", "2027-04-01", "538641"],
  ["Arup Das", "MBR000459", "FD/000568", "24", "1000000", "7.75", "2028-04-01", "1166129"],
  ["Mita Saha", "MBR000460", "FD/000569", "36", "250000", "8.00", "2029-04-01", "315354"],
  ["Tapas Pal", "MBR000461", "FD/000570", "12", "100000", "7.50", "2027-04-01", "107728"],
].map(([name, member, account, tenure, amount, rate, maturity, maturityAmount], index) => ({
  id: `term-${index + 1}`, name, member, account, tenure, amount, rate, maturity, maturityAmount,
  product: "FD - Fixed Deposit", scheme: `FD - ${tenure} Months`, date: "2026-04-01",
  payout: "On Maturity", compounding: "Quarterly", tdsApplicable: false, tdsRate: "10.00",
  remarks: "Opening as per manual record",
}));

export const initialTermEntry: TermEntry = { ...termExamples[0], id: "" };
