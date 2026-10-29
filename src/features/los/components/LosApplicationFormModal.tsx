"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Plus, Trash2, Users, User } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SelectField, TextField } from "@/components/ui/Form";
import { Badge } from "@/components/ui/Badge";
import {
  fetchBorrowerLookup,
  submitLoanApplication,
  submitLoanApplicationBulk,
  updateLoanApplication,
} from "../services/los-client";
import { fetchBranchList } from "@/features/master/branch/services/branch-client";
import { fetchLoanSchemeSetups } from "@/features/master/loan-schemes/services/loan-schemes-client";
import { fetchStaffList } from "@/features/master/staff/services/staff-client";
import { fetchGroups } from "@/features/onboarding/group-management/services/group-client";
import type {
  LoanApplicationBulkAddMember,
  LoanApplicationRow,
  LoanBorrowerLookupItem,
} from "../types/los.types";

type LosApplicationFormModalProps = {
  open: boolean;
  editingApp?: LoanApplicationRow | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function LosApplicationFormModal({
  open,
  editingApp,
  onClose,
  onSuccess,
}: LosApplicationFormModalProps) {
  const isEdit = Boolean(editingApp);
  const [custTypeCd, setCustTypeCd] = useState<2 | 1>(editingApp?.cust_type_cd === 1 ? 1 : 2);

  // Common fields
  const [applicationDate, setApplicationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [branchId, setBranchId] = useState("");
  const [schemeId, setSchemeId] = useState("");
  const [foId, setFoId] = useState("");
  const [applTenure, setApplTenure] = useState("12");
  const [repayDurationCd, setRepayDurationCd] = useState("4"); // 4 Monthly
  const [remarks, setRemarks] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Individual fields
  const [borrowerSearch, setBorrowerSearch] = useState("");
  const [borrowerCandidates, setBorrowerCandidates] = useState<LoanBorrowerLookupItem[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState<LoanBorrowerLookupItem | null>(null);
  const [applAmount, setApplAmount] = useState("");
  const [purposeId, setPurposeId] = useState("");

  // Group JLG fields
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupMembers, setGroupMembers] = useState<
    Array<{
      customer_id: number;
      member_name: string;
      ref_code: string;
      requested_amount: string;
      loan_purpose: string;
      monthly_income: string;
      monthly_expense: string;
      existing_loan_obligation: string;
    }>
  >([]);

  // Master options
  const [branches, setBranches] = useState<{ value: string; label: string }[]>([]);
  const [schemes, setSchemes] = useState<
    Array<{ value: string; label: string; minAmount?: number; maxAmount?: number; maxDuration?: number; rate?: number }>
  >([]);
  const [staff, setStaff] = useState<{ value: string; label: string }[]>([]);
  const [groups, setGroups] = useState<{ value: string; label: string; branchId?: number }[]>([]);

  // Add Member Modal State
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberModalError, setMemberModalError] = useState<string | null>(null);
  const [loadingGroupMembers, setLoadingGroupMembers] = useState(false);
  const [availableRoster, setAvailableRoster] = useState<LoanBorrowerLookupItem[]>([]);
  const [selectedMemberCandidate, setSelectedMemberCandidate] = useState<LoanBorrowerLookupItem | null>(null);
  const [manualMemberId, setManualMemberId] = useState("");
  const [manualMemberName, setManualMemberName] = useState("");
  const [memberRequestedAmount, setMemberRequestedAmount] = useState("25000");
  const [memberLoanPurpose, setMemberLoanPurpose] = useState("Dairy / Enterprise");
  const [memberMonthlyIncome, setMemberMonthlyIncome] = useState("25000");
  const [memberMonthlyExpense, setMemberMonthlyExpense] = useState("12000");
  const [memberExistingObligation, setMemberExistingObligation] = useState("0");

  const [loadingLookups, setLoadingLookups] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFormError(null);

    // Load branches
    fetchBranchList({ page: 1, perPage: 100, isActive: 1 })
      .then((res) => {
        setBranches(res.items.map((b) => ({ value: String(b.branchId), label: b.branchName })));
      })
      .catch(() => {});

    // Load schemes
    fetchLoanSchemeSetups({ page: 1, perPage: 100, isActive: 1 })
      .then((res) => {
        setSchemes(
          res.items.map((s) => ({
            value: String(s.id),
            label: `${s.schemeName} (${s.schemeCode})`,
            rate: s.roiPercent,
          })),
        );
      })
      .catch(() => {});

    // Load groups
    fetchGroups({ page: 1, perPage: 100, statusCd: 1 })
      .then((res) => {
        setGroups(res.items.map((g) => ({ value: String(g.groupId), label: `${g.groupName} (${g.groupCode})`, branchId: g.branchId })));
      })
      .catch(() => {});

    if (editingApp) {
      setCustTypeCd(editingApp.cust_type_cd === 1 ? 1 : 2);
      setApplicationDate(editingApp.application_date || new Date().toISOString().slice(0, 10));
      setBranchId(String(editingApp.branch_id || ""));
      setSchemeId(String(editingApp.scheme_id || ""));
      setFoId(editingApp.fo_id ? String(editingApp.fo_id) : "");
      setApplAmount(String(editingApp.appl_amount || ""));
      setApplTenure(String(editingApp.appl_tenure || "12"));
      setRepayDurationCd(String(editingApp.repay_duration_cd || "4"));
      setRemarks(editingApp.remarks || "");
      setBeneficiaryName(editingApp.beneficiary_name || "");
      setBankAccountNo(editingApp.bank_account_no || "");
      setIfscCode(editingApp.ifsc_code || "");
    } else {
      setCustTypeCd(2);
      setApplAmount("");
      setSelectedBorrower(null);
      setGroupMembers([]);
      setRemarks("");
    }
  }, [open, editingApp]);

  // Load staff when branch changes
  useEffect(() => {
    if (!branchId) {
      setStaff([]);
      return;
    }
    fetchStaffList({ page: 1, perPage: 100, branchId: Number(branchId), status: 1 })
      .then((res) => {
        setStaff(res.items.map((s) => ({ value: String(s.staffId), label: `${s.fullName} (${s.employeeCode})` })));
      })
      .catch(() => setStaff([]));
  }, [branchId]);

  // Search & load borrowers
  useEffect(() => {
    if (!open || custTypeCd !== 2 || isEdit) {
      setBorrowerCandidates([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoadingLookups(true);
      fetchBorrowerLookup({
        keyword: borrowerSearch.trim() || undefined,
        branch_id: branchId ? Number(branchId) : undefined,
        eligible_only: false, // show all so we can display eligibility status
        per_page: 8,
      })
        .then((res) => setBorrowerCandidates(res.items))
        .catch(() => setBorrowerCandidates([]))
        .finally(() => setLoadingLookups(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [borrowerSearch, branchId, custTypeCd, open, isEdit]);

  const selectedSchemeObj = schemes.find((s) => s.value === schemeId);

  const handleOpenAddMemberModal = () => {
    setMemberModalError(null);
    setSelectedMemberCandidate(null);
    setManualMemberId("");
    setManualMemberName("");
    setMemberRequestedAmount("25000");
    setMemberLoanPurpose("Dairy / Enterprise");
    setMemberMonthlyIncome("25000");
    setMemberMonthlyExpense("12000");
    setMemberExistingObligation("0");
    setMemberModalOpen(true);

    if (selectedGroupId) {
      setLoadingGroupMembers(true);
      fetchBorrowerLookup({
        group_id: Number(selectedGroupId),
        cust_type_cd: 1,
        eligible_only: false,
        per_page: 50,
      })
        .then((res) => setAvailableRoster(res.items))
        .catch(() => setAvailableRoster([]))
        .finally(() => setLoadingGroupMembers(false));
    } else {
      setAvailableRoster([]);
    }
  };

  const handleSelectMemberCandidate = (b: LoanBorrowerLookupItem) => {
    setSelectedMemberCandidate(b);
    setManualMemberId(String(b.member_id));
    setManualMemberName(b.member_name);
    if (b.monthly_income) setMemberMonthlyIncome(String(b.monthly_income));
    if (b.monthly_expense) setMemberMonthlyExpense(String(b.monthly_expense));
  };

  const handleConfirmAddMember = () => {
    setMemberModalError(null);
    const memberId = selectedMemberCandidate?.member_id ?? Number(manualMemberId);
    const memberName = selectedMemberCandidate?.member_name ?? manualMemberName.trim();

    if (!memberId || isNaN(memberId)) {
      setMemberModalError("Please select a member or enter a valid Member ID");
      return;
    }
    if (!memberName) {
      setMemberModalError("Member Name is required");
      return;
    }
    if (groupMembers.some((m) => m.customer_id === memberId)) {
      setMemberModalError(`Member "${memberName}" is already added to this application.`);
      return;
    }
    const amount = Number(memberRequestedAmount);
    if (!amount || amount <= 0) {
      setMemberModalError("Please enter a valid requested loan amount");
      return;
    }

    setGroupMembers((prev) => [
      ...prev,
      {
        customer_id: memberId,
        member_name: memberName,
        ref_code: selectedMemberCandidate?.ref_code || `CUST-${memberId}`,
        requested_amount: String(amount),
        loan_purpose: memberLoanPurpose || "Enterprise",
        monthly_income: memberMonthlyIncome || "0",
        monthly_expense: memberMonthlyExpense || "0",
        existing_loan_obligation: memberExistingObligation || "0",
      },
    ]);

    setMemberModalOpen(false);
  };

  const handleRemoveGroupMember = (idx: number) => {
    setGroupMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!schemeId) {
      setFormError("Please select a Loan Scheme");
      return;
    }

    const tenure = Number(applTenure);
    if (!tenure || tenure <= 0) {
      setFormError("Valid tenure in months is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && editingApp) {
        // Edit flow
        await updateLoanApplication({
          application_id: editingApp.application_id,
          appl_amount: custTypeCd === 2 ? Number(applAmount) : undefined,
          appl_tenure: tenure,
          repay_duration_cd: Number(repayDurationCd),
          remarks: remarks || undefined,
          beneficiary_name: beneficiaryName || undefined,
          bank_account_no: bankAccountNo || undefined,
          ifsc_code: ifscCode ? ifscCode.toUpperCase() : undefined,
          fo_id: foId ? Number(foId) : undefined,
        });
      } else if (custTypeCd === 2) {
        // Individual Add
        if (!selectedBorrower) {
          setFormError("Please search and select a borrower from the list before submitting.");
          setSubmitting(false);
          return;
        }

        if (!selectedBorrower.kyc_verified) {
          setFormError(`Selected borrower "${selectedBorrower.member_name}" has KYC Pending. Per business rules, borrowers must have verified KYC to apply for a loan.`);
          setSubmitting(false);
          return;
        }

        const amount = Number(applAmount);
        if (!amount || amount <= 0) {
          setFormError("Please enter a valid loan amount");
          setSubmitting(false);
          return;
        }

        await submitLoanApplication({
          application_date: applicationDate,
          cust_type_cd: 2,
          cust_id_primary: selectedBorrower.member_id,
          scheme_id: Number(schemeId),
          appl_amount: amount,
          appl_tenure: tenure,
          repay_duration_cd: Number(repayDurationCd),
          branch_id: selectedBorrower.branch_id || (branchId ? Number(branchId) : undefined),
          fo_id: foId ? Number(foId) : undefined,
          remarks: remarks || undefined,
          beneficiary_name: beneficiaryName || selectedBorrower.member_name,
          bank_account_no: bankAccountNo || selectedBorrower.bank_account_no || undefined,
          ifsc_code: ifscCode ? ifscCode.toUpperCase() : selectedBorrower.ifsc_code || undefined,
        });
      } else {
        // Group JLG BulkAdd
        if (!selectedGroupId) {
          setFormError("Please choose an active JLG Group");
          setSubmitting(false);
          return;
        }
        if (groupMembers.length === 0) {
          setFormError("Please add at least one group member");
          setSubmitting(false);
          return;
        }

        const mappedMembers: LoanApplicationBulkAddMember[] = groupMembers.map((m) => ({
          customer_id: m.customer_id,
          requested_amount: Number(m.requested_amount) || 0,
          loan_purpose: m.loan_purpose || undefined,
          monthly_income: m.monthly_income ? Number(m.monthly_income) : undefined,
          monthly_expense: m.monthly_expense ? Number(m.monthly_expense) : undefined,
          existing_loan_obligation: m.existing_loan_obligation ? Number(m.existing_loan_obligation) : undefined,
        }));

        await submitLoanApplicationBulk({
          application_date: applicationDate,
          group_id: Number(selectedGroupId),
          scheme_id: Number(schemeId),
          appl_tenure: tenure,
          repay_duration_cd: Number(repayDurationCd),
          branch_id: branchId ? Number(branchId) : undefined,
          fo_id: foId ? Number(foId) : undefined,
          remarks: remarks || undefined,
          beneficiary_name: beneficiaryName || undefined,
          bank_account_no: bankAccountNo || undefined,
          ifsc_code: ifscCode ? ifscCode.toUpperCase() : undefined,
          members: mappedMembers,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err?.message || "Failed to submit loan application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
      title={isEdit ? `Edit Application #${editingApp?.application_no}` : "Create Loan Application"}
      size="xl"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Update Application" : "Submit Application"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <Alert tone="error">
            {formError}
          </Alert>
        )}

        {/* Customer Type Toggle (Disabled on Edit per business rules) */}
        {!isEdit && (
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Loan Category</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCustTypeCd(2)}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                  custTypeCd === 2
                    ? "border-teal-600 bg-teal-50 text-teal-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <User className="h-4 w-4" />
                Individual Loan (Single / Joint)
              </button>
              <button
                type="button"
                onClick={() => setCustTypeCd(1)}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                  custTypeCd === 1
                    ? "border-teal-600 bg-teal-50 text-teal-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Users className="h-4 w-4" />
                JLG / Group Loan (Bulk Members)
              </button>
            </div>
          </div>
        )}

        {/* SECTION 1: APPLICANT SELECTION */}
        {custTypeCd === 2 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Borrower Details</h4>
            {!isEdit ? (
              <div className="space-y-3">
                <TextField
                  label="Search Borrower *"
                  value={borrowerSearch}
                  placeholder="Type name, customer code (e.g. CUST-2026-0006), or mobile..."
                  onChange={setBorrowerSearch}
                  hint="Select a borrower from the candidate list below to link them to this loan application."
                />
                {loadingLookups && <p className="text-xs text-slate-400">Searching active borrowers...</p>}
                {!loadingLookups && borrowerCandidates.length === 0 && !selectedBorrower && borrowerSearch.trim() && (
                  <p className="text-xs text-slate-400 italic">No matching borrowers found. Ensure the borrower is registered in Onboarding & KYC Registry.</p>
                )}
                {borrowerCandidates.length > 0 && !selectedBorrower && (
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
                    {borrowerCandidates.map((b) => (
                      <button
                        key={b.member_id}
                        type="button"
                        onClick={() => {
                          setSelectedBorrower(b);
                          setBorrowerSearch(`${b.member_name} (${b.ref_code})`);
                          if (b.branch_id) setBranchId(String(b.branch_id));
                          if (b.fo_id) setFoId(String(b.fo_id));
                        }}
                        className="w-full p-2.5 text-left text-xs hover:bg-teal-50/60 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{b.member_name} · <span className="text-slate-500">{b.ref_code}</span></p>
                          <p className="text-[11px] text-slate-400">Branch: {b.branch_name} | Mobile: {b.mobile_no || "—"}</p>
                        </div>
                        <div className="text-right">
                          <Badge tone={b.kyc_verified ? "success" : "danger"}>
                            {b.kyc_verified ? "KYC Verified" : "KYC Pending"}
                          </Badge>
                          {b.overdue_amount > 0 && (
                            <p className="text-[10px] text-red-600 font-bold mt-0.5">Overdue: ₹{b.overdue_amount}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedBorrower && (
                  <div className="rounded-lg border border-teal-200 bg-teal-50/40 p-3 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-teal-900">{selectedBorrower.member_name} ({selectedBorrower.ref_code})</p>
                      <p className="text-[11px] text-teal-700 mt-0.5">
                        Branch: {selectedBorrower.branch_name} · Previous Loans: {selectedBorrower.active_loan_count} (Cycle {selectedBorrower.loan_cycle})
                      </p>
                      {!selectedBorrower.kyc_verified && (
                        <p className="text-[11px] text-red-700 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Borrower does not have verified KYC!
                        </p>
                      )}
                      {selectedBorrower.pending_application_no && (
                        <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                          Existing application pending: {selectedBorrower.pending_application_no}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedBorrower(null)}>
                      Change
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-900">
                Borrower: {editingApp?.member_name} ({editingApp?.member_ref_code})
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField
                label="Requested Loan Amount"
                value={applAmount}
                required
                restrict="decimal"
                placeholder="e.g. 40000"
                onChange={setApplAmount}
              />
              <TextField
                label="Application Date"
                type="date"
                value={applicationDate}
                onChange={setApplicationDate}
              />
            </div>
          </div>
        ) : (
          /* JLG GROUP SELECTION */
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">JLG Group & Members</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SelectField
                label="Select JLG Group"
                value={selectedGroupId}
                options={groups}
                placeholder="Choose active group"
                onChange={(val) => {
                  setSelectedGroupId(val);
                  const grp = groups.find((g) => g.value === val);
                  if (grp?.branchId) setBranchId(String(grp.branchId));
                }}
              />
              <TextField
                label="Application Date"
                type="date"
                value={applicationDate}
                onChange={setApplicationDate}
              />
            </div>

            {/* Member List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700">Participating Members ({groupMembers.length})</span>
                  {groupMembers.length > 0 && (
                    <span className="text-[11px] text-teal-700 font-semibold ml-2">
                      · Total: ₹{groupMembers.reduce((sum, m) => sum + (Number(m.requested_amount) || 0), 0).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <Button type="button" size="sm" icon={Plus} onClick={handleOpenAddMemberModal}>
                  Add Member
                </Button>
              </div>

              {groupMembers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-5 text-center">
                  <Users className="mx-auto h-6 w-6 text-slate-300 mb-1.5" />
                  <p className="text-xs font-semibold text-slate-600">No members added to this loan application yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-2.5">Add active group members who are applying for this JLG loan.</p>
                  <Button type="button" size="sm" variant="secondary" icon={Plus} onClick={handleOpenAddMemberModal}>
                    Add Member
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {groupMembers.map((m, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">{m.member_name}</span>
                        <span className="text-[11px] text-slate-400">ID: {m.customer_id} · {m.ref_code}</span>
                      </div>
                      <div className="w-32">
                        <TextField
                          label=""
                          value={m.requested_amount}
                          restrict="decimal"
                          placeholder="Amount (₹)"
                          onChange={(v) => {
                            const copy = [...groupMembers];
                            copy[idx].requested_amount = v;
                            setGroupMembers(copy);
                          }}
                        />
                      </div>
                      <div className="w-36">
                        <TextField
                          label=""
                          value={m.loan_purpose}
                          placeholder="Purpose"
                          onChange={(v) => {
                            const copy = [...groupMembers];
                            copy[idx].loan_purpose = v;
                            setGroupMembers(copy);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGroupMember(idx)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: SCHEME & TERMS */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Scheme & Repayment Terms</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Loan Scheme"
              value={schemeId}
              required
              options={schemes}
              placeholder="Select Scheme"
              onChange={setSchemeId}
            />
            <SelectField
              label="Branch"
              value={branchId}
              options={branches}
              placeholder="Branch"
              onChange={setBranchId}
            />
            <TextField
              label="Tenure (Installments)"
              value={applTenure}
              required
              restrict="digits"
              placeholder="e.g. 12"
              onChange={setApplTenure}
            />
            <SelectField
              label="Repayment Frequency"
              value={repayDurationCd}
              options={[
                { value: "1", label: "Daily" },
                { value: "2", label: "Weekly" },
                { value: "3", label: "Fortnightly" },
                { value: "4", label: "Monthly" },
                { value: "5", label: "Quarterly" },
              ]}
              onChange={setRepayDurationCd}
            />
            <SelectField
              label="Field Officer"
              value={foId}
              options={staff}
              placeholder="Assign Field Officer"
              onChange={setFoId}
            />
          </div>
        </div>

        {/* SECTION 3: BANK & REMARKS */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Disbursement Account & Remarks</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextField
              label="Beneficiary Name"
              value={beneficiaryName}
              placeholder="As per bank passbook"
              onChange={setBeneficiaryName}
            />
            <TextField
              label="Bank Account No"
              value={bankAccountNo}
              placeholder="Account Number"
              onChange={setBankAccountNo}
            />
            <TextField
              label="IFSC Code"
              value={ifscCode}
              placeholder="e.g. SBIN0001234"
              onChange={setIfscCode}
            />
          </div>
          <TextField
            label="Application Remarks"
            value={remarks}
            placeholder="Notes or business rationale"
            onChange={setRemarks}
          />
        </div>
      </form>
    </Modal>

    {/* ADD PARTICIPATING GROUP MEMBER MODAL */}
    <Modal
      open={memberModalOpen}
      onClose={() => setMemberModalOpen(false)}
      title="Add Participating Group Member"
      subtitle={
        selectedGroupId
          ? `Group: ${groups.find((g) => g.value === selectedGroupId)?.label || selectedGroupId}`
          : "Add an active member to this group loan"
      }
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setMemberModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmAddMember}>
            Add to Loan Application
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {memberModalError && (
          <Alert tone="error">
            {memberModalError}
          </Alert>
        )}

        {/* Member Selection Section */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700 block">
            1. Member Selection
          </span>

          {loadingGroupMembers ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Loading active members from selected group...
            </div>
          ) : availableRoster.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-500">
                Click a member from the group roster below to select them:
              </p>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
                {availableRoster.map((b) => {
                  const isSelected = selectedMemberCandidate?.member_id === b.member_id;
                  const isAlreadyAdded = groupMembers.some((m) => m.customer_id === b.member_id);
                  return (
                    <button
                      key={b.member_id}
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => handleSelectMemberCandidate(b)}
                      className={`w-full p-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                        isAlreadyAdded
                          ? "opacity-50 cursor-not-allowed bg-slate-50"
                          : isSelected
                            ? "bg-teal-50 border-l-4 border-teal-600"
                            : "hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {b.member_name} · <span className="text-slate-500">{b.ref_code}</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          ID: {b.member_id} | Mobile: {b.mobile_no || "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        {isAlreadyAdded ? (
                          <Badge tone="neutral">Already Added</Badge>
                        ) : (
                          <Badge tone={b.kyc_verified ? "success" : "danger"}>
                            {b.kyc_verified ? "KYC Verified" : "KYC Pending"}
                          </Badge>
                        )}
                        {b.overdue_amount > 0 && (
                          <p className="text-[10px] text-red-600 font-bold mt-0.5">Overdue: ₹{b.overdue_amount}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">
                {selectedGroupId
                  ? "No roster loaded for this group. Enter member details manually:"
                  : "No group selected. Enter member details manually:"}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  label="Member ID *"
                  value={manualMemberId}
                  restrict="digits"
                  placeholder="e.g. 9045"
                  onChange={setManualMemberId}
                />
                <TextField
                  label="Member Name *"
                  value={manualMemberName}
                  placeholder="e.g. Gita Devi"
                  onChange={setManualMemberName}
                />
              </div>
            </div>
          )}

          {selectedMemberCandidate && (
            <div className="rounded-lg border border-teal-200 bg-teal-50/70 p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-950">
                  Selected: {selectedMemberCandidate.member_name} ({selectedMemberCandidate.ref_code})
                </p>
                <p className="text-[11px] text-teal-700 mt-0.5">
                  Member ID: {selectedMemberCandidate.member_id} · Branch: {selectedMemberCandidate.branch_name}
                </p>
                {!selectedMemberCandidate.kyc_verified && (
                  <p className="text-[11px] text-red-700 font-semibold mt-1">
                    Notice: Borrower KYC is currently pending.
                  </p>
                )}
              </div>
              <Button size="sm" variant="secondary" onClick={() => setSelectedMemberCandidate(null)}>
                Change
              </Button>
            </div>
          )}
        </div>

        {/* Loan Amount & Purpose */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <span className="text-xs font-semibold text-slate-700 block">
            2. Loan Terms & Purpose
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Requested Loan Amount (₹) *"
              value={memberRequestedAmount}
              restrict="decimal"
              placeholder="25000"
              onChange={setMemberRequestedAmount}
            />
            <TextField
              label="Loan Purpose"
              value={memberLoanPurpose}
              placeholder="e.g. Dairy / Livestock / Retail"
              onChange={setMemberLoanPurpose}
            />
          </div>
        </div>

        {/* Financial Profile */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <span className="text-xs font-semibold text-slate-700 block">
            3. Financial Profile (for FOIR & Assessment)
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextField
              label="Monthly Income (₹)"
              value={memberMonthlyIncome}
              restrict="decimal"
              placeholder="25000"
              onChange={setMemberMonthlyIncome}
            />
            <TextField
              label="Monthly Expense (₹)"
              value={memberMonthlyExpense}
              restrict="decimal"
              placeholder="12000"
              onChange={setMemberMonthlyExpense}
            />
            <TextField
              label="Existing EMI (₹)"
              value={memberExistingObligation}
              restrict="decimal"
              placeholder="0"
              onChange={setMemberExistingObligation}
            />
          </div>
        </div>
      </div>
    </Modal>
    </>
  );
}
