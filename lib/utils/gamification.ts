import { POINTS, getLevelFromTotalXP } from "@/lib/constants/gamification";
import type { EntryType } from "@/types";

export interface EntryForPoints {
  entryType: EntryType;
  difficulty?: number;
  deepWorkBlockCompleted: boolean;
  interruptionManagedWell: boolean;
  learned?: string;
}

export function calculatePointsForEntry(entry: EntryForPoints): number {
  let points = 0;
  if (entry.deepWorkBlockCompleted) points += POINTS.DEEP_WORK_BLOCK;
  if (entry.entryType === "incident") points += POINTS.INCIDENT_RESOLVED;
  if (entry.entryType === "study" && entry.learned) points += POINTS.NEW_APPLIED_LEARNING;
  if (entry.entryType === "project" && (entry.difficulty ?? 0) >= 4) points += POINTS.LARGE_TASK_COMPLETED;
  if (entry.interruptionManagedWell) points += POINTS.INTERRUPTION_MANAGED;
  return points;
}

function toUTCDayKey(d: Date): number {
  const x = new Date(d);
  return Date.UTC(x.getFullYear(), x.getMonth(), x.getDate());
}

/**
 * Streak from unique calendar days (local timezone).
 * `current` is non-zero only when the most recent day in the set is today.
 */
export function calculateStreak(dates: Date[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const uniqueDays = Array.from(new Set(dates.map(toUTCDayKey))).sort((a, b) => a - b);
  const todayKey = toUTCDayKey(new Date());
  const DAY_MS = 24 * 60 * 60 * 1000;

  let longest = 1;
  let run = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i] - uniqueDays[i - 1] === DAY_MS) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  let current = 0;
  if (uniqueDays[uniqueDays.length - 1] === todayKey) {
    current = 1;
    for (let i = uniqueDays.length - 1; i > 0; i--) {
      if (uniqueDays[i] - uniqueDays[i - 1] === DAY_MS) current++;
      else break;
    }
  }

  return { current, longest: Math.max(longest, current || 1) };
}

export { getLevelFromTotalXP } from "@/lib/constants/gamification";
