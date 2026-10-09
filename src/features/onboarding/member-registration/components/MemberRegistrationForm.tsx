"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User,
  Users,
  Building2,
  Phone,
  CreditCard,
  Briefcase,
  FileText,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  DateField,
  SelectField,
  TextField,
  TextAreaField,
} from "@/components/ui/Form";
import type { SelectOption } from "@/components/ui/Select";
import type { Member, MemberSaveInput } from "../types/member.types";
import type { Branch } from "@/features/master/branch/types/branch.types";
import type { Center } from "@/features/master/center/types/center.types";
import type { Staff } from "@/features/master/staff/types/staff.types";
import type { ApplOption } from "@/features/master/appl-options/types/appl-options.types";
import { fetchCenterList } from "@/features/master/center/services/center-client";
import { fetchStaffList } from "@/features/master/staff/services/staff-client";

export type MemberFormState = {
  // 1. Basic Details
  memberName: string;
  genderCd: string;
  dateOfBirth: string;
  refCode: string;
  statusCd: "1" | "2";

  // 2. Family & Social
  fatherName: string;
  motherName: string;
  spouseName: string;
  maritalStatusCd: string;
  religionCd: string;
  casteCd: string;

  // 3. Contact & Identity
  mobileNo: string;
  alternateMobileNo: string;
  emailId: string;
  panNo: string;

  // 4. Branch & Location
  branchId: string;
  centerId: string;
  foId: string;
  joiningDate: string;

  // 5. Financial & Banking
  occupationDetails: string;
  monthlyIncome: string;
  monthlyExpense: string;
  bankName: string;
  bankBranch: string;
  bankAccountNo: string;
  ifscCode: string;
  admFees: string;

  // 6. Nominee & Remarks
  nomineeName: string;
  nomineeRelation: string;
  nomineeDob: string;
  nomineeMobile: string;
  remarks: string;
};

const EMPTY_FORM: MemberFormState = {
  memberName: "",
  genderCd: "",
  dateOfBirth: "",
  refCode: "",
  statusCd: "1",

  fatherName: "",
  motherName: "",
  spouseName: "",
  maritalStatusCd: "",
  religionCd: "",
  casteCd: "",

  mobileNo: "",
  alternateMobileNo: "",
  emailId: "",
  panNo: "",

  branchId: "",
  centerId: "",
  foId: "",
  joiningDate: "",

  occupationDetails: "",
  monthlyIncome: "",
  monthlyExpense: "",
  bankName: "",
  bankBranch: "",
  bankAccountNo: "",
  ifscCode: "",
  admFees: "",

  nomineeName: "",
  nomineeRelation: "",
  nomineeDob: "",
  nomineeMobile: "",
  remarks: "",
};

function resolveRelationCode(
  stored: string | null | undefined,
  options: ApplOption[],
): string {
  if (!stored) return "";
  const byCode = options.find((opt) => String(opt.optCode) === stored);
  if (byCode) return String(byCode.optCode);
  const byLabel = options.find((opt) => opt.optDescription === stored);
  return byLabel ? String(byLabel.optCode) : stored;
}

