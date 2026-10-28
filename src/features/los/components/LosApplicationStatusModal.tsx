"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SelectField, TextField } from "@/components/ui/Form";
import { updateLoanApplicationStatus } from "../services/los-client";
import type { LoanApplicationRow } from "../types/los.types";

type LosApplicationStatusModalProps = {
  application: LoanApplicationRow | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function LosApplicationStatusModal({
  application,
  open,
  onClose,
  onSuccess,
}: LosApplicationStatusModalProps) {
  const [statusCd, setStatusCd] = useState<string>("3"); // 3 Reject
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !application) return null;

  const handleSubmit = async () => {
    setError(null);
    const cd = Number(statusCd);
    if ((cd === 3 || cd === 4) && !remarks.trim()) {
      setError("Remarks are mandatory when rejecting or sending back for resubmission");
      return;
    }

    setSubmitting(true);
    try {
      await updateLoanApplicationStatus({
        application_id: application.application_id,
        appl_status_cd: cd,
        remarks: remarks.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const options = [
    { value: "3", label: "Reject Application (Group 37: 3)" },
    { value: "4", label: "Send Back for Resubmission (Group 37: 4)" },
    ...(application.appl_status_cd === 4
      ? [{ value: "1", label: "Resubmit (Group 37: 1)" }]
      : []),
  ];

  return (
    <Modal
      open={open}
      title={`Update Status — Application #${application.application_no}`}
      size="md"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={statusCd === "3" ? "danger" : "primary"}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Confirm Status"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}
        <p className="text-xs text-slate-600">
          Borrower: <span className="font-semibold text-slate-900">{application.member_name}</span> · Current Status:{" "}
          <span className="font-semibold text-teal-700">{application.appl_status}</span>
        </p>
        <SelectField
          label="New Application Status"
          value={statusCd}
          options={options}
          onChange={setStatusCd}
        />
        <TextField
          label="Remarks (Mandatory for rejection or resubmission)"
          value={remarks}
          required={statusCd === "3" || statusCd === "4"}
          placeholder="State the reason clearly..."
          onChange={setRemarks}
        />
      </div>
    </Modal>
  );
}
