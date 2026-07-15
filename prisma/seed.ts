import { PrismaClient, EntryType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, startOfDay, startOfWeek } from "date-fns";
import { calculatePointsForEntry, calculateStreak } from "../lib/utils/gamification";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@devlevel.app";
const DEMO_PASSWORD = "demo1234";

async function main() {
  console.log("Seeding DevLevel demo data...");

  await prisma.complianceLog.deleteMany({});
  await prisma.experiment.deleteMany({});
  await prisma.weeklyReflection.deleteMany({});
  await prisma.dailyEntry.deleteMany({});
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      name: "Demo Dev",
    },
  });

  const today = startOfDay(new Date());
  const entryTemplates: Array<{
    offset: number;
    entryType: EntryType;
    projectName: string;
    description: string;
    learned?: string;
    difficulty: number;
    autonomyScore: number;
    deepWorkBlockCompleted: boolean;
    interruptionManagedWell: boolean;
  }> = [];

  for (let i = 0; i < 35; i++) {
    const dayOfWeek = subDays(today, i).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends mostly

    const types: EntryType[] = ["project", "incident", "study"];
    const entryType = types[i % 3];
    entryTemplates.push({
      offset: i,
      entryType,
      projectName:
        entryType === "study"
          ? "Aprendizado contínuo"
          : entryType === "incident"
            ? "On-call"
            : ["API Gateway", "DevLevel", "Billing Service"][i % 3],
      description:
        entryType === "incident"
          ? "Investiguei e resolvi incidente de latência no endpoint crítico."
          : entryType === "study"
            ? "Estudei padrões de transaction isolation e Prisma."
            : "Avancei feature de dashboard com métricas agregadas.",
      learned:
        entryType === "study" || i % 4 === 0
          ? "Separar writes pesados de reads O(1) com campos agregados."
          : undefined,
      difficulty: 2 + (i % 4),
      autonomyScore: 5 + (i % 5),
      deepWorkBlockCompleted: i % 2 === 0,
      interruptionManagedWell: i % 3 !== 0,
    });
  }

  for (const t of entryTemplates) {
    await prisma.dailyEntry.create({
      data: {
        userId: user.id,
        date: startOfDay(subDays(today, t.offset)),
        projectName: t.projectName,
        entryType: t.entryType,
        description: t.description,
        learned: t.learned,
        difficulty: t.difficulty,
        autonomyScore: t.autonomyScore,
        deepWorkBlockCompleted: t.deepWorkBlockCompleted,
        interruptionManagedWell: t.interruptionManagedWell,
      },
    });
  }

  const allEntries = await prisma.dailyEntry.findMany({ where: { userId: user.id } });
  const xpTotal = allEntries.reduce(
    (sum, e) =>
      sum +
      calculatePointsForEntry({
        entryType: e.entryType,
        difficulty: e.difficulty ?? undefined,
        deepWorkBlockCompleted: e.deepWorkBlockCompleted,
        interruptionManagedWell: e.interruptionManagedWell,
        learned: e.learned ?? undefined,
      }),
    0
  );
  const streaks = calculateStreak(allEntries.map((e) => e.date));

  await prisma.user.update({
    where: { id: user.id },
    data: {
      xpTotal,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
    },
  });

  for (let w = 0; w < 5; w++) {
    const weekStart = startOfWeek(subDays(today, w * 7), { weekStartsOn: 1 });
    await prisma.weeklyReflection.create({
      data: {
        userId: user.id,
        weekStartDate: weekStart,
        whatDidILearn: `Semana ${w + 1}: refinei o loop de journal e medição de autonomia.`,
        whereDidIImprove: "Mais blocos de deep work e menos contexto perdido.",
        mainChallenge: "Interrupções no meio da tarde e context switching.",
        autonomyAverage: 6 + (w % 3),
      },
    });
  }

  const expStart = startOfDay(subDays(today, 28));
  const expEnd = today;
  const experiment = await prisma.experiment.create({
    data: {
      userId: user.id,
      name: "90 min de deep work",
      description:
        "Experimentar um bloco diário de 90 minutos sem Slack/email e medir impacto em XP e autonomia.",
      startDate: expStart,
      endDate: expEnd,
      targetMetric: "90 min deep work diário",
    },
  });

  for (let i = 0; i < 28; i++) {
    const d = startOfDay(subDays(today, i));
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    await prisma.complianceLog.create({
      data: {
        experimentId: experiment.id,
        date: d,
        completed: i % 5 !== 0,
        value: i % 5 !== 0 ? 90 : 30,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  Entries:  ${allEntries.length}`);
  console.log(`  XP total: ${xpTotal}`);
  console.log(`  Streak:   ${streaks.current} (longest ${streaks.longest})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
