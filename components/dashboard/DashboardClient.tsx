"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { LevelProgress } from "./LevelProgress";
import { StreakCounter } from "./StreakCounter";
import { WeeklyPointsChart } from "./WeeklyPointsChart";
import { AutonomyTrendChart } from "./AutonomyTrendChart";
import { EntryTypeChart } from "./EntryTypeChart";
import { PointsLegend } from "./PointsLegend";

interface DashboardData {
  levelProgress: {
    level: number;
    totalXP: number;
    currentLevelXP: number;
    nextLevelXP: number;
    xpInCurrentLevel: number;
  };
  streak: { current: number; longest: number };
  weeklyPoints: { weekStart: string; points: number }[];
  monthlyPoints: number;
  autonomyTrend: { date: string; score: number }[];
  entryTypeDistribution: { type: string; count: number }[];
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao carregar dashboard");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400 p-4 animate-fade-in">
        <Icon name="error" size={20} />
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-muted-foreground animate-pulse-soft">
        Carregando métricas...
      </div>
    );
  }

  const {
    levelProgress,
    streak,
    weeklyPoints,
    monthlyPoints,
    autonomyTrend,
    entryTypeDistribution,
  } = data;

  return (
    <div className="space-y-8">
      <h1 className="flex animate-fade-in items-center gap-2 text-2xl font-bold text-foreground">
        <Icon name="dashboard" size={28} className="text-accent" />
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.05s" }}>
          <LevelProgress
            level={levelProgress.level}
            xpInCurrentLevel={levelProgress.xpInCurrentLevel}
            nextLevelXP={levelProgress.nextLevelXP}
            totalXP={levelProgress.totalXP}
          />
        </div>
        <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.1s" }}>
          <StreakCounter current={streak.current} longest={streak.longest} />
        </div>
      </div>

      <div
        className="animate-slide-up rounded-xl border border-border bg-card p-5 opacity-0 transition-shadow duration-200 hover:shadow-lg hover:shadow-accent/5"
        style={{ animationDelay: "0.15s" }}
      >
        <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Icon name="emoji_events" size={20} className="text-accent" />
          Pontos no mês
        </h3>
        <p className="text-2xl font-bold text-accent">{monthlyPoints}</p>
      </div>

      <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.2s" }}>
        <PointsLegend />
      </div>

      <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.25s" }}>
        <WeeklyPointsChart data={weeklyPoints} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.3s" }}>
          <AutonomyTrendChart data={autonomyTrend} />
        </div>
        <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.35s" }}>
          <EntryTypeChart data={entryTypeDistribution} />
        </div>
      </div>
    </div>
  );
}
