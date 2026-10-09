"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Pencil,
  X,
  User,
  Building2,
  CreditCard,
  Phone,
  Briefcase,
  Users,
  FileCheck2,
  Clock,
  ShieldAlert,
  Power,
  Ban,
  CheckCircle,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import type { Member, MemberStatus } from "../types/member.types";

export type MemberRegistrationDrawerProps = {
  member: Member | null;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onRequestStatusChange: (member: Member, nextStatus: MemberStatus) => void;
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function maskAccountNumber(acc: string | null | undefined): string {
  if (!acc) return "—";
  if (acc.length <= 4) return acc;
  const last4 = acc.slice(-4);
  const maskedLength = acc.length - 4;
  return "•".repeat(Math.min(8, maskedLength)) + " " + last4;
}

export function MemberRegistrationDrawer({
  member,
  onClose,
  onEdit,
  onRequestStatusChange,
}: MemberRegistrationDrawerProps) {
  const [revealAccount, setRevealAccount] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!member) return null;

  const canEdit = member.statusCd !== 4 && member.statusCd !== 5;

  let statusTone: "success" | "warning" | "danger" | "neutral" = "neutral";
  if (member.statusCd === 1) statusTone = "success";
  else if (member.statusCd === 2) statusTone = "warning";
  else if (member.statusCd === 3) statusTone = "danger";
  else if (member.statusCd === 4) statusTone = "neutral";
  else if (member.statusCd === 5) statusTone = "neutral";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="fixed inset-y-0 right-0 flex max-w-full pl-10"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <aside className="w-screen max-w-md bg-surface shadow-2xl transition-all sm:max-w-lg lg:max-w-[480px]">
          <div className="flex h-full flex-col divide-y divide-border bg-surface">
            {/* Drawer Header */}
            <div className="bg-surface-muted/30 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone} caps={false}>
                      {member.statusDesc || "Active"}
                    </Badge>
                    <span className="font-mono text-xs text-muted">
                      {member.refCode || `Code: ${member.memberCode}`}
                    </span>
                  </div>
                  <h2 className="mt-1.5 truncate text-lg font-bold text-slate-800">
                    {member.memberName}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {member.age ? `${member.age} yrs` : ""}
                    {member.age && member.genderDesc ? " • " : ""}
                    {member.genderDesc ?? ""}
                    {member.maritalStatusDesc ? ` • ${member.maritalStatusDesc}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip content={canEdit ? "Edit Profile" : "Closed or Deceased members cannot be edited"}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-soft hover:text-slate-800 disabled:opacity-40"
                      disabled={!canEdit}
                      onClick={() => onEdit(member)}
                      aria-label="Edit member"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-soft hover:text-slate-800"
                    onClick={onClose}
                    aria-label="Close drawer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
              {/* KYC Status banner */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex items-center gap-2.5">
                  <FileCheck2
                    className={`h-5 w-5 ${
                      member.kycCount > 0 && member.kycVerifiedCount === member.kycCount
                        ? "text-emerald-600"
                        : member.kycVerifiedCount > 0
                          ? "text-blue-600"
                          : "text-slate-400"
                    }`}
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      KYC Documents
                    </div>
                    <div className="text-[11px] text-muted">
                      {member.kycVerifiedCount} of {member.kycCount} documents verified
                    </div>
                  </div>
                </div>
                <Badge
                  tone={
                    member.kycCount > 0 && member.kycVerifiedCount === member.kycCount
                      ? "success"
                      : member.kycVerifiedCount > 0
                        ? "info"
                        : "neutral"
                  }
                >
                  {member.kycCount > 0 && member.kycVerifiedCount === member.kycCount
                    ? "Verified"
                    : member.kycVerifiedCount > 0
                      ? "Partial"
                      : "Pending"}
                </Badge>
              </div>

              {/* 1. Personal & Family Details */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-700 uppercase">
                  <User className="h-3.5 w-3.5 text-brand" />
                  Personal & Family Details
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-muted">Date of Birth</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(member.dateOfBirth)} ({member.age} yrs)
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Gender</span>
                    <span className="font-medium text-slate-800">
                      {member.genderDesc || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Father&apos;s Name</span>
                    <span className="font-medium text-slate-800">
                      {member.fatherName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Mother&apos;s Name</span>
                    <span className="font-medium text-slate-800">
                      {member.motherName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Spouse Name</span>
                    <span className="font-medium text-slate-800">
                      {member.spouseName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Marital Status</span>
                    <span className="font-medium text-slate-800">
                      {member.maritalStatusDesc || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Religion</span>
                    <span className="font-medium text-slate-800">
                      {member.religionDesc || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Caste</span>
                    <span className="font-medium text-slate-800">
                      {member.casteDesc || "—"}
                    </span>
                  </div>
                </div>
              </section>

              {/* 2. Contact & Identification */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-700 uppercase">
                  <Phone className="h-3.5 w-3.5 text-brand" />
                  Contact & Identification
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-muted">Primary Mobile</span>
                    <span className="font-mono font-medium text-slate-800">
                      {member.mobileNo || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Alternate Mobile</span>
                    <span className="font-mono font-medium text-slate-800">
                      {member.alternateMobileNo || "—"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-muted">Email ID</span>
                    <span className="font-medium text-slate-800">
                      {member.emailId || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">PAN Number</span>
                    <span className="font-mono font-medium text-slate-800">
                      {member.panNo || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Joining Date</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(member.joiningDate)}
                    </span>
                  </div>
                </div>
              </section>

              {/* 3. Branch & Group Assignment */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-700 uppercase">
                  <Building2 className="h-3.5 w-3.5 text-brand" />
                  Branch & Group Assignment
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-muted">Branch</span>
                    <span className="font-medium text-slate-800">
                      {member.branchName}
                    </span>
                    {member.branchCode ? (
                      <span className="text-[11px] text-muted font-mono">
                        ({member.branchCode})
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <span className="block text-muted">Center</span>
                    <span className="font-medium text-slate-800">
                      {member.centerName || "Not Assigned"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Active Group</span>
                    <span className="font-medium text-slate-800">
                      {member.groupName || "Not in any group"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Role in Group</span>
                    <span className="font-medium text-slate-800">
                      {member.memberRole || (member.groupName ? "Member" : "—")}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-muted">Field Officer</span>
                    <span className="font-medium text-slate-800">
                      {member.foName || "—"}
                    </span>
                    {member.foCode ? (
                      <span className="text-[11px] text-muted font-mono">
                        ({member.foCode})
                      </span>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* 4. Financial & Socio-Economic */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-700 uppercase">
                  <Briefcase className="h-3.5 w-3.5 text-brand" />
                  Financial Details
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <span className="block text-muted">Occupation</span>
                    <span className="font-medium text-slate-800">
                      {member.occupationDetails || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Monthly Income</span>
                    <span className="font-mono font-medium text-emerald-700">
                      {formatCurrency(member.monthlyIncome)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Monthly Expense</span>
                    <span className="font-mono font-medium text-slate-800">
                      {formatCurrency(member.monthlyExpense)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Admission Fees</span>
                    <span className="font-mono font-medium text-slate-800">
                      {formatCurrency(member.admFees)}
                    </span>
                  </div>
                </div>
              </section>

              {/* 5. Bank Account */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-700 uppercase">
                    <CreditCard className="h-3.5 w-3.5 text-brand" />
                    Bank Account
                  </div>
                  {member.bankAccountNo && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:underline"
                      onClick={() => setRevealAccount(!revealAccount)}
                    >
                      {revealAccount ? (
                        <>
                          <EyeOff className="h-3 w-3" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" /> Reveal
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-muted">Bank Name</span>
                    <span className="font-medium text-slate-800">
                      {member.bankName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Branch</span>
                    <span className="font-medium text-slate-800">
                      {member.bankBranch || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Account Number</span>
                    <span className="font-mono font-medium text-slate-800">
                      {member.bankAccountNo
                        ? revealAccount
                          ? member.bankAccountNo
                          : maskAccountNumber(member.bankAccountNo)
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">IFSC Code</span>
                    <span className="font-mono font-medium text-slate-800">
                      {member.ifscCode || "—"}
                    </span>
                  </div>
                </div>
              </section>

              {/* 6. Nominee Details */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-700 uppercase">
                  <Users className="h-3.5 w-3.5 text-brand" />
                  Nominee Details
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-muted">Nominee Name</span>
                    <span className="font-medium text-slate-800">
                      {member.nomineeName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Relationship</span>
                    <span className="font-medium text-slate-800">
                      {member.nomineeRelation || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Date of Birth</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(member.nomineeDob)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted">Mobile Number</span>
                    <span className="font-mono font-medium text-slate-800">
                      {member.nomineeMobile || "—"}
                    </span>
                  </div>
                </div>
              </section>

              {/* 7. System & Audit Info */}
              <section className="space-y-2 border-t border-slate-200/80 pt-4 text-[11px] text-muted">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-muted-soft" />
                  <span>
                    Created: {formatDate(member.createdAt)}
                    {member.createdBy ? ` by User #${member.createdBy}` : ""}
                  </span>
                </div>
                {member.updatedAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-soft" />
                    <span>
                      Updated: {formatDate(member.updatedAt)}
                      {member.updatedBy ? ` by User #${member.updatedBy}` : ""}
                    </span>
                  </div>
                )}
                {member.remarks && (
                  <div className="mt-2 rounded bg-slate-50 p-2 text-slate-600 italic">
                    &ldquo;{member.remarks}&rdquo;
                  </div>
                )}
              </section>
            </div>

            {/* Drawer Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-muted/30 px-5 py-3 sm:px-6">
              <div className="flex items-center gap-1">
                {member.statusCd !== 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-emerald-700 hover:bg-emerald-50"
                    onClick={() => onRequestStatusChange(member, 1)}
                  >
                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                    Activate
                  </Button>
                )}
                {member.statusCd === 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-amber-700 hover:bg-amber-50"
                    onClick={() => onRequestStatusChange(member, 2)}
                  >
                    <Power className="mr-1 h-3.5 w-3.5" />
                    Deactivate
                  </Button>
                )}
                {member.statusCd !== 3 && member.statusCd !== 4 && member.statusCd !== 5 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-orange-700 hover:bg-orange-50"
                    onClick={() => onRequestStatusChange(member, 3)}
                  >
                    <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                    Suspend
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={onClose}>
                  Close
                </Button>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onEdit(member)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
