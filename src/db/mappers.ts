// Conversion des lignes de la base (mesures brutes : m, s, m/s, bpm) vers les types métier
// utilisés par planner/ et les écrans. Fonctions pures, testées.

import type { Tables } from "@/db/database.types";
import type { ActivityResult, JournalEntry, Race } from "@/db/types";
import { paceFromSpeed, targetPace } from "@/engine/pace";
import type { PhaseId, PlannedSession, SessionType } from "@/planner/types";

export type EventRow = Pick<Tables<"event">, "name" | "date" | "distance_m" | "target_time_s">;

export type JournalRow = Pick<Tables<"journal_entry">, "feeling" | "rpe" | "comment">;

export type LinkedActivityRow = Pick<
  Tables<"activity">,
  "start_time" | "distance_m" | "moving_time_s" | "avg_hr" | "avg_speed_mps"
> & {
  // Relation 1–1 (activity_id UNIQUE) : PostgREST renvoie un objet, ou null.
  journal_entry: JournalRow | JournalRow[] | null;
};

export type PlannedSessionRow = Pick<
  Tables<"planned_session">,
  "id" | "date" | "week" | "type" | "title" | "details" | "distance_m" | "pace_min_s_km" | "pace_max_s_km" | "hr_min" | "hr_max"
> & {
  plan_phase: { code: string } | null;
  session_link: { activity: LinkedActivityRow | null }[];
};

export function toRace(e: EventRow): Race {
  const targetTimeSec = e.target_time_s ?? 0;
  return {
    name: e.name,
    date: e.date,
    distanceKm: e.distance_m / 1000,
    targetTimeSec,
    targetPace: targetPace(targetTimeSec, e.distance_m),
  };
}

export function toPlannedSession(r: PlannedSessionRow): PlannedSession {
  return {
    id: r.id,
    date: r.date,
    week: r.week,
    phase: (r.plan_phase?.code ?? "base") as PhaseId,
    type: r.type as SessionType,
    title: r.title,
    details: r.details,
    distanceKm: r.distance_m / 1000,
    targetPace: { min: r.pace_min_s_km ?? 0, max: r.pace_max_s_km ?? 0 },
    targetHr: { min: r.hr_min ?? 0, max: r.hr_max ?? 0 },
  };
}

function toJournal(j: JournalRow | JournalRow[] | null): JournalEntry | undefined {
  const row = Array.isArray(j) ? j[0] : j;
  if (!row || row.feeling === null || row.rpe === null) return undefined;
  return { feeling: row.feeling as JournalEntry["feeling"], rpe: row.rpe, note: row.comment ?? "" };
}

/**
 * Réalisé d'une séance prévue, lu dans session_link. Sans activité liée → séance non faite
 * (le statut skipped / done / today reste décidé par planner/linkSessions).
 * Plusieurs activités liées (double footing) : la première de la journée.
 */
export function toActivityResult(r: PlannedSessionRow): ActivityResult {
  const activities = r.session_link
    .map((l) => l.activity)
    .filter((a): a is LinkedActivityRow => a !== null)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const a = activities[0];
  if (!a) return { skipped: true };
  return {
    skipped: false,
    actual: {
      distanceKm: (a.distance_m ?? 0) / 1000,
      durationSec: a.moving_time_s ?? 0,
      avgPace: paceFromSpeed(a.avg_speed_mps ?? 0) ?? 0,
      avgHr: a.avg_hr ?? 0,
    },
    journal: toJournal(a.journal_entry),
  };
}
