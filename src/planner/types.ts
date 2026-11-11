// Types du plan : ce qui est prévu (phases, séances) et sa liaison avec le réalisé.

import type { CompletedRun, JournalEntry } from "@/db/types";

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

export type SessionStatus = "done" | "skipped" | "today" | "upcoming";

export interface Session extends PlannedSession {
  status: SessionStatus;
  actual?: CompletedRun;
  journal?: JournalEntry;
}
