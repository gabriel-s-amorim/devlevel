import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
  getLevelProgress,
  getStreaks,
  getTotalXP,
} from "@/lib/services/gamificationService";
import { handleApiError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireAuth();
    const [levelProgress, streaks, totalXP] = await Promise.all([
      getLevelProgress(userId),
      getStreaks(userId),
      getTotalXP(userId),
    ]);
    return NextResponse.json({
      levelProgress: { ...levelProgress, totalXP },
      streak: streaks,
      totalXP,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return handleApiError(err);
  }
}
