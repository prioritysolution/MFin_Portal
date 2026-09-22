import "server-only";

import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAccessToken } from "@/lib/auth/session";
import {
  mapOperationalDayCreateToDto,
  mapOperationalDayDto,
  mapOperationalDayUpdateToDto,
  mapPaginationMetaDto,
} from "@/features/master/operational-days/mappers/operational-days.mapper";
import {
  operationalDayCreateInputSchema,
  operationalDayDtoSchema,
  operationalDayUpdateInputSchema,
  paginationMetaDtoSchema,
} from "@/features/master/operational-days/schemas/operational-days.schema";
import type {
  OperationalDay,
  OperationalDayDto,
  OperationalDayListQuery,
  OperationalDayListResult,
} from "@/features/master/operational-days/types/operational-days.types";
import {
  OPERATIONAL_DAYS_DEFAULT_PER_PAGE,
  OPERATIONAL_DAYS_MAX_PER_PAGE,
} from "@/features/master/operational-days/types/operational-days.types";
import type { LaravelResponse } from "@/types/api";

function clampPerPage(value: number | undefined): number {
  const raw = value ?? OPERATIONAL_DAYS_DEFAULT_PER_PAGE;
  if (!Number.isFinite(raw) || raw < 1) return OPERATIONAL_DAYS_DEFAULT_PER_PAGE;
  return Math.min(Math.floor(raw), OPERATIONAL_DAYS_MAX_PER_PAGE);
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

function parseRow(row: unknown): OperationalDay | null {
  const parsed = operationalDayDtoSchema.safeParse(row);
  if (!parsed.success) return null;
  return mapOperationalDayDto(parsed.data);
}

/** Laravel: GET /api/OperationalDaysList */
export async function listOperationalDays(
  query: OperationalDayListQuery = {},
): Promise<OperationalDayListResult> {
  return withUnauthorizedClear(async () => {
    const token = await requireAccessToken();
    const payload = await api.get<LaravelResponse<OperationalDayDto[]>>(
      endpoints.operationalDays.list,
      {
        accessToken: token,
        expectEnvelope: false,
        searchParams: {
          page: query.page ?? 1,
          per_page: clampPerPage(query.perPage),
          rec_id: query.recId,
          branch_id: query.branchId,
          day_of_week: query.dayOfWeek,
          is_operational: query.isOperational,
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
          : "Failed to load operational days";
      throw new ApiError({
        message,
        status: 500,
        code: "UNEXPECTED",
        details: payload,
      });
    }

    const rows = Array.isArray(payload.data) ? payload.data : [];
    const items = rows.flatMap((row) => {
      const day = parseRow(row);
      return day ? [day] : [];
    });

    let meta: OperationalDayListResult["meta"] = null;
    if (payload.meta) {
      const metaParsed = paginationMetaDtoSchema.safeParse(payload.meta);
      if (metaParsed.success) {
        meta = mapPaginationMetaDto(metaParsed.data);
      }
    }

    return { items, meta };
  });
}

/** Laravel: POST /api/OperationalDaysAdd */
export async function createOperationalDay(
  input: unknown,
): Promise<OperationalDay> {
  const validated = operationalDayCreateInputSchema.safeParse(input);
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
    const body = mapOperationalDayCreateToDto(validated.data);
    const data = await api.post<OperationalDayDto>(
      endpoints.operationalDays.add,
      body,
      { accessToken: token, expectEnvelope: true },
    );

    if (!data) {
      throw new ApiError({
        message: "Operational day create returned no data",
        status: 500,
        code: "UNEXPECTED",
      });
    }

    const day = parseRow(data);
    if (!day) {
      throw new ApiError({
        message: "Operational day create response shape was unexpected",
        status: 500,
        code: "UNEXPECTED",
      });
    }

    return day;
  });
}

/** Laravel: POST /api/OperationalDaysEdit */
export async function updateOperationalDay(
  input: unknown,
): Promise<OperationalDay> {
  const validated = operationalDayUpdateInputSchema.safeParse(input);
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
    const body = mapOperationalDayUpdateToDto(validated.data);
    const data = await api.post<OperationalDayDto>(
      endpoints.operationalDays.edit,
      body,
      { accessToken: token, expectEnvelope: true },
    );

    if (!data) {
      throw new ApiError({
        message: "Operational day update returned no data",
        status: 500,
        code: "UNEXPECTED",
      });
    }

    const day = parseRow(data);
    if (!day) {
      throw new ApiError({
        message: "Operational day update response shape was unexpected",
        status: 500,
        code: "UNEXPECTED",
      });
    }

    return day;
  });
}
