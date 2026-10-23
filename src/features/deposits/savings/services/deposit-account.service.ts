import "server-only";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAccessToken } from "@/lib/auth/session";
import {
  mapCustomerRow,
  mapDepositAccountCloseToDto,
  mapDepositNomineeAddToDto,
  mapDepositNomineeDto,
  mapDepositNomineeEditToDto,
  mapDepositNomineeStatusToDto,
  mapDepositSignatoryAddToDto,
  mapDepositSignatoryDto,
  mapDepositSignatoryEditToDto,
  mapDepositSignatoryStatusToDto,
  mapGroupMember,
  mapDepositAccountCreateToDto,
  mapDepositAccountDto,
  mapDepositAccountEditToDto,
  mapDepositAccountStatusToDto,
  mapPaginationMetaDto,
} from "../mappers/deposit-account.mapper";
import {
  depositAccountCloseSchema,
  depositAccountCreateSchema,
  depositAccountDtoSchema,
  depositAccountEditSchema,
  depositAccountStatusSchema,
  depositNomineeAddSchema,
  depositNomineeDtoSchema,
  depositNomineeEditSchema,
  depositNomineeStatusSchema,
  depositSignatoryAddSchema,
  depositSignatoryDtoSchema,
  depositSignatoryEditSchema,
  depositSignatoryStatusSchema,
  paginationMetaDtoSchema,
} from "../schemas/deposit-account.schema";
import type {
  DepositAccount,
  DepositAccountDto,
  DepositAccountListQuery,
  DepositAccountListResult,
  DepositCustomer,
  DepositCustomerQuery,
  DepositNominee,
  DepositSignatory,
  SignatoryCandidate,
  PaginationMetaDto,
} from "../types/deposit-account.types";
import type { LaravelResponse } from "@/types/api";

const DEFAULT_PER_PAGE = 50;
const MAX_PER_PAGE = 200;

function clampPerPage(value: number | undefined): number {
  const raw = value ?? DEFAULT_PER_PAGE;
  if (!Number.isFinite(raw) || raw < 1) return DEFAULT_PER_PAGE;
  return Math.min(Math.floor(raw), MAX_PER_PAGE);
}

async function requireAccessToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new ApiError({
      message: "Unauthorized. Bearer token required.",
      status: 401,
      code: "UNAUTHORIZED",
    });
  }
  return token;
}

async function withUnauthorizedClear<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      await clearAuthSession();
    }
    throw error;
  }
}

function assertSuccess(
  payload: unknown,
  fallback: string,
): asserts payload is { success: true; data?: unknown; meta?: unknown } {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("success" in payload) ||
    payload.success !== true
  ) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : fallback;
    throw new ApiError({
      message,
      status: 500,
      code: "UNEXPECTED",
      details: payload,
    });
  }
}

function parseAccount(row: unknown): DepositAccount | null {
  const parsed = depositAccountDtoSchema.safeParse(row);
  if (!parsed.success) return null;
  return mapDepositAccountDto(parsed.data as DepositAccountDto);
}

function parseAccountOrThrow(row: unknown, fallback: string): DepositAccount {
  const item = parseAccount(row);
  if (!item) {
    throw new ApiError({
      message: fallback,
      status: 500,
      code: "UNEXPECTED",
    });
  }
  return item;
}

function validationError(error: { flatten: () => unknown }): ApiError {
  return new ApiError({
    message: "Validation failed",
    status: 422,
    code: "VALIDATION",
    details: error.flatten(),
  });
}

/** Laravel: GET /api/DepositAccountList */
export async function listDepositAccounts(
  query: DepositAccountListQuery = {},
): Promise<DepositAccountListResult> {
  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const payload = await api.get<LaravelResponse<DepositAccountDto[]>>(
      endpoints.depositAccount.list,
      {
        accessToken: token,
        expectEnvelope: false,
        searchParams: {
          page: query.page ?? 1,
          per_page: clampPerPage(query.perPage),
          account_id: query.accountId,
          branch_id: query.branchId,
          fo_id: query.foId,
          scheme_id: query.schemeId,
          deposit_type_cd: query.depositTypeCd,
          cust_type_cd: query.custTypeCd,
          member_id: query.memberId,
          group_id: query.groupId,
          op_mode_cd: query.opModeCd,
          status_cd: query.statusCd,
          is_closed:
            query.isClosed == null ? undefined : query.isClosed ? 1 : 0,
          from_date: query.fromDate,
          to_date: query.toDate,
          keyword: query.search,
        },
      },
    );

    assertSuccess(payload, "Failed to load deposit accounts");
    const rows = Array.isArray(payload.data) ? payload.data : [];
    const items = rows.flatMap((row) => {
      const item = parseAccount(row);
      return item ? [item] : [];
    });

    let meta: DepositAccountListResult["meta"] = null;
    if ("meta" in payload && payload.meta) {
      const metaParsed = paginationMetaDtoSchema.safeParse(payload.meta);
      if (metaParsed.success) {
        meta = mapPaginationMetaDto(metaParsed.data as PaginationMetaDto);
      }
    }

    return { items, meta };
  });
}

