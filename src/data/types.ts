// Le « modèle de données » de l'app. Quand on branchera Supabase/Strava,
// les tables reprendront ces formes.

export type SessionType =
  | "ef"
  | "recup"
  | "fractionne"
  | "seuil"
  | "allure"
  | "sortie-longue"
  | "course";

export type PhaseId = "base" | "construction" | "specifique" | "affutage";

export interface Range {
  min: number;
  max: number;
}

export interface Phase {
  id: PhaseId;
  name: string;
  goal: string;
  weeks: Range; // numéros de semaine inclus
}

export interface PlannedSession {
  id: string;
  date: string; // "AAAA-MM-JJ"
  week: number;
  phase: PhaseId;
  type: SessionType;
  title: string;
  details: string;
  distanceKm: number;
  targetPace: Range; // secondes/km (min = plus rapide)
  targetHr: Range; // bpm
}

export interface CompletedRun {
  distanceKm: number;
  durationSec: number;
  avgPace: number; // secondes/km (sur les blocs pour les séances de qualité)
  avgHr: number;
}

export interface JournalEntry {
  feeling: 1 | 2 | 3 | 4 | 5;
  rpe: number; // 1 à 10
  note: string;
}

export type SessionStatus = "done" | "skipped" | "today" | "upcoming";

export interface Session extends PlannedSession {
  status: SessionStatus;
  actual?: CompletedRun;
  journal?: JournalEntry;
}

export interface Race {
  name: string;
  date: string;
  distanceKm: number;
  targetTimeSec: number;
  targetPace: number;
}
