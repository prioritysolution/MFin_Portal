import "server-only";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAccessToken } from "@/lib/auth/session";
import {
  mapAcctLedgerCreateToDto,
  mapAcctLedgerDto,
  mapAcctLedgerUpdateToDto,
  mapPaginationMetaDto,
} from "@/features/master/acct-ledger/mappers/acct-ledger.mapper";
import {
  acctLedgerCreateInputSchema,
  acctLedgerDtoSchema,
  acctLedgerUpdateInputSchema,
  paginationMetaDtoSchema,
} from "@/features/master/acct-ledger/schemas/acct-ledger.schema";
import type {
  AcctLedger,
  AcctLedgerDto,
  AcctLedgerListQuery,
  AcctLedgerListResult,
} from "@/features/master/acct-ledger/types/acct-ledger.types";
import {
  ACCT_LEDGER_DEFAULT_PER_PAGE,
  ACCT_LEDGER_MAX_PER_PAGE,
} from "@/features/master/acct-ledger/types/acct-ledger.types";
import type { LaravelResponse } from "@/types/api";

function clampPerPage(value: number | undefined): number {
  const raw = value ?? ACCT_LEDGER_DEFAULT_PER_PAGE;
  if (!Number.isFinite(raw) || raw < 1) return ACCT_LEDGER_DEFAULT_PER_PAGE;
  return Math.min(Math.floor(raw), ACCT_LEDGER_MAX_PER_PAGE);
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

function parseRow(row: unknown): AcctLedger | null {
  const parsed = acctLedgerDtoSchema.safeParse(row);
  if (!parsed.success) return null;
  return mapAcctLedgerDto(parsed.data);
}

/** Laravel: GET /api/AcctLedgerList */
export async function listAcctLedgers(
  query: AcctLedgerListQuery = {},
): Promise<AcctLedgerListResult> {
  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const payload = await api.get<LaravelResponse<AcctLedgerDto[]>>(
      endpoints.acctLedger.list,
      {
        accessToken: token,
        expectEnvelope: false,
        searchParams: {
          page: query.page ?? 1,
          per_page: clampPerPage(query.perPage),
          ledger_id: query.ledgerId,
          mainhd_id: query.mainhdId,
          keyword: query.keyword,
          ledger_type: query.ledgerType,
          is_active: query.isActive,
        },
      },
    );

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
          : "Failed to load account ledgers";
      throw new ApiError({
        message,
        status: 500,
        code: "UNEXPECTED",
        details: payload,
      });
    }

    const rows = Array.isArray(payload.data) ? payload.data : [];
    const items = rows.flatMap((row) => {
      const item = parseRow(row);
      return item ? [item] : [];
    });

    let meta: AcctLedgerListResult["meta"] = null;
    if (payload.meta) {
      const metaParsed = paginationMetaDtoSchema.safeParse(payload.meta);
      if (metaParsed.success) {
        meta = mapPaginationMetaDto(metaParsed.data);
      }
    }

    return { items, meta };
  });
}

/** Laravel: POST /api/AcctLedgerAdd */
export async function createAcctLedger(input: unknown): Promise<AcctLedger> {
  const validated = acctLedgerCreateInputSchema.safeParse(input);
  if (!validated.success) {
    throw new ApiError({
      message: "Validation failed",
      status: 422,
      code: "VALIDATION",
      details: validated.error.flatten(),
    });
  }

  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const body = mapAcctLedgerCreateToDto(validated.data);
    const data = await api.post<AcctLedgerDto>(endpoints.acctLedger.add, body, {
      accessToken: token,
      expectEnvelope: true,
    });

    if (!data) {
      throw new ApiError({
        message: "Account ledger create returned no data",
        status: 500,
        code: "UNEXPECTED",
      });
    }

    const item = parseRow(data);
    if (!item) {
      throw new ApiError({
        message: "Account ledger create response shape was unexpected",
        status: 500,
        code: "UNEXPECTED",
      });
    }

    return item;
  });
}

/** Laravel: POST /api/AcctLedgerEdit */
export async function updateAcctLedger(input: unknown): Promise<AcctLedger> {
  const validated = acctLedgerUpdateInputSchema.safeParse(input);
  if (!validated.success) {
    throw new ApiError({
      message: "Validation failed",
      status: 422,
      code: "VALIDATION",
      details: validated.error.flatten(),
    });
  }

  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const body = mapAcctLedgerUpdateToDto(validated.data);
    const data = await api.post<AcctLedgerDto>(
      endpoints.acctLedger.edit,
      body,
      {
        accessToken: token,
        expectEnvelope: true,
      },
    );

    if (!data) {
      throw new ApiError({
        message: "Account ledger update returned no data",
        status: 500,
        code: "UNEXPECTED",
      });
    }

    const item = parseRow(data);
    if (!item) {
      throw new ApiError({
        message: "Account ledger update response shape was unexpected",
        status: 500,
        code: "UNEXPECTED",
      });
    }

    return item;
  });
}
