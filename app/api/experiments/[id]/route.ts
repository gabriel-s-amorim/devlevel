import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import * as experimentService from "@/lib/services/experimentService";
import { updateExperimentSchema } from "@/lib/validators/experiment";
import { handleApiError } from "@/lib/utils/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const experiment = await experimentService.getById(userId, params.id);
    if (!experiment) {
      return NextResponse.json({ error: "Experimento não encontrado" }, { status: 404 });
    }
    return NextResponse.json(experiment);
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const parsed = updateExperimentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const experiment = await experimentService.update(userId, params.id, parsed.data);
    if (!experiment) {
      return NextResponse.json({ error: "Experimento não encontrado" }, { status: 404 });
    }
    return NextResponse.json(experiment);
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const deleted = await experimentService.remove(userId, params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Experimento não encontrado" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}