function calculateAge(dobStr: string): number | null {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export type MemberRegistrationFormProps = {
  open: boolean;
  editing: Member | null;
  branches: Branch[];
  genderOptions: ApplOption[];
  maritalOptions: ApplOption[];
  religionOptions: ApplOption[];
  casteOptions: ApplOption[];
  relationOptions: ApplOption[];
  isBranchBound?: boolean;
  userBranchId?: number;
  serverFieldErrors?: Partial<Record<keyof MemberFormState, string>>;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (input: MemberSaveInput) => Promise<void> | void;
};

export function MemberRegistrationForm({
  open,
  editing,
  branches,
  genderOptions,
  maritalOptions,
  religionOptions,
  casteOptions,
  relationOptions,
  isBranchBound = false,
  userBranchId,
  serverFieldErrors = {},
  submitting = false,
  onClose,
  onSubmit,
}: MemberRegistrationFormProps) {
  const [form, setForm] = useState<MemberFormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof MemberFormState, string>>>({});
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Sync state when open or editing changes
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        memberName: editing.memberName || "",
        genderCd: editing.genderCd ? String(editing.genderCd) : "",
        dateOfBirth: editing.dateOfBirth || "",
        refCode: editing.refCode || "",
        statusCd: editing.statusCd === 2 ? "2" : "1",

        fatherName: editing.fatherName || "",
        motherName: editing.motherName || "",
        spouseName: editing.spouseName || "",
        maritalStatusCd: editing.maritalStatusCd ? String(editing.maritalStatusCd) : "",
        religionCd: editing.religionCd ? String(editing.religionCd) : "",
        casteCd: editing.casteCd ? String(editing.casteCd) : "",

        mobileNo: editing.mobileNo || "",
        alternateMobileNo: editing.alternateMobileNo || "",
        emailId: editing.emailId || "",
        panNo: editing.panNo || "",

        branchId: String(editing.branchId || ""),
        centerId: editing.centerId ? String(editing.centerId) : "",
        foId: editing.foId ? String(editing.foId) : "",
        joiningDate: editing.joiningDate || "",

        occupationDetails: editing.occupationDetails || "",
        monthlyIncome: editing.monthlyIncome != null ? String(editing.monthlyIncome) : "",
        monthlyExpense: editing.monthlyExpense != null ? String(editing.monthlyExpense) : "",
        bankName: editing.bankName || "",
        bankBranch: editing.bankBranch || "",
        bankAccountNo: editing.bankAccountNo || "",
        ifscCode: editing.ifscCode || "",
        admFees: editing.admFees != null ? String(editing.admFees) : "",

        nomineeName: editing.nomineeName || "",
        nomineeRelation: resolveRelationCode(editing.nomineeRelation, relationOptions),
        nomineeDob: editing.nomineeDob || "",
        nomineeMobile: editing.nomineeMobile || "",
        remarks: editing.remarks || "",
      });
    } else {
      const defaultBranch = isBranchBound && userBranchId ? String(userBranchId) : branches[0] ? String(branches[0].branchId) : "";
      setForm({
        ...EMPTY_FORM,
        branchId: defaultBranch,
        joiningDate: today,
      });
    }
    setFieldErrors({});
  }, [open, editing, branches, isBranchBound, userBranchId, today, relationOptions]);

  // Merge server-side errors
  useEffect(() => {
    if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...serverFieldErrors }));
    }
  }, [serverFieldErrors]);

  const updateField = <K extends keyof MemberFormState>(key: K, value: MemberFormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "branchId" && value !== prev.branchId) {
        next.centerId = "";
        next.foId = "";
      }
      return next;
    });
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Calculated Age
  const calculatedAge = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);

  const [branchCenters, setBranchCenters] = useState<Center[]>([]);
  const [branchStaff, setBranchStaff] = useState<Staff[]>([]);

  useEffect(() => {
    if (!open) return;
    const branchId = Number(form.branchId);
    if (!branchId) {
      setBranchCenters([]);
      setBranchStaff([]);
      return;
    }

    let active = true;
    Promise.all([
      fetchCenterList({ page: 1, perPage: 200, branchId, isActive: 1 }).catch(() => ({
        items: [] as Center[],
      })),
      fetchStaffList({ page: 1, perPage: 200, branchId, status: 1 }).catch(() => ({
        items: [] as Staff[],
      })),
    ]).then(([centerResult, staffResult]) => {
      if (!active) return;
      const nextCenters = [...centerResult.items];
      if (
        editing?.centerId &&
        editing.branchId === branchId &&
        !nextCenters.some((center) => center.centerId === editing.centerId)
      ) {
        nextCenters.unshift({
          centerId: editing.centerId,
          branchId,
          branchCode: null,
          branchName: null,
          centerName: editing.centerName || `Center ${editing.centerId}`,
          centerAddress: null,
          isActive: false,
        });
      }
      const nextStaff = [...staffResult.items];
      if (
        editing?.foId &&
        editing.branchId === branchId &&
        !nextStaff.some((person) => person.staffId === editing.foId)
      ) {
        nextStaff.unshift({
          staffId: editing.foId,
          branchId,
          employeeCode: editing.foCode || "",
          fullName: editing.foName || `Officer ${editing.foId}`,
          shortName: null,
          designationId: null,
          designationName: null,
          mobile: null,
          email: null,
          joinDate: null,
          aadhaar: null,
          pan: null,
          deviceId: null,
          userId: null,
          status: 1,
          moduleAccess: [],
          createdAt: null,
          updatedAt: null,
        });
      }
      setBranchCenters(nextCenters);
      setBranchStaff(nextStaff);
    });

    return () => {
      active = false;
    };
  }, [open, form.branchId, editing]);

  const branchOptions: SelectOption[] = useMemo(() => {
    const options = branches.map((b) => ({
      value: String(b.branchId),
      label: `${b.branchName} (${b.branchCode})`,
    }));
    if (editing && !branches.some((branch) => branch.branchId === editing.branchId)) {
      options.unshift({
        value: String(editing.branchId),
        label: editing.branchName || `Branch ${editing.branchId}`,
      });
    }
    return options;
  }, [branches, editing]);

  const centerOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "None / Not Assigned" },
      ...branchCenters.map((c) => ({
        value: String(c.centerId),
        label: c.centerName,
      })),
    ],
    [branchCenters],
  );

  const staffOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "None / Not Assigned" },
      ...branchStaff.map((s) => ({
        value: String(s.staffId),
        label: `${s.fullName} (${s.employeeCode})`,
      })),
    ],
    [branchStaff],
  );

  const genderSelectOptions: SelectOption[] = useMemo(
    () =>
      genderOptions.map((opt) => ({
        id: String(opt.optionId),
        value: String(opt.optCode),
        label: opt.optDescription,
      })),
    [genderOptions],
  );

  const maritalSelectOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "Select Marital Status" },
      ...maritalOptions.map((opt) => ({
        id: String(opt.optionId),
        value: String(opt.optCode),
        label: opt.optDescription,
      })),
    ],
    [maritalOptions],
  );

  const religionSelectOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "Select Religion" },
      ...religionOptions.map((opt) => ({
        id: String(opt.optionId),
        value: String(opt.optCode),
        label: opt.optDescription,
      })),
    ],
    [religionOptions],
  );

  const casteSelectOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "Select Caste" },
      ...casteOptions.map((opt) => ({
        id: String(opt.optionId),
        value: String(opt.optCode),
        label: opt.optDescription,
      })),
    ],
    [casteOptions],
  );

  const relationSelectOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: "Select relationship" },
      ...relationOptions.map((opt) => ({
        id: String(opt.optionId),
        value: String(opt.optCode),
        label: opt.optDescription,
      })),
    ],
    [relationOptions],
  );

  const validate = (): boolean => {
    const errs: Partial<Record<keyof MemberFormState, string>> = {};

    // 1. Required fields
    if (!form.memberName.trim()) {
      errs.memberName = "Member name is required (max 150 characters)";
    } else if (form.memberName.trim().length > 150) {
      errs.memberName = "Member name cannot exceed 150 characters";
    }

    if (!form.genderCd) {
      errs.genderCd = "Please select gender";
    }

    if (!form.dateOfBirth) {
      errs.dateOfBirth = "Date of birth is required";
    } else {
      const age = calculateAge(form.dateOfBirth);
      if (age == null || age < 18 || age > 100) {
        errs.dateOfBirth = "Member must be between 18 and 100 years old";
      }
    }

    if (!form.mobileNo.trim()) {
      errs.mobileNo = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.mobileNo.trim())) {
      errs.mobileNo = "Must be a valid 10-digit mobile number starting with 6-9";
    }

    if (!form.branchId) {
      errs.branchId = "Branch selection is required";
    }

    // 2. Joining date validation
    if (form.joiningDate) {
      if (form.joiningDate > today) {
        errs.joiningDate = "Joining date cannot be in the future";
      }
      if (form.dateOfBirth) {
        const dob = new Date(form.dateOfBirth);
        const jd = new Date(form.joiningDate);
        if (!isNaN(dob.getTime()) && !isNaN(jd.getTime())) {
          let ageAtJoining = jd.getFullYear() - dob.getFullYear();
          const m = jd.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && jd.getDate() < dob.getDate())) {
            ageAtJoining--;
          }
          if (ageAtJoining < 18) {
            errs.joiningDate = "Member must be at least 18 years old on joining date";
          }
        }
      }
    }

    // 3. Alternate Mobile
    if (form.alternateMobileNo.trim()) {
      if (!/^[6-9]\d{9}$/.test(form.alternateMobileNo.trim())) {
        errs.alternateMobileNo = "Must be a valid 10-digit number starting with 6-9";
      } else if (form.alternateMobileNo.trim() === form.mobileNo.trim()) {
        errs.alternateMobileNo = "Alternate mobile must be different from primary mobile";
      }
    }

    // 4. PAN Number
    if (form.panNo.trim()) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNo.trim())) {
        errs.panNo = "Invalid PAN format (e.g. ABCDE1234F)";
      }
    }

    // 5. Email
    if (form.emailId.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailId.trim())) {
        errs.emailId = "Invalid email address format";
      }
    }

    // 6. Bank & IFSC - Must be given together
    const hasBankAcc = Boolean(form.bankAccountNo.trim());
    const hasIfsc = Boolean(form.ifscCode.trim());
    if (hasBankAcc || hasIfsc) {
      if (!hasBankAcc) {
        errs.bankAccountNo = "Bank account number is required when IFSC is provided";
      } else if (!/^\d{6,20}$/.test(form.bankAccountNo.trim())) {
        errs.bankAccountNo = "Account number must be 6 to 20 digits";
      }

      if (!hasIfsc) {
        errs.ifscCode = "IFSC code is required when bank account is provided";
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.trim())) {
        errs.ifscCode = "Invalid IFSC format (e.g. SBIN0001234)";
      }
    }

    // 7. Nominee validation
    const hasNomineeDetails =
      Boolean(form.nomineeName.trim()) ||
      Boolean(form.nomineeRelation.trim()) ||
      Boolean(form.nomineeDob) ||
      Boolean(form.nomineeMobile.trim());

    if (hasNomineeDetails) {
      if (!form.nomineeName.trim()) {
        errs.nomineeName = "Nominee name is required";
      }
      if (!form.nomineeRelation.trim()) {
        errs.nomineeRelation = "Nominee relationship is required";
      }
      if (form.nomineeDob && form.nomineeDob > today) {
        errs.nomineeDob = "Nominee DOB cannot be in the future";
      }
      if (form.nomineeMobile.trim() && !/^[6-9]\d{9}$/.test(form.nomineeMobile.trim())) {
        errs.nomineeMobile = "Must be a valid 10-digit mobile number";
      }
    }

    // 8. Financial limits
    if (form.monthlyIncome.trim()) {
      const inc = Number(form.monthlyIncome);
      if (isNaN(inc) || inc < 0 || inc > 999999.99) {
        errs.monthlyIncome = "Income must be between 0 and 999,999.99";
      }
    }
    if (form.monthlyExpense.trim()) {
      const exp = Number(form.monthlyExpense);
      if (isNaN(exp) || exp < 0 || exp > 999999.99) {
        errs.monthlyExpense = "Expense must be between 0 and 999,999.99";
      }
    }
    if (form.admFees.trim()) {
      const fees = Number(form.admFees);
      if (isNaN(fees) || fees < 0 || fees > 9999.99) {
        errs.admFees = "Admission fees must be between 0 and 9,999.99";
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: MemberSaveInput = {
      ...(editing ? { memberId: editing.memberId } : {}),
      memberName: form.memberName.trim(),
      genderCd: Number(form.genderCd),
      dateOfBirth: form.dateOfBirth,
      mobileNo: form.mobileNo.trim(),
      branchId: Number(form.branchId),
      refCode: form.refCode.trim() || null,
      fatherName: form.fatherName.trim() || null,
      motherName: form.motherName.trim() || null,
      spouseName: form.spouseName.trim() || null,
      maritalStatusCd: form.maritalStatusCd ? Number(form.maritalStatusCd) : null,
      religionCd: form.religionCd ? Number(form.religionCd) : null,
      casteCd: form.casteCd ? Number(form.casteCd) : null,
      alternateMobileNo: form.alternateMobileNo.trim() || null,
      emailId: form.emailId.trim().toLowerCase() || null,
      panNo: form.panNo.trim().toUpperCase() || null,
      centerId: form.centerId ? Number(form.centerId) : null,
      joiningDate: form.joiningDate || null,
      occupationDetails: form.occupationDetails.trim() || null,
      monthlyIncome: form.monthlyIncome.trim() ? Number(form.monthlyIncome) : null,
      monthlyExpense: form.monthlyExpense.trim() ? Number(form.monthlyExpense) : null,
      bankName: form.bankName.trim() || null,
      bankBranch: form.bankBranch.trim() || null,
      bankAccountNo: form.bankAccountNo.trim() || null,
      ifscCode: form.ifscCode.trim().toUpperCase() || null,
      nomineeName: form.nomineeName.trim() || null,
      nomineeRelation: form.nomineeRelation.trim() || null,
      nomineeDob: form.nomineeDob || null,
      nomineeMobile: form.nomineeMobile.trim() || null,
      foId: form.foId ? Number(form.foId) : null,
      photoPath: editing?.photoPath ?? null,
      signaturePath: editing?.signaturePath ?? null,
      admFees: form.admFees.trim() ? Number(form.admFees) : null,
      remarks: form.remarks.trim() || null,
      ...(!editing ? { statusCd: form.statusCd === "2" ? 2 : 1 } : {}),
    };

    await onSubmit(payload);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={editing ? `Edit Member: ${editing.memberName}` : "Register New Member"}
        subtitle={
          editing
            ? `Update member record (Ref: ${editing.refCode || editing.memberCode})`
            : "Fill in the required information to onboard a new member"
        }
        size="xl"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-muted">
              <span className="text-rose-500">*</span> Required fields
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={submitting}
              >
                {editing ? "Save Changes" : "Create Member"}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic & Demographic Details */}
          <section className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-800 uppercase">
              <User className="h-4 w-4 text-brand" />
              1. Basic & Identity Details
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Member Name */}
              <div className="lg:col-span-2">
                <TextField
                  label="Member Full Name"
                  required
                  value={form.memberName}
                  onChange={(val) => updateField("memberName", val)}
                  error={fieldErrors.memberName}
                  placeholder="e.g. Rina Das"
                />
              </div>

              {/* Ref Code (Display ID) */}
              <div>
                <TextField
                  label="Display Ref Code"
                  value={form.refCode}
                  onChange={(val) => updateField("refCode", val.toUpperCase())}
                  error={fieldErrors.refCode}
                  placeholder="Auto-generated if empty"
                  hint="Borrower series (e.g. CUST-2026-0004)"
                />
              </div>

              {/* Gender */}
              <div>
                <SelectField
                  label="Gender"
                  required
                  value={form.genderCd}
                  onChange={(val) => updateField("genderCd", val)}
                  error={fieldErrors.genderCd}
                  options={genderSelectOptions}
                  placeholder="Select Gender"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <DateField
                  label="Date of Birth"
                  required
                  value={form.dateOfBirth}
                  max={today}
                  onChange={(val) => updateField("dateOfBirth", val)}
                  error={fieldErrors.dateOfBirth}
                  hint={
                    calculatedAge != null
                      ? `Calculated Age: ${calculatedAge} years`
                      : "Member must be 18–100 years"
                  }
                />
              </div>

              {/* Status on Add */}
              {!editing ? (
                <div>
                  <SelectField
                    label="Initial Status"
                    value={form.statusCd}
                    searchable={false}
                    onChange={(val) => updateField("statusCd", val as "1" | "2")}
                    options={[
                      { value: "1", label: "Active" },
                      { value: "2", label: "Inactive" },
                    ]}
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Current Status
                  </label>
                  <div className="h-9 flex items-center px-3 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                    {editing.statusDesc || "Active"} (Managed via Status Action)
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Family & Social Background */}
          <section className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-800 uppercase">
              <Users className="h-4 w-4 text-brand" />
              2. Family & Social Information
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Father Name */}
              <TextField
                label="Father's Name"
                value={form.fatherName}
                onChange={(val) => updateField("fatherName", val)}
                error={fieldErrors.fatherName}
                placeholder="Father's full name"
              />

              {/* Mother Name */}
              <TextField
                label="Mother's Name"
                value={form.motherName}
                onChange={(val) => updateField("motherName", val)}
                error={fieldErrors.motherName}
                placeholder="Mother's full name"
              />

              {/* Spouse Name */}
              <TextField
                label="Spouse Name"
                value={form.spouseName}
                onChange={(val) => updateField("spouseName", val)}
                error={fieldErrors.spouseName}
                placeholder="Spouse full name (if married)"
              />

              {/* Marital Status */}
              <SelectField
                label="Marital Status"
                value={form.maritalStatusCd}
                onChange={(val) => updateField("maritalStatusCd", val)}
                options={maritalSelectOptions}
                placeholder="Select marital status"
              />

              {/* Religion */}
              <SelectField
                label="Religion"
                value={form.religionCd}
                onChange={(val) => updateField("religionCd", val)}
                options={religionSelectOptions}
                placeholder="Select religion"
              />

              {/* Caste */}
              <SelectField
                label="Caste / Social Category"
                value={form.casteCd}
                onChange={(val) => updateField("casteCd", val)}
                options={casteSelectOptions}
                placeholder="Select caste"
              />
            </div>
          </section>

          {/* Section 3: Contact & KYC Identification */}
          <section className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-800 uppercase">
              <Phone className="h-4 w-4 text-brand" />
              3. Contact & Identification
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Mobile Number */}
              <div>
                <TextField
                  label="Primary Mobile No."
                  required
                  value={form.mobileNo}
                  onChange={(val) => updateField("mobileNo", val.replace(/\D/g, "").slice(0, 10))}
                  error={fieldErrors.mobileNo}
                  placeholder="10 digits (6-9)"
                  hint="Starts with 6, 7, 8, 9"
                />
              </div>

              {/* Alternate Mobile */}
              <div>
                <TextField
                  label="Alternate Mobile No."
                  value={form.alternateMobileNo}
                  onChange={(val) => updateField("alternateMobileNo", val.replace(/\D/g, "").slice(0, 10))}
                  error={fieldErrors.alternateMobileNo}
                  placeholder="10 digits (optional)"
                />
              </div>

              {/* PAN Number */}
              <div>
                <TextField
                  label="PAN Number"
                  value={form.panNo}
                  onChange={(val) => updateField("panNo", val.toUpperCase().trim())}
                  error={fieldErrors.panNo}
                  placeholder="ABCDE1234F"
                  hint="Unique 10-char PAN"
                />
              </div>

              {/* Email ID */}
              <div>
                <TextField
                  label="Email Address"
                  value={form.emailId}
                  onChange={(val) => updateField("emailId", val.toLowerCase().trim())}
                  error={fieldErrors.emailId}
                  placeholder="member@example.com"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Branch & Location */}
          <section className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-800 uppercase">
              <Building2 className="h-4 w-4 text-brand" />
              4. Branch & Location Assignment
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Branch */}
              <div>
                <SelectField
                  label="Branch"
                  required
                  value={form.branchId}
                  disabled={isBranchBound}
                  onChange={(val) => updateField("branchId", val)}
                  error={fieldErrors.branchId}
                  options={branchOptions}
                  placeholder="Select Branch"
                />
              </div>

              {/* Center */}
              <div>
                <SelectField
                  label="Center / Kendra"
                  value={form.centerId}
                  disabled={!form.branchId}
                  onChange={(val) => updateField("centerId", val)}
                  error={fieldErrors.centerId}
                  options={centerOptions}
                  placeholder="Select center"
                />
              </div>

              {/* Field Officer */}
              <div>
                <SelectField
                  label="Field Officer (Staff)"
                  value={form.foId}
                  disabled={!form.branchId}
                  onChange={(val) => updateField("foId", val)}
                  error={fieldErrors.foId}
                  options={staffOptions}
                  placeholder="Select field officer"
                />
              </div>

              {/* Joining Date */}
              <div>
                <DateField
                  label="Joining Date"
                  value={form.joiningDate}
                  max={today}
                  onChange={(val) => updateField("joiningDate", val)}
                  error={fieldErrors.joiningDate}
                  placeholder="Select joining date"
                  hint="Cannot be in the future"
                />
              </div>
            </div>
          </section>

          {/* Section 5: Financial & Banking Information */}
          <section className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-800 uppercase">
              <Briefcase className="h-4 w-4 text-brand" />
              5. Financial & Banking Information
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Occupation */}
              <div className="lg:col-span-2">
                <TextField
                  label="Occupation Details"
                  value={form.occupationDetails}
                  onChange={(val) => updateField("occupationDetails", val)}
                  error={fieldErrors.occupationDetails}
                  placeholder="e.g. Tailoring, Dairy farming, Grocery shop"
                />
              </div>

              {/* Monthly Income */}
              <div>
                <TextField
                  label="Monthly Income (₹)"
                  type="number"
                  value={form.monthlyIncome}
                  onChange={(val) => updateField("monthlyIncome", val)}
                  error={fieldErrors.monthlyIncome}
                  placeholder="0.00"
                />
              </div>

              {/* Monthly Expense */}
              <div>
                <TextField
                  label="Monthly Expense (₹)"
                  type="number"
                  value={form.monthlyExpense}
                  onChange={(val) => updateField("monthlyExpense", val)}
                  error={fieldErrors.monthlyExpense}
                  placeholder="0.00"
                />
              </div>

              {/* Bank Name */}
              <div>
                <TextField
                  label="Bank Name"
                  value={form.bankName}
                  onChange={(val) => updateField("bankName", val)}
                  placeholder="e.g. State Bank of India"
                />
              </div>

              {/* Bank Branch */}
              <div>
                <TextField
                  label="Bank Branch"
                  value={form.bankBranch}
                  onChange={(val) => updateField("bankBranch", val)}
                  placeholder="e.g. Salt Lake Branch"
                />
              </div>

              {/* Bank Account No */}
              <div>
                <TextField
                  label="Account Number"
                  value={form.bankAccountNo}
                  onChange={(val) => updateField("bankAccountNo", val.replace(/\D/g, "").slice(0, 20))}
                  error={fieldErrors.bankAccountNo}
                  placeholder="6–20 digits"
                  hint="Required with IFSC"
                />
              </div>

              {/* IFSC Code */}
              <div>
                <TextField
                  label="IFSC Code"
                  value={form.ifscCode}
                  onChange={(val) => updateField("ifscCode", val.toUpperCase().trim())}
                  error={fieldErrors.ifscCode}
                  placeholder="SBIN0001234"
                  hint="11 chars (AAAA0XXXXXX)"
                />
              </div>

              {/* Admission Fees */}
              <div>
                <TextField
                  label="Admission Fees (₹)"
                  type="number"
                  value={form.admFees}
                  onChange={(val) => updateField("admFees", val)}
                  error={fieldErrors.admFees}
                  placeholder="0.00"
                />
              </div>
            </div>
          </section>

          {/* Section 6: Nominee & Other */}
          <section className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-800 uppercase">
              <FileText className="h-4 w-4 text-brand" />
              6. Nominee & Additional Remarks
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Nominee Name */}
              <div>
                <TextField
                  label="Nominee Name"
                  value={form.nomineeName}
                  onChange={(val) => updateField("nomineeName", val)}
                  error={fieldErrors.nomineeName}
                  placeholder="Full name of nominee"
                />
              </div>

              {/* Nominee Relationship */}
              <div>
                <SelectField
                  label="Relationship to Member"
                  value={form.nomineeRelation}
                  searchable={false}
                  placeholder="Select relationship"
                  onChange={(val) => updateField("nomineeRelation", val)}
                  error={fieldErrors.nomineeRelation}
                  options={relationSelectOptions}
                />
              </div>

              {/* Nominee DOB */}
              <div>
                <DateField
                  label="Nominee Date of Birth"
                  value={form.nomineeDob}
                  max={today}
                  onChange={(val) => updateField("nomineeDob", val)}
                  error={fieldErrors.nomineeDob}
                />
              </div>

              {/* Nominee Mobile */}
              <div>
                <TextField
                  label="Nominee Mobile No."
                  value={form.nomineeMobile}
                  onChange={(val) => updateField("nomineeMobile", val.replace(/\D/g, "").slice(0, 10))}
                  error={fieldErrors.nomineeMobile}
                  placeholder="10 digits"
                />
              </div>

              {/* Remarks */}
              <div className="sm:col-span-2 lg:col-span-4">
                <TextAreaField
                  label="Remarks / Notes"
                  value={form.remarks}
                  onChange={(val) => updateField("remarks", val)}
                  placeholder="Any additional notes or observations..."
                  rows={2}
                />
              </div>
            </div>
          </section>
        </form>
      </Modal>
    </>
  );
}
