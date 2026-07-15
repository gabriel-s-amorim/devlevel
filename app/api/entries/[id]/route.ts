import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import * as entryService from "@/lib/services/entryService";
import { updateEntrySchema } from "@/lib/validators/entry";
import { handleApiError } from "@/lib/utils/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const entry = await entryService.getById(userId, params.id);
    if (!entry) {
      return NextResponse.json({ error: "Entrada não encontrada" }, { status: 404 });
    }
    return NextResponse.json(entry);
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
    const parsed = updateEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const entry = await entryService.update(userId, params.id, parsed.data);
    if (!entry) {
      return NextResponse.json({ error: "Entrada não encontrada" }, { status: 404 });
    }
    return NextResponse.json(entry);
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
    const deleted = await entryService.remove(userId, params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Entrada não encontrada" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}
