import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import * as dashboardService from "@/lib/services/dashboardService";
import { handleApiError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireAuth();
    const data = await dashboardService.getDashboardData(userId);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}
