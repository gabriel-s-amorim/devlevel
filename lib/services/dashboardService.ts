import { prisma } from "@/lib/db/prisma";
import {
  getLevelProgress,
  getStreaks,
  getTotalXP,
  getWeeklyPoints,
  getMonthlyPoints,
} from "./gamificationService";

export async function getDashboardData(userId: string) {
  const [levelProgress, streaks, totalXP, weeklyPoints, monthlyPoints, entries] =
    await Promise.all([
      getLevelProgress(userId),
      getStreaks(userId),
      getTotalXP(userId),
      getWeeklyPoints(userId, 8),
      getMonthlyPoints(userId),
      prisma.dailyEntry.findMany({
        where: { userId },
        select: { autonomyScore: true, entryType: true, date: true },
        orderBy: { date: "asc" },
      }),
    ]);

  const autonomyTrend = entries
    .filter((e) => e.autonomyScore != null)
    .map((e) => ({
      date: new Date(e.date).toISOString().slice(0, 10),
      score: e.autonomyScore as number,
    }));

  const entryTypeCount: Record<string, number> = {
    project: 0,
    incident: 0,
    study: 0,
  };
  for (const e of entries) {
    entryTypeCount[e.entryType] = (entryTypeCount[e.entryType] ?? 0) + 1;
  }
  const entryTypeDistribution = Object.entries(entryTypeCount).map(
    ([type, count]) => ({ type, count })
  );

  return {
    levelProgress: {
      level: levelProgress.level,
      totalXP,
      currentLevelXP: levelProgress.currentLevelXP,
      nextLevelXP: levelProgress.nextLevelXP,
      xpInCurrentLevel: levelProgress.xpInCurrentLevel,
    },
    streak: { current: streaks.current, longest: streaks.longest },
    weeklyPoints,
    monthlyPoints,
    autonomyTrend,
    entryTypeDistribution,
  };
}
