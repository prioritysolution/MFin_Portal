import { NextResponse } from "next/server";
import {
  createDepositSchemeCharge,
  listDepositSchemeCharges,
  toggleDepositSchemeChargeStatus,
  updateDepositSchemeCharge,
} from "@/features/master/deposit-schemes/services/deposit-schemes.service";
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

    const search =
      readOptionalText(searchParams.get("search")) ??
      readOptionalText(searchParams.get("keyword"));

    const isActiveRaw =
      searchParams.get("is_active") ?? searchParams.get("status");

    const result = await listDepositSchemeCharges({
      page: readOptionalNumber(searchParams.get("page")),
      perPage: readOptionalNumber(searchParams.get("per_page")),
      id: readOptionalNumber(searchParams.get("id")),
      schemeId:
        readOptionalNumber(searchParams.get("scheme_id")) ??
        readOptionalNumber(searchParams.get("schemeId")),
      chargesCd:
        readOptionalNumber(searchParams.get("charges_cd")) ??
        readOptionalNumber(searchParams.get("chargesCd")),
      effectiveOn:
        readOptionalText(searchParams.get("effective_on")) ??
        readOptionalText(searchParams.get("effectiveOn")),
      isActive: readOptionalNumber(isActiveRaw),
      search,
    });

    return NextResponse.json({
      success: true,
      message: "Deposit scheme charges retrieved successfully",
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

    if (body.action === "status") {
      const id =
        typeof body.id === "number"
          ? body.id
          : typeof body.chargeId === "number"
            ? body.chargeId
            : undefined;
      const isActive =
        typeof body.isActive === "boolean"
          ? body.isActive
          : typeof body.is_active === "boolean"
            ? body.is_active
            : false;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message: "id is required",
          },
          { status: 422 },
        );
      }

      const item = await toggleDepositSchemeChargeStatus(id, isActive);
      return NextResponse.json({
        success: true,
        message: isActive
          ? "Deposit scheme charge activated successfully"
          : "Deposit scheme charge deactivated successfully",
        data: item,
      });
    }

    const isUpdate =
      body.action === "update" ||
      (typeof body.id === "number" && body.id > 0);

    if (isUpdate) {
      const payload = { ...body };
      delete payload.action;
      const item = await updateDepositSchemeCharge(payload);
      return NextResponse.json({
        success: true,
        message: "Deposit scheme charge updated successfully",
        data: item,
      });
    }

    const payload = { ...body };
    delete payload.action;
    const item = await createDepositSchemeCharge(payload);
    return NextResponse.json(
      {
        success: true,
        message: "Deposit scheme charge created successfully",
        data: item,
      },
      { status: 201 },
    );
  } catch (error) {
    return toBffErrorResponse(error);
  }
}
