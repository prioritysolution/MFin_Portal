import "server-only";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAccessToken } from "@/lib/auth/session";
import type { LaravelResponse } from "@/types/api";
import type {
  Member,
  MemberListQuery,
  MemberListResult,
  MemberSaveInput,
  MemberStatus,
} from "@/features/onboarding/member-registration/types/member.types";

type RawMember = Record<string, unknown>;

function getField(row: RawMember, ...aliases: string[]): unknown {
  if (!row || typeof row !== "object") return undefined;
  for (const a of aliases) {
    if (row[a] !== undefined && row[a] !== null) return row[a];
  }
  const targets = new Set(aliases.map((a) => a.toLowerCase().replace(/_/g, "")));
  for (const [k, v] of Object.entries(row)) {
    if (v !== undefined && v !== null) {
      if (targets.has(k.toLowerCase().replace(/_/g, ""))) return v;
    }
  }
  return undefined;
}

function text(row: RawMember, ...keys: string[]): string | null {
  const value = getField(row, ...keys);
  if (value == null) return null;
  if (typeof value === "string") return value.trim() !== "" ? value.trim() : null;
  if (typeof value === "number") return String(value);
  return null;
}

function numberValue(row: RawMember, ...keys: string[]): number | null {
  const value = getField(row, ...keys);
  if (value == null) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function bool(row: RawMember, ...keys: string[]): boolean {
  const value = getField(row, ...keys);
  return value === true || value === 1 || value === "1" || value === "true";
}

function mapMember(row: unknown): Member | null {
  if (!row || typeof row !== "object") return null;
  const raw = row as RawMember;
  const memberId = numberValue(raw, "member_id", "memberId", "Member_Id");
  const branchId = numberValue(raw, "branch_id", "branchId", "Branch_Id");
  const memberName = text(raw, "member_name", "memberName", "Member_Name");
  if (memberId == null || branchId == null || !memberName) return null;

  return {
    memberId,
    memberCode: (getField(raw, "member_code", "memberCode", "Member_Code") ?? memberId) as number | string,
    refCode: text(raw, "ref_code", "refCode", "Ref_Code"),
    memberName,
    fatherName: text(raw, "father_name", "fatherName", "Father_Name"),
    motherName: text(raw, "mother_name", "motherName", "Mother_Name"),
    spouseName: text(raw, "spouse_name", "spouseName", "Spouse_Name"),
    genderCd: numberValue(raw, "gender_cd", "genderCd", "Gender_Cd") ?? 1,
    genderDesc: text(raw, "gender_desc", "genderDesc", "Gender_Desc"),
    dateOfBirth: text(raw, "date_of_birth", "dateOfBirth", "Date_Of_Birth") ?? "",
    age: numberValue(raw, "age", "Age") ?? 0,
    maritalStatusCd: numberValue(raw, "marital_status_cd", "maritalStatusCd", "Marital_Status_Cd"),
    maritalStatusDesc: text(raw, "marital_status_desc", "maritalStatusDesc", "Marital_Status_Desc"),
    religionCd: numberValue(raw, "religion_cd", "religionCd", "Religion_Cd"),
    religionDesc: text(raw, "religion_desc", "religionDesc", "Religion_Desc"),
    casteCd: numberValue(raw, "caste_cd", "casteCd", "Caste_Cd"),
    casteDesc: text(raw, "caste_desc", "casteDesc", "Caste_Desc"),
    mobileNo: text(raw, "mobile_no", "mobileNo", "Mobile_No") ?? "",
    alternateMobileNo: text(raw, "alternate_mobile_no", "alternateMobileNo", "Alternate_Mobile_No"),
    emailId: text(raw, "email_id", "emailId", "Email_Id"),
    panNo: text(raw, "pan_no", "panNo", "Pan_No"),
    branchId,
    branchCode: text(raw, "branch_code", "branchCode", "Branch_Code"),
    branchName: text(raw, "branch_name", "branchName", "Branch_Name") ?? "—",
    centerId: numberValue(raw, "center_id", "centerId", "Center_Id"),
    centerName: text(raw, "center_name", "centerName", "Center_Name"),
    groupId: numberValue(raw, "group_id", "groupId", "Group_Id"),
    groupCode: (getField(raw, "group_code", "groupCode", "Group_Code") as number | string | null) ?? null,
    groupName: text(raw, "group_name", "groupName", "Group_Name"),
    memberRole: text(raw, "member_role", "memberRole", "Member_Role"),
    joiningDate: text(raw, "joining_date", "joiningDate", "Joining_Date"),
    occupationDetails: text(raw, "occupation_details", "occupationDetails", "Occupation_Details"),
    monthlyIncome: numberValue(raw, "monthly_income", "monthlyIncome", "Monthly_Income"),
    monthlyExpense: numberValue(raw, "monthly_expense", "monthlyExpense", "Monthly_Expense"),
    bankName: text(raw, "bank_name", "bankName", "Bank_Name"),
    bankBranch: text(raw, "bank_branch", "bankBranch", "Bank_Branch"),
    bankAccountNo: text(raw, "bank_account_no", "bankAccountNo", "Bank_Account_No"),
    ifscCode: text(raw, "ifsc_code", "ifscCode", "Ifsc_Code"),
    nomineeName: text(raw, "nominee_name", "nomineeName", "Nominee_Name"),
    nomineeRelation: text(raw, "nominee_relation", "nomineeRelation", "Nominee_Relation"),
    nomineeDob: text(raw, "nominee_dob", "nomineeDob", "Nominee_Dob"),
    nomineeMobile: text(raw, "nominee_mobile", "nomineeMobile", "Nominee_Mobile"),
    photoPath: text(raw, "photo_path", "photoPath", "Photo_Path"),
    signaturePath: text(raw, "signature_path", "signaturePath", "Signature_Path"),
    foId: numberValue(raw, "fo_id", "foId", "Fo_Id"),
    foCode: text(raw, "fo_code", "foCode", "Fo_Code"),
    foName: text(raw, "fo_name", "foName", "Fo_Name"),
    admFees: numberValue(raw, "adm_fees", "admFees", "Adm_Fees"),
    remarks: text(raw, "remarks", "Remarks"),
    kycCount: numberValue(raw, "kyc_count", "kycCount", "Kyc_Count") ?? 0,
    kycVerifiedCount: numberValue(raw, "kyc_verified_count", "kycVerifiedCount", "Kyc_Verified_Count") ?? 0,
    statusCd: (numberValue(raw, "status_cd", "statusCd", "Status_Cd") ?? 1) as MemberStatus,
    statusDesc: text(raw, "status_desc", "statusDesc", "Status_Desc") ?? "Active",
    isActive: bool(raw, "is_active", "isActive", "Is_Active"),
    createdBy: (getField(raw, "created_by", "createdBy", "Created_By") as number | string | null) ?? null,
    createdAt: text(raw, "created_at", "createdAt", "Created_At"),
    updatedBy: (getField(raw, "updated_by", "updatedBy", "Updated_By") as number | string | null) ?? null,
    updatedAt: text(raw, "updated_at", "updatedAt", "Updated_At"),
  };
}

async function token(): Promise<string> {
  const value = await getAccessToken();
  if (!value) throw new ApiError({ message: "Unauthorized", status: 401, code: "UNAUTHORIZED" });
  return value;
}

async function run<T>(callback: (accessToken: string) => Promise<T>): Promise<T> {
  try {
    return await callback(await token());
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) await clearAuthSession();
    throw error;
  }
}

