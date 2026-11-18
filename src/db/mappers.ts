// Conversion des lignes de la base (mesures brutes : m, s, m/s, bpm) vers les types métier
// utilisés par planner/ et les écrans. Fonctions pures, testées.

import type { NeutralActivity } from "@/connectors/types";
import type { Json, Tables, TablesInsert } from "@/db/database.types";
import type { ActivityRecord, ActivityResult, CompletedRun, JournalEntry, Race } from "@/db/types";
import { combineActivities } from "@/engine/activity";
import { paceFromSpeed, targetPace } from "@/engine/pace";
import type { PhaseId, PlannedSession, SessionType } from "@/planner/types";

export type EventRow = Pick<Tables<"event">, "name" | "date" | "distance_m" | "target_time_s">;

export type JournalRow = Pick<Tables<"journal_entry">, "feeling" | "rpe" | "comment">;

export type LinkedActivityRow = Pick<
  Tables<"activity">,
  "source" | "start_time" | "distance_m" | "moving_time_s" | "avg_hr" | "avg_speed_mps"
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
 * (le statut done / skipped / today / upcoming reste décidé par planner/linkSessions).
 * Plusieurs activités liées (double sortie) : agrégées par engine/combineActivities (D28) ;
 * le journal est celui de la première activité qui en a un.
 * `ignoreMock` : les activités fictives (source = 'mock') sont ignorées dès que de vraies activités existent.
 */
export function toActivityResult(r: PlannedSessionRow, options: { ignoreMock?: boolean } = {}): ActivityResult {
  const activities = r.session_link
    .map((l) => l.activity)
    .filter((a): a is LinkedActivityRow => a !== null && !(options.ignoreMock && a.source === "mock"))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const runs: CompletedRun[] = activities.map((a) => ({
    distanceKm: (a.distance_m ?? 0) / 1000,
    durationSec: a.moving_time_s ?? 0,
    avgPace: paceFromSpeed(a.avg_speed_mps ?? 0) ?? 0,
    avgHr: a.avg_hr ?? 0,
  }));
  const actual = combineActivities(runs);
  if (!actual) return { skipped: true };
  const journal = activities.map((a) => toJournal(a.journal_entry)).find((j) => j !== undefined);
  return { skipped: false, actual, journal };
}

export type ActivityRow = Pick<
  Tables<"activity">,
  "id" | "local_date" | "start_time" | "sport" | "distance_m" | "moving_time_s" | "avg_hr" | "avg_speed_mps"
>;

/** Une activité réalisée, en unités d'affichage (km, s/km). */
export function toActivityRecord(a: ActivityRow): ActivityRecord {
  return {
    id: a.id,
    date: a.local_date,
    startTime: a.start_time,
    sport: a.sport,
    distanceKm: (a.distance_m ?? 0) / 1000,
    durationSec: a.moving_time_s ?? 0,
    avgPace: paceFromSpeed(a.avg_speed_mps ?? 0),
    avgHr: a.avg_hr,
  };
}

/** Activité neutre (connectors/) → ligne à écrire (user_id ajouté par le repository). */
export function toActivityInput(source: TablesInsert<"activity">["source"], a: NeutralActivity): Omit<TablesInsert<"activity">, "user_id"> {
  return {
    source,
    source_id: a.sourceId,
    start_time: a.startTime,
    local_date: a.localDate,
    sport: a.sport,
    distance_m: a.distanceM,
    moving_time_s: a.movingTimeS,
    elapsed_time_s: a.elapsedTimeS,
    avg_hr: a.avgHr,
    max_hr: a.maxHr,
    avg_speed_mps: a.avgSpeedMps,
    elevation_gain_m: a.elevationGainM,
    device_rpe: a.deviceRpe,
    device_feel: a.deviceFeel,
    raw: a.raw as Json,
  };
}
