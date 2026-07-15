import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import * as reflectionService from "@/lib/services/reflectionService";
import { createReflectionSchema } from "@/lib/validators/reflection";
import { handleApiError } from "@/lib/utils/errors";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const reflections = await reflectionService.list(
      userId,
      limit ? parseInt(limit, 10) : 20
    );
    return NextResponse.json({ reflections });
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const parsed = createReflectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const reflection = await reflectionService.create(userId, parsed.data);
    return NextResponse.json(reflection, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}