export async function listMembers(
  query: MemberListQuery = {},
  signal?: AbortSignal,
): Promise<MemberListResult> {
  return run(async (accessToken) => {
    const payload = await api.get<LaravelResponse<RawMember[]>>(endpoints.member.list, {
      accessToken,
      expectEnvelope: false,
      signal,
      searchParams: {
        page: query.page ?? 1,
        per_page: Math.min(200, Math.max(1, query.perPage ?? 50)),
        member_id: query.memberId,
        keyword: query.keyword,
        branch_id: query.branchId,
        center_id: query.centerId,
        group_id: query.groupId,
        fo_id: query.foId,
        gender_cd: query.genderCd,
        status_cd: query.statusCd,
      },
    });

    const items = Array.isArray(payload?.data)
      ? payload.data.flatMap((row) => {
          const m = mapMember(row);
          return m ? [m] : [];
        })
      : [];
    const rawMeta = payload?.meta as Record<string, unknown> | undefined;
    const total = numberValue(rawMeta ?? {}, "total") ?? items.length;
    const page = numberValue(rawMeta ?? {}, "page") ?? query.page ?? 1;
    const perPage = numberValue(rawMeta ?? {}, "per_page", "perPage") ?? query.perPage ?? 50;

    return {
      items,
      meta: {
        total,
        page,
        perPage,
        lastPage: numberValue(rawMeta ?? {}, "last_page", "lastPage") ?? Math.max(1, Math.ceil(total / perPage)),
        hasMore: bool(rawMeta ?? {}, "has_more", "hasMore"),
      },
    };
  });
}

