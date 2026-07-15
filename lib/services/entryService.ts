import { prisma } from "@/lib/db/prisma";
import type { CreateEntryInput, UpdateEntryInput } from "@/lib/validators/entry";
import { syncUserGamification, pointsFromEntry } from "@/lib/services/gamificationSync";
import { startOfDay } from "date-fns";

function serializeEntry<T extends { id: string }>(entry: T) {
  return entry;
}

export async function create(userId: string, input: CreateEntryInput) {
  const date = startOfDay(new Date(input.date));

  const entry = await prisma.$transaction(async (tx) => {
    const created = await tx.dailyEntry.create({
      data: {
        userId,
        date,
        projectName: input.projectName,
        entryType: input.entryType,
        description: input.description,
        learned: input.learned,
        difficulty: input.difficulty,
        autonomyScore: input.autonomyScore,
        deepWorkBlockCompleted: input.deepWorkBlockCompleted ?? false,
        interruptionManagedWell: input.interruptionManagedWell ?? false,
      },
    });
    await syncUserGamification(tx, userId);
    return created;
  });

  return serializeEntry(entry);
}

export async function list(
  userId: string,
  opts?: { from?: Date; to?: Date; limit?: number }
) {
  const where: {
    userId: string;
    date?: { gte?: Date; lte?: Date };
  } = { userId };

  if (opts?.from || opts?.to) {
    where.date = {};
    if (opts.from) where.date.gte = startOfDay(opts.from);
    if (opts.to) where.date.lte = startOfDay(opts.to);
  }

  return prisma.dailyEntry.findMany({
    where,
    orderBy: { date: "desc" },
    take: opts?.limit ?? 100,
  });
}

export async function getById(userId: string, id: string) {
  return prisma.dailyEntry.findFirst({
    where: { id, userId },
  });
}

export async function update(userId: string, id: string, input: UpdateEntryInput) {
  const existing = await prisma.dailyEntry.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const entry = await prisma.$transaction(async (tx) => {
    const updated = await tx.dailyEntry.update({
      where: { id },
      data: {
        ...(input.date !== undefined && { date: startOfDay(new Date(input.date)) }),
        ...(input.projectName !== undefined && { projectName: input.projectName }),
        ...(input.entryType !== undefined && { entryType: input.entryType }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.learned !== undefined && { learned: input.learned }),
        ...(input.difficulty !== undefined && { difficulty: input.difficulty }),
        ...(input.autonomyScore !== undefined && { autonomyScore: input.autonomyScore }),
        ...(input.deepWorkBlockCompleted !== undefined && {
          deepWorkBlockCompleted: input.deepWorkBlockCompleted,
        }),
        ...(input.interruptionManagedWell !== undefined && {
          interruptionManagedWell: input.interruptionManagedWell,
        }),
      },
    });
    await syncUserGamification(tx, userId);
    return updated;
  });

  return entry;
}

export async function remove(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.dailyEntry.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await prisma.$transaction(async (tx) => {
    await tx.dailyEntry.delete({ where: { id } });
    await syncUserGamification(tx, userId);
  });

  return true;
}

export { pointsFromEntry };