/** Laravel: POST /api/DepositAccountAdd */
export async function createDepositAccount(
  input: unknown,
): Promise<DepositAccount> {
  const validated = depositAccountCreateSchema.safeParse(input);
  if (!validated.success) throw validationError(validated.error);

  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const data = await api.post<DepositAccountDto>(
      endpoints.depositAccount.add,
      mapDepositAccountCreateToDto(validated.data),
      { accessToken: token, expectEnvelope: true },
    );
    return parseAccountOrThrow(
      data,
      "Deposit account creation returned an unexpected response",
    );
  });
}

/** Laravel: POST /api/DepositAccountEdit */
export async function updateDepositAccount(
  input: unknown,
): Promise<DepositAccount> {
  const validated = depositAccountEditSchema.safeParse(input);
  if (!validated.success) throw validationError(validated.error);

  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const data = await api.post<DepositAccountDto>(
      endpoints.depositAccount.edit,
      mapDepositAccountEditToDto(validated.data),
      { accessToken: token, expectEnvelope: true },
    );
    return parseAccountOrThrow(
      data,
      "Deposit account update returned an unexpected response",
    );
  });
}

/** Laravel: POST /api/DepositAccountStatus */
export async function changeDepositAccountStatus(
  input: unknown,
): Promise<DepositAccount> {
  const validated = depositAccountStatusSchema.safeParse(input);
  if (!validated.success) throw validationError(validated.error);

  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const data = await api.post<DepositAccountDto>(
      endpoints.depositAccount.status,
      mapDepositAccountStatusToDto(validated.data),
      { accessToken: token, expectEnvelope: true },
    );
    return parseAccountOrThrow(
      data,
      "Deposit account status returned an unexpected response",
    );
  });
}

/** Laravel: POST /api/DepositAccountClose */
export async function closeDepositAccount(
  input: unknown,
): Promise<DepositAccount> {
  const validated = depositAccountCloseSchema.safeParse(input);
  if (!validated.success) throw validationError(validated.error);

  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const data = await api.post<DepositAccountDto>(
      endpoints.depositAccount.close,
      mapDepositAccountCloseToDto(validated.data),
      { accessToken: token, expectEnvelope: true },
    );
    return parseAccountOrThrow(
      data,
      "Deposit account close returned an unexpected response",
    );
  });
}

/** Laravel: GET /api/DepositNomineeList */
export async function listDepositNominees(
  accountId: number,
): Promise<DepositNominee[]> {
  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const payload = await api.get<LaravelResponse<unknown[]>>(
      endpoints.depositAccount.nomineeList,
      {
        accessToken: token,
        expectEnvelope: false,
        searchParams: {
          account_id: accountId,
          is_active: 1,
          per_page: MAX_PER_PAGE,
        },
      },
    );
    assertSuccess(payload, "Failed to load nominees");
    const rows = Array.isArray(payload.data) ? payload.data : [];
    return rows.flatMap((row) => {
      const parsed = depositNomineeDtoSchema.safeParse(row);
      return parsed.success ? [mapDepositNomineeDto(parsed.data)] : [];
    });
  });
}

/** Laravel: POST /api/DepositNomineeEdit */
export async function editDepositNominee(input: unknown): Promise<void> {
  const validated = depositNomineeEditSchema.safeParse(input);
  if (!validated.success) throw validationError(validated.error);
  await withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    await api.post(
      endpoints.depositAccount.nomineeEdit,
      mapDepositNomineeEditToDto(validated.data),
      { accessToken: token, expectEnvelope: true },
    );
  });
}

/** Laravel: POST /api/DepositNomineeStatus */
export async function changeDepositNomineeStatus(input: unknown): Promise<void> {
  const validated = depositNomineeStatusSchema.safeParse(input);
  if (!validated.success) throw validationError(validated.error);
  await withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    await api.post(
      endpoints.depositAccount.nomineeStatus,
      mapDepositNomineeStatusToDto(validated.data),
      { accessToken: token, expectEnvelope: true },
    );
  });
}

