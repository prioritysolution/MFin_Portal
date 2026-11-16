export type ThriftEntry = {
  id: string; member: string; name: string; account: string; scheme: string; date: string; remarks: string;
  installment: string; rate: string; payable: string; start: string; last: string; balance: string;
  autoCredit: boolean; closure: boolean; nominee: string; relation: string; instruction: string;
};
export const thriftExamples: ThriftEntry[] = [
  ["Sushanta Mondal", "MBR000458", "TF/000091", "500", "6000"],
  ["Arup Das", "MBR000459", "TF/000092", "1000", "12000"],
  ["Mita Saha", "MBR000460", "TF/000093", "250", "3000"],
  ["Tapas Pal", "MBR000461", "TF/000094", "250", "3000"],
].map(([name, member, account, installment, balance], i) => ({
  id: `tf-${i + 1}`, name, member, account, installment, balance, scheme: "TF - Thrift Fund", date: "2026-04-01",
  remarks: "Opening as per manual record", rate: "6.50", payable: "Yearly", start: "2026-04-01", last: "2026-03-31",
  autoCredit: true, closure: true, nominee: i === 0 ? "Madhumita Mondal" : "", relation: i === 0 ? "Spouse" : "", instruction: "Pay Principal + Interest",
}));

export type LoanEntry = {
  id: string; member: string; name: string; account: string; product: string; sanctionNo: string;
  sanctionDate: string; disbursementDate: string; sanction: string; disbursement: string; rate: string;
  repayment: string; tenure: string; emi: string; repaymentStart: string; maturity: string;
  principal: string; overduePrincipal: string; interest: string; overdueInterest: string; remarks: string;
};
export const loanExamples: LoanEntry[] = [
  ["Sushanta Mondal", "MBR000458", "LN/000987", "PL - Personal Loan", "200000", "180000", "5000", "3200", "1250"],
  ["Arup Das", "MBR000459", "LN/000988", "BL - Business Loan", "500000", "492000", "0", "0", "0"],
  ["Mita Saha", "MBR000460", "LN/000989", "HL - Housing Loan", "1000000", "670000", "0", "0", "0"],
  ["Tapas Pal", "MBR000461", "LN/000990", "VL - Vehicle Loan", "250000", "238000", "0", "0", "0"],
].map(([name, member, account, product, sanction, principal, overduePrincipal, interest, overdueInterest], i) => ({
  id: `loan-${i + 1}`, name, member, account, product, sanction, principal, overduePrincipal, interest, overdueInterest,
  sanctionNo: i === 0 ? "SAN/2026/00125" : "", sanctionDate: "2026-03-20", disbursementDate: "2026-03-25",
  disbursement: sanction, rate: "12.00", repayment: "EMI", tenure: "36", emi: "6644", repaymentStart: "2026-04-01", maturity: "2029-03-01", remarks: "Opening as per manual record",
}));
