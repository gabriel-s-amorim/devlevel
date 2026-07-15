import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import * as authService from "@/lib/services/authService";
import { handleApiError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireAuth();
    const user = await authService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}
