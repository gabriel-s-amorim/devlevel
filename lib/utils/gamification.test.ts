import { describe, it, expect } from "vitest";
import {
  calculatePointsForEntry,
  calculateStreak,
} from "@/lib/utils/gamification";
import { getLevelFromTotalXP, xpRequiredForLevel } from "@/lib/constants/gamification";

describe("calculatePointsForEntry", () => {
  it("sums all applicable point sources", () => {
    const points = calculatePointsForEntry({
      entryType: "project",
      difficulty: 5,
      deepWorkBlockCompleted: true,
      interruptionManagedWell: true,
      learned: undefined,
    });
    // deep work 2 + large task 5 + interruption 1
    expect(points).toBe(8);
  });

  it("awards study learning and incident points", () => {
    expect(
      calculatePointsForEntry({
        entryType: "study",
        deepWorkBlockCompleted: false,
        interruptionManagedWell: false,
        learned: "Learned Prisma transactions",
      })
    ).toBe(4);

    expect(
      calculatePointsForEntry({
        entryType: "incident",
        deepWorkBlockCompleted: false,
        interruptionManagedWell: false,
      })
    ).toBe(3);
  });

  it("does not award large-task points below difficulty 4", () => {
    expect(
      calculatePointsForEntry({
        entryType: "project",
        difficulty: 3,
        deepWorkBlockCompleted: false,
        interruptionManagedWell: false,
      })
    ).toBe(0);
  });
});

describe("getLevelFromTotalXP", () => {
  it("starts at level 1 with 0 XP", () => {
    const progress = getLevelFromTotalXP(0);
    expect(progress.level).toBe(1);
    expect(progress.xpInCurrentLevel).toBe(0);
  });

  it("levels up after accumulating enough XP", () => {
    const needFor2 = xpRequiredForLevel(2);
    const progress = getLevelFromTotalXP(needFor2);
    expect(progress.level).toBeGreaterThanOrEqual(2);
  });

  it("keeps leftover XP inside the current level band", () => {
    const needFor2 = xpRequiredForLevel(2);
    const progress = getLevelFromTotalXP(needFor2 + 10);
    expect(progress.xpInCurrentLevel).toBe(10);
  });
});

describe("calculateStreak", () => {
  it("returns zeros for empty input", () => {
    expect(calculateStreak([])).toEqual({ current: 0, longest: 0 });
  });

  it("computes longest consecutive run", () => {
    const dates = [
      new Date("2024-01-01"),
      new Date("2024-01-02"),
      new Date("2024-01-03"),
      new Date("2024-01-10"),
    ];
    const { longest } = calculateStreak(dates);
    expect(longest).toBe(3);
  });

  it("sets current streak only when today is included", () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const withToday = calculateStreak([yesterday, today]);
    expect(withToday.current).toBeGreaterThanOrEqual(1);

    const withoutToday = calculateStreak([
      new Date("2020-01-01"),
      new Date("2020-01-02"),
    ]);
    expect(withoutToday.current).toBe(0);
    expect(withoutToday.longest).toBe(2);
  });
});
