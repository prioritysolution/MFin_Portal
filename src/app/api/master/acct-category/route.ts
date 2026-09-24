import { NextResponse } from "next/server";
import {
  createAcctCategory,
  listAcctCategories,
  updateAcctCategory,
} from "@/features/master/acct-category/services/acct-category.service";
import { toBffErrorResponse } from "@/lib/api/bff-response";
import { assertHeadOffice, requireSessionUser } from "@/lib/auth/bff-scope";

function readOptionalNumber(raw: string | null): number | undefined {
  if (raw == null || raw === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function readOptionalText(raw: string | null): string | undefined {
  if (raw == null) return undefined;
  const trimmed = raw.trim();
  return trimmed === "" ? undefined : trimmed;
}

export async function GET(request: Request) {
  try {
    await requireSessionUser();
    const { searchParams } = new URL(request.url);

    const keyword =
      readOptionalText(searchParams.get("keyword")) ??
      readOptionalText(searchParams.get("search")) ??
      readOptionalText(searchParams.get("categ_name"));

    const categoryType =
      readOptionalText(searchParams.get("categy_type")) ??
      readOptionalText(searchParams.get("category_type"));

    const result = await listAcctCategories({
      page: readOptionalNumber(searchParams.get("page")),
      perPage: readOptionalNumber(searchParams.get("per_page")),
      categId: readOptionalNumber(searchParams.get("categ_id")),
      keyword,
      categoryType,
    });

    return NextResponse.json({
      success: true,
      message: "Account categories retrieved successfully",
      data: result,
      meta: result.meta,
    });
  } catch (error) {
    return toBffErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    assertHeadOffice(user);
    const body = (await request.json()) as Record<string, unknown>;
    const action = body.action === "update" ? "update" : "create";

    if (action === "update") {
      const { action: _a, ...rest } = body;
      const item = await updateAcctCategory(rest);
      return NextResponse.json({
        success: true,
        message: "Account category updated successfully",
        data: item,
      });
    }

    const { action: _a, ...rest } = body;
    const item = await createAcctCategory(rest);
    return NextResponse.json(
      {
        success: true,
        message: "Account category created successfully",
        data: item,
      },
      { status: 201 },
    );
  } catch (error) {
    return toBffErrorResponse(error);
  }
}
