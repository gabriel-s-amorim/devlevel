import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import * as experimentService from "@/lib/services/experimentService";
import { logComplianceSchema } from "@/lib/validators/experiment";
import { handleApiError } from "@/lib/utils/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const parsed = logComplianceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const experiment = await experimentService.logCompliance(
      userId,
      params.id,
      parsed.data
    );
    if (!experiment) {
      return NextResponse.json({ error: "Experimento não encontrado" }, { status: 404 });
    }
    return NextResponse.json(experiment);
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}