/** Laravel: POST /api/DepositNomineeAdd */
export async function addDepositNominees(input: unknown): Promise<void> {
  const validated = depositNomineeAddSchema.safeParse(input);
  if (!validated.success) throw validationError(validated.error);

  await withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    await api.post(
      endpoints.depositAccount.nomineeAdd,
      mapDepositNomineeAddToDto(validated.data),
      { accessToken: token, expectEnvelope: true },
    );
  });
}

/** Laravel: GET /api/DepositSignatoryList */
export async function listDepositSignatories(
  accountId: number,
): Promise<DepositSignatory[]> {
  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const payload = await api.get<LaravelResponse<unknown[]>>(
      endpoints.depositAccount.signatoryList,
      {
        accessToken: token,
        expectEnvelope: false,
        searchParams: {
          account_id: accountId,
          is_active: 1,
          per_page: MAX_PER_PAGE,
        },
      },
    );
    assertSuccess(payload, "Failed to load signatories");
    const rows = Array.isArray(payload.data) ? payload.data : [];
    return rows.flatMap((row) => {
      const parsed = depositSignatoryDtoSchema.safeParse(row);
      return parsed.success ? [mapDepositSignatoryDto(parsed.data)] : [];
    });
  });
}

/** Laravel: POST /api/DepositSignatoryAdd */
export async function addDepositSignatories(input: unknown): Promise<void> {
  const validated = depositSignatoryAddSchema.safeParse(input);
  if (!validated.success) throw validationError(validated.error);
  await withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    await api.post(
      endpoints.depositAccount.signatoryAdd,
      mapDepositSignatoryAddToDto(validated.data),
      { accessToken: token, expectEnvelope: true },
    );
  });
}

/** Laravel: POST /api/DepositSignatoryEdit */
export async function editDepositSignatory(input: unknown): Promise<void> {
  const validated = depositSignatoryEditSchema.safeParse(input);
  if (!validated.success) throw validationError(validated.error);
  await withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    await api.post(
      endpoints.depositAccount.signatoryEdit,
      mapDepositSignatoryEditToDto(validated.data),
      { accessToken: token, expectEnvelope: true },
    );
  });
}

/** Laravel: POST /api/DepositSignatoryStatus */
export async function changeDepositSignatoryStatus(input: unknown): Promise<void> {
  const validated = depositSignatoryStatusSchema.safeParse(input);
  if (!validated.success) throw validationError(validated.error);
  await withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    await api.post(
      endpoints.depositAccount.signatoryStatus,
      mapDepositSignatoryStatusToDto(validated.data),
      { accessToken: token, expectEnvelope: true },
    );
  });
}

/** Laravel: GET /api/MemberGroupList */
export async function listGroupMembers(
  groupId: number,
): Promise<SignatoryCandidate[]> {
  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const payload = await api.get<LaravelResponse<unknown[]>>(
      endpoints.memberGroup.list,
      {
        accessToken: token,
        expectEnvelope: false,
        searchParams: {
          group_id: groupId,
          is_active: 1,
          per_page: MAX_PER_PAGE,
        },
      },
    );
    assertSuccess(payload, "Failed to load group members");
    const rows = Array.isArray(payload.data) ? payload.data : [];
    return rows.flatMap((row) => {
      if (typeof row !== "object" || row === null) return [];
      const item = mapGroupMember(row as Record<string, unknown>);
      return item ? [item] : [];
    });
  });
}

/** Laravel: GET /api/MemberList or GET /api/GroupList */
export async function listDepositCustomers(
  query: DepositCustomerQuery,
): Promise<DepositCustomer[]> {
  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const path =
      query.kind === "member" ? endpoints.member.list : endpoints.group.list;
    const payload = await api.get<LaravelResponse<unknown[]>>(path, {
      accessToken: token,
      expectEnvelope: false,
      searchParams: {
        page: query.page ?? 1,
        per_page: clampPerPage(query.perPage),
        status_cd: 1,
        keyword: query.keyword,
        branch_id: query.branchId,
      },
    });

    assertSuccess(payload, "Failed to load customers");
    const rows = Array.isArray(payload.data) ? payload.data : [];
    return rows.flatMap((row) => {
      if (typeof row !== "object" || row === null) return [];
      const item = mapCustomerRow(row as Record<string, unknown>, query.kind);
      return item ? [item] : [];
    });
  });
}