export async function saveMember(input: MemberSaveInput): Promise<Member | null> {
  return run(async (accessToken) => {
    const { memberId, ...body } = input;
    const isEdit = memberId != null;
    const optional: Record<string, unknown> = {
      father_name: body.fatherName ?? null,
      mother_name: body.motherName ?? null,
      spouse_name: body.spouseName ?? null,
      marital_status_cd: body.maritalStatusCd ?? null,
      religion_cd: body.religionCd ?? null,
      caste_cd: body.casteCd ?? null,
      alternate_mobile_no: body.alternateMobileNo ?? null,
      email_id: body.emailId ? body.emailId.toLowerCase().trim() : null,
      pan_no: body.panNo ? body.panNo.toUpperCase().trim() : null,
      center_id: body.centerId ?? null,
      joining_date: body.joiningDate ?? null,
      occupation_details: body.occupationDetails ?? null,
      monthly_income: body.monthlyIncome ?? null,
      monthly_expense: body.monthlyExpense ?? null,
      bank_name: body.bankName ?? null,
      bank_branch: body.bankBranch ?? null,
      bank_account_no: body.bankAccountNo ?? null,
      ifsc_code: body.ifscCode ? body.ifscCode.toUpperCase().trim() : null,
      nominee_name: body.nomineeName ?? null,
      nominee_relation: body.nomineeRelation ?? null,
      nominee_dob: body.nomineeDob ?? null,
      nominee_mobile: body.nomineeMobile ?? null,
      photo_path: body.photoPath ?? null,
      signature_path: body.signaturePath ?? null,
      fo_id: body.foId ?? null,
      adm_fees: body.admFees ?? null,
      remarks: body.remarks ?? null,
    };

    const requestBody: Record<string, unknown> = {
      member_name: body.memberName,
      gender_cd: body.genderCd,
      date_of_birth: body.dateOfBirth,
      mobile_no: body.mobileNo,
      branch_id: body.branchId,
    };

    if (body.refCode) requestBody.ref_code = body.refCode;

    if (isEdit) {
      requestBody.member_id = memberId;
      Object.assign(requestBody, optional);
    } else {
      for (const [key, value] of Object.entries(optional)) {
        if (value != null && value !== "") requestBody[key] = value;
      }
      if (body.statusCd === 1 || body.statusCd === 2) requestBody.status_cd = body.statusCd;
    }

    const data = await api.post<RawMember>(
      isEdit ? endpoints.member.edit : endpoints.member.add,
      requestBody,
      { accessToken, expectEnvelope: true },
    );
    return mapMember(data);
  });
}

export async function changeMemberStatus(memberId: number, statusCd: MemberStatus): Promise<Member | null> {
  return run(async (accessToken) => {
    const data = await api.post<RawMember>(
      endpoints.member.status,
      {
        member_id: memberId,
        status_cd: statusCd,
      },
      { accessToken, expectEnvelope: true },
    );
    return mapMember(data);
  });
}
