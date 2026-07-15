export type EntryType = "project" | "incident" | "study";

export interface DailyEntryDoc {
  id: string;
  userId: string;
  date: Date;
  projectName?: string | null;
  entryType: EntryType;
  description?: string | null;
  learned?: string | null;
  difficulty?: number | null;
  autonomyScore?: number | null;
  deepWorkBlockCompleted: boolean;
  interruptionManagedWell: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyReflectionDoc {
  id: string;
  userId: string;
  weekStartDate: Date;
  whatDidILearn?: string | null;
  whereDidIImprove?: string | null;
  mainChallenge?: string | null;
  autonomyAverage?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperimentComplianceLog {
  id?: string;
  date: Date;
  completed: boolean;
  value?: number | null;
}

export interface ExperimentDoc {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  targetMetric: string;
  complianceLog: ExperimentComplianceLog[];
  createdAt: Date;
  updatedAt: Date;
}
