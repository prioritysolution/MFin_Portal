export type ShareEntry = {
  id: string; member: string; name: string; account: string; scheme: string; date: string;
  remarks: string; shares: string; faceValue: string; premium: string; dividend: boolean;
  dividendRate: string; dividendDate: string; nominee: string; relation: string;
};

// Session-only examples, to be replaced by the share account API.
export const shareExamples: ShareEntry[] = [
  ["Sushanta Mondal", "MBR000458", "SH/001245", "100"],
  ["Arup Das", "MBR000459", "SH/001246", "250"],
  ["Mita Saha", "MBR000460", "SH/001247", "50"],
  ["Tapas Pal", "MBR000461", "SH/001248", "150"],
].map(([name, member, account, shares], index) => ({
  id: `share-${index + 1}`, name, member, account, shares, scheme: "SC - Share Capital",
  date: "2026-04-01", remarks: "Opening as per manual record", faceValue: "100.00",
  premium: "0.00", dividend: true, dividendRate: "12.00", dividendDate: "2026-04-01",
  nominee: index === 0 ? "Madhumita Mondal" : "", relation: index === 0 ? "Spouse" : "",
}));
export const initialShareEntry: ShareEntry = { ...shareExamples[0], id: "" };
