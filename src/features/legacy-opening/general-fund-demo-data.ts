export type GeneralFundEntry = {
  id: string; member: string; name: string; account: string; scheme: string; date: string;
  remarks: string; balance: string; rate: string; payable: string; interestStart: string;
  interestPaidUntil: string; autoCredit: boolean; closureAllowed: boolean; nominee: string; relation: string;
};

// Temporary session-only examples for the General Fund screen.
export const generalFundExamples: GeneralFundEntry[] = [
  ["Sushanta Mondal", "MBR000458", "GF/000078", "2000"],
  ["Arup Das", "MBR000459", "GF/000079", "1500"],
  ["Mita Saha", "MBR000460", "GF/000080", "3000"],
  ["Tapas Pal", "MBR000461", "GF/000081", "1000"],
].map(([name, member, account, balance], index) => ({
  id: `gf-${index + 1}`, name, member, account, balance, scheme: "GF - General Fund", date: "2026-04-01",
  remarks: "Opening as per manual record", rate: "6.00", payable: "Yearly", interestStart: "2026-04-01",
  interestPaidUntil: "2026-03-31", autoCredit: true, closureAllowed: true,
  nominee: index === 0 ? "Madhumita Mondal" : "", relation: index === 0 ? "Spouse" : "",
}));
export const initialGeneralFundEntry: GeneralFundEntry = { ...generalFundExamples[0], id: "" };
