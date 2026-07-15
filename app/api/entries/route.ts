import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import * as entryService from "@/lib/services/entryService";
import { createEntrySchema } from "@/lib/validators/entry";
import { handleApiError } from "@/lib/utils/errors";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = searchParams.get("limit");
    const opts: { from?: Date; to?: Date; limit?: number } = {};
    if (from) opts.from = new Date(from);
    if (to) opts.to = new Date(to);
    if (limit) opts.limit = parseInt(limit, 10);
    const entries = await entryService.list(userId, opts);
    return NextResponse.json({ entries });
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const parsed = createEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const entry = await entryService.create(userId, parsed.data);
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}
