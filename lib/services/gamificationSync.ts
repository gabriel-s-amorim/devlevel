import { calculatePointsForEntry, calculateStreak } from "@/lib/utils/gamification";
import type { Prisma, EntryType } from "@prisma/client";

type Tx = Prisma.TransactionClient;

type EntryPointsFields = {
  entryType: EntryType;
  difficulty: number | null;
  deepWorkBlockCompleted: boolean;
  interruptionManagedWell: boolean;
  learned: string | null;
};

export function pointsFromEntry(entry: EntryPointsFields): number {
  return calculatePointsForEntry({
    entryType: entry.entryType,
    difficulty: entry.difficulty ?? undefined,
    deepWorkBlockCompleted: entry.deepWorkBlockCompleted,
    interruptionManagedWell: entry.interruptionManagedWell,
    learned: entry.learned ?? undefined,
  });
}

/**
 * Recalculate and persist xpTotal + streaks for a user inside an open transaction.
 * Reads stay O(1) via User aggregates; write path may scan distinct entry dates.
 */
export async function syncUserGamification(tx: Tx, userId: string): Promise<void> {
  const entries = await tx.dailyEntry.findMany({
    where: { userId },
    select: {
      date: true,
      entryType: true,
      difficulty: true,
      deepWorkBlockCompleted: true,
      interruptionManagedWell: true,
      learned: true,
    },
  });

  const xpTotal = entries.reduce((sum, e) => sum + pointsFromEntry(e), 0);
  const { current, longest } = calculateStreak(entries.map((e) => e.date));

  await tx.user.update({
    where: { id: userId },
    data: {
      xpTotal,
      currentStreak: current,
      longestStreak: longest,
    },
  });
}
