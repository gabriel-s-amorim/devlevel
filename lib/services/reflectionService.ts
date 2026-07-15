import { startOfWeek } from "date-fns";
import { prisma } from "@/lib/db/prisma";
import type { CreateReflectionInput, UpdateReflectionInput } from "@/lib/validators/reflection";
import { AppError } from "@/lib/utils/errors";

export async function create(userId: string, input: CreateReflectionInput) {
  const weekStart = startOfWeek(new Date(input.weekStartDate), { weekStartsOn: 1 });

  try {
    return await prisma.weeklyReflection.create({
      data: {
        userId,
        weekStartDate: weekStart,
        whatDidILearn: input.whatDidILearn,
        whereDidIImprove: input.whereDidIImprove,
        mainChallenge: input.mainChallenge,
        autonomyAverage: input.autonomyAverage,
      },
    });
  } catch {
    throw new AppError(400, "Já existe uma reflexão para esta semana");
  }
}

export async function list(userId: string, limit = 20) {
  return prisma.weeklyReflection.findMany({
    where: { userId },
    orderBy: { weekStartDate: "desc" },
    take: limit,
  });
}

export async function getByWeek(userId: string, weekStartDate: Date) {
  const weekStart = startOfWeek(new Date(weekStartDate), { weekStartsOn: 1 });
  return prisma.weeklyReflection.findUnique({
    where: {
      userId_weekStartDate: { userId, weekStartDate: weekStart },
    },
  });
}

export async function getById(userId: string, id: string) {
  return prisma.weeklyReflection.findFirst({
    where: { id, userId },
  });
}

export async function update(userId: string, id: string, input: UpdateReflectionInput) {
  const existing = await prisma.weeklyReflection.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.weeklyReflection.update({
    where: { id },
    data: {
      ...(input.weekStartDate !== undefined && {
        weekStartDate: startOfWeek(new Date(input.weekStartDate), { weekStartsOn: 1 }),
      }),
      ...(input.whatDidILearn !== undefined && { whatDidILearn: input.whatDidILearn }),
      ...(input.whereDidIImprove !== undefined && {
        whereDidIImprove: input.whereDidIImprove,
      }),
      ...(input.mainChallenge !== undefined && { mainChallenge: input.mainChallenge }),
      ...(input.autonomyAverage !== undefined && {
        autonomyAverage: input.autonomyAverage,
      }),
    },
  });
}

export async function remove(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.weeklyReflection.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.weeklyReflection.delete({ where: { id } });
  return true;
}
