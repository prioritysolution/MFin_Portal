import { NextResponse } from "next/server";
import { fetchCurrentUserFromLaravel } from "@/features/auth/services/auth-service";
import { toBffErrorResponse } from "@/lib/api/bff-response";

export async function GET() {
  try {
    const user = await fetchCurrentUserFromLaravel();
    return NextResponse.json({
      success: true,
      message: "User retrieved successfully",
      data: { user },
    });
  } catch (error) {
    return toBffErrorResponse(error);
  }
}
