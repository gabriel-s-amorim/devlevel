import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import * as experimentService from "@/lib/services/experimentService";
import { createExperimentSchema } from "@/lib/validators/experiment";
import { handleApiError } from "@/lib/utils/errors";

export async function GET() {
  try {
    const userId = await requireAuth();
    const experiments = await experimentService.list(userId);
    return NextResponse.json({ experiments });
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const parsed = createExperimentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const experiment = await experimentService.create(userId, parsed.data);
    return NextResponse.json(experiment, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}
