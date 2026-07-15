import { prisma } from "@/lib/db/prisma";
import type {
  CreateExperimentInput,
  UpdateExperimentInput,
  LogComplianceInput,
} from "@/lib/validators/experiment";
import { startOfDay, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns";
import { calculatePointsForEntry } from "@/lib/utils/gamification";
import { pearsonCorrelation } from "@/lib/utils/correlation";

function withComplianceLog<T extends { complianceLog: unknown[] }>(exp: T) {
  return exp;
}

export async function create(userId: string, input: CreateExperimentInput) {
  const exp = await prisma.experiment.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      targetMetric: input.targetMetric,
    },
    include: { complianceLog: { orderBy: { date: "asc" } } },
  });
  return withComplianceLog(exp);
}

export async function list(userId: string) {
  return prisma.experiment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { complianceLog: { orderBy: { date: "asc" } } },
  });
}

export async function getById(userId: string, id: string) {
  return prisma.experiment.findFirst({
    where: { id, userId },
    include: { complianceLog: { orderBy: { date: "asc" } } },
  });
}

export async function update(userId: string, id: string, input: UpdateExperimentInput) {
  const existing = await prisma.experiment.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.experiment.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.startDate !== undefined && { startDate: input.startDate }),
      ...(input.endDate !== undefined && { endDate: input.endDate }),
      ...(input.targetMetric !== undefined && { targetMetric: input.targetMetric }),
    },
    include: { complianceLog: { orderBy: { date: "asc" } } },
  });
}

export async function remove(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.experiment.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.experiment.delete({ where: { id } });
  return true;
}

export async function logCompliance(
  userId: string,
  experimentId: string,
  input: LogComplianceInput
) {
  const exp = await prisma.experiment.findFirst({
    where: { id: experimentId, userId },
  });
  if (!exp) return null;

  const dateNorm = startOfDay(new Date(input.date));

  await prisma.complianceLog.upsert({
    where: {
      experimentId_date: { experimentId, date: dateNorm },
    },
    create: {
      experimentId,
      date: dateNorm,
      completed: input.completed,
      value: input.value,
    },
    update: {
      completed: input.completed,
      value: input.value,
    },
  });

  return getById(userId, experimentId);
}

export async function getCorrelationData(userId: string, experimentId: string) {
  const exp = await prisma.experiment.findFirst({
    where: { id: experimentId, userId },
    include: { complianceLog: true },
  });
  if (!exp) return null;

  const start = startOfDay(new Date(exp.startDate));
  const end = startOfDay(new Date(exp.endDate));
  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });

  const complianceByWeek = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const inWeek = exp.complianceLog.filter(
      (e) => new Date(e.date) >= weekStart && new Date(e.date) <= weekEnd
    );
    const completed = inWeek.filter((e) => e.completed).length;
    return {
      weekStart: weekStart.toISOString().slice(0, 10),
      completed,
      total: inWeek.length,
      pct: inWeek.length ? (completed / inWeek.length) * 100 : 0,
    };
  });

  const entries = await prisma.dailyEntry.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
  });

  const weeklyXP: Record<string, number> = {};
  const weeklyAutonomySum: Record<string, number> = {};
  const weeklyAutonomyCount: Record<string, number> = {};

  for (const e of entries) {
    const ws = startOfWeek(new Date(e.date), { weekStartsOn: 1 })
      .toISOString()
      .slice(0, 10);
    weeklyXP[ws] =
      (weeklyXP[ws] ?? 0) +
      calculatePointsForEntry({
        entryType: e.entryType,
        difficulty: e.difficulty ?? undefined,
        deepWorkBlockCompleted: e.deepWorkBlockCompleted,
        interruptionManagedWell: e.interruptionManagedWell,
        learned: e.learned ?? undefined,
      });
    if (e.autonomyScore != null) {
      weeklyAutonomySum[ws] = (weeklyAutonomySum[ws] ?? 0) + e.autonomyScore;
      weeklyAutonomyCount[ws] = (weeklyAutonomyCount[ws] ?? 0) + 1;
    }
  }

  const weeklyXPArr = weeks.map((w) => ({
    weekStart: w.toISOString().slice(0, 10),
    points: weeklyXP[w.toISOString().slice(0, 10)] ?? 0,
  }));

  const weeklyAutonomyArr = weeks.map((w) => {
    const ws = w.toISOString().slice(0, 10);
    const sum = weeklyAutonomySum[ws] ?? 0;
    const count = weeklyAutonomyCount[ws] ?? 0;
    return { weekStart: ws, avg: count ? sum / count : 0 };
  });

  const compliancePcts = complianceByWeek.map((w) => w.pct);
  const xpSeries = weeklyXPArr.map((w) => w.points);
  const autonomySeries = weeklyAutonomyArr.map((w) => w.avg);

  return {
    complianceByWeek,
    weeklyXP: weeklyXPArr,
    weeklyAutonomy: weeklyAutonomyArr,
    rComplianceXp: pearsonCorrelation(compliancePcts, xpSeries),
    rComplianceAutonomy: pearsonCorrelation(compliancePcts, autonomySeries),
  };
}
