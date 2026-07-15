import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/utils/errors";

const SALT_ROUNDS = 10;

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ id: string; email: string; name: string | null }> {
  const normalized = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw new AppError(400, "Email já cadastrado");

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      name: name.trim() || null,
    },
  });

  return { id: user.id, email: user.email, name: user.name };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      xpTotal: true,
      currentStreak: true,
      longestStreak: true,
      createdAt: true,
    },
  });
}
