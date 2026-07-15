import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import * as reflectionService from "@/lib/services/reflectionService";
import { updateReflectionSchema } from "@/lib/validators/reflection";
import { handleApiError } from "@/lib/utils/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const reflection = await reflectionService.getById(userId, params.id);
    if (!reflection) {
      return NextResponse.json({ error: "Reflexão não encontrada" }, { status: 404 });
    }
    return NextResponse.json(reflection);
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
    const parsed = updateReflectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const reflection = await reflectionService.update(userId, params.id, parsed.data);
    if (!reflection) {
      return NextResponse.json({ error: "Reflexão não encontrada" }, { status: 404 });
    }
    return NextResponse.json(reflection);
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
    const deleted = await reflectionService.remove(userId, params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Reflexão não encontrada" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}
