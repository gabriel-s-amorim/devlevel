import { prisma } from "@/lib/db/prisma";
import { getLevelFromTotalXP } from "@/lib/utils/gamification";
import { pointsFromEntry } from "@/lib/services/gamificationSync";
import { startOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export async function getTotalXP(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xpTotal: true },
  });
  return user?.xpTotal ?? 0;
}

export async function getStreaks(
  userId: string
): Promise<{ current: number; longest: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true },
  });
  return {
    current: user?.currentStreak ?? 0,
    longest: user?.longestStreak ?? 0,
  };
}

export async function getLevelProgress(userId: string) {
  const totalXP = await getTotalXP(userId);
  return getLevelFromTotalXP(totalXP);
}

export async function getPointsByDay(
  userId: string,
  from: Date,
  to: Date
): Promise<{ date: string; points: number }[]> {
  const entries = await prisma.dailyEntry.findMany({
    where: {
      userId,
      date: { gte: startOfDay(from), lte: startOfDay(to) },
    },
  });

  const byDay: Record<string, number> = {};
  for (const e of entries) {
    const d = startOfDay(new Date(e.date)).toISOString().slice(0, 10);
    byDay[d] = (byDay[d] ?? 0) + pointsFromEntry(e);
  }
  return Object.entries(byDay).map(([date, points]) => ({ date, points }));
}

export async function getWeeklyPoints(
  userId: string,
  weeks: number = 8
): Promise<{ weekStart: string; points: number }[]> {
  const now = new Date();
  const result: { weekStart: string; points: number }[] = [];
  for (let i = 0; i < weeks; i++) {
    const weekStart = startOfWeek(subDays(now, i * 7), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const points = await getPointsByDay(userId, weekStart, weekEnd);
    const total = points.reduce((s, p) => s + p.points, 0);
    result.push({ weekStart: weekStart.toISOString().slice(0, 10), points: total });
  }
  return result.reverse();
}

export async function getMonthlyPoints(userId: string): Promise<number> {
  const now = new Date();
  const data = await getPointsByDay(userId, startOfMonth(now), endOfMonth(now));
  return data.reduce((s, p) => s + p.points, 0);
}
