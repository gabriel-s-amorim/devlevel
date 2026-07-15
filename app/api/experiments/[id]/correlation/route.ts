import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import * as experimentService from "@/lib/services/experimentService";
import { handleApiError } from "@/lib/utils/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const data = await experimentService.getCorrelationData(userId, params.id);
    if (!data) {
      return NextResponse.json({ error: "Experimento não encontrado" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}
