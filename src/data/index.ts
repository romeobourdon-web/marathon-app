// Point d'entrée unique des données. Les pages n'appellent que ces fonctions :
// le jour où l'on branche Supabase/Strava, seul ce fichier change.

import { daysBetween } from "@/lib/dates";
import { mockActivity } from "./mock-activity";
import { PHASES, PLANNED_SESSIONS, RACE, TOTAL_WEEKS, weekStart } from "./plan";
import type { Phase, Session } from "./types";

export { PHASES, RACE, TOTAL_WEEKS, TYPE_LABELS, ZONES } from "./plan";
export type * from "./types";

export function getSessions(today: string): Session[] {
  return PLANNED_SESSIONS.map((s) => {
    if (s.date > today) return { ...s, status: "upcoming" };
    if (s.date === today) return { ...s, status: "today" };
    const result = mockActivity(s);
    if (result.skipped) return { ...s, status: "skipped" };
    return { ...s, status: "done", actual: result.actual, journal: result.journal };
  });
}

/** Numéro de la semaine du plan contenant `today` (borné entre 1 et TOTAL_WEEKS). */
export function currentWeek(today: string): number {
  const w = Math.floor(daysBetween(weekStart(1), today) / 7) + 1;
  return Math.min(Math.max(w, 1), TOTAL_WEEKS);
}

export function phaseForWeek(week: number): Phase {
  return PHASES.find((p) => week >= p.weeks.min && week <= p.weeks.max)!;
}

export type WeekStatus = "avance" | "ok" | "retard";

export interface WeekSummary {
  week: number;
  start: string;
  phase: Phase;
  plannedKm: number;
  doneKm: number;
  plannedToDateKm: number; // ce qui était prévu jusqu'à hier inclus
  sessions: Session[];
  doneCount: number;
  remainingCount: number;
  status: WeekStatus;
}

export function getWeekSummary(week: number, today: string): WeekSummary {
  const sessions = getSessions(today).filter((s) => s.week === week);
  const plannedKm = sum(sessions.map((s) => s.distanceKm));
  const doneKm = sum(sessions.map((s) => s.actual?.distanceKm ?? 0));
  const plannedToDateKm = sum(sessions.filter((s) => s.date < today).map((s) => s.distanceKm));

  const ratio = plannedToDateKm === 0 ? 1 : doneKm / plannedToDateKm;
  const status: WeekStatus = ratio >= 1.05 ? "avance" : ratio >= 0.9 ? "ok" : "retard";

  return {
    week,
    start: weekStart(week),
    phase: phaseForWeek(week),
    plannedKm,
    doneKm,
    plannedToDateKm,
    sessions,
    doneCount: sessions.filter((s) => s.status === "done").length,
    remainingCount: sessions.filter((s) => s.status === "today" || s.status === "upcoming").length,
    status,
  };
}

export interface VolumePoint {
  week: number;
  plannedKm: number;
  doneKm: number | null; // null = semaine pas encore commencée
  isCurrent: boolean;
}

/** Volume hebdo prévu vs réalisé, des semaines passées jusqu'à quelques semaines à venir. */
export function getVolumeTrend(today: string, past = 7, ahead = 3): VolumePoint[] {
  const sessions = getSessions(today);
  const cw = currentWeek(today);
  const points: VolumePoint[] = [];
  for (let w = Math.max(1, cw - past); w <= Math.min(TOTAL_WEEKS, cw + ahead); w++) {
    const ws = sessions.filter((s) => s.week === w);
    points.push({
      week: w,
      plannedKm: sum(ws.map((s) => s.distanceKm)),
      doneKm: w > cw ? null : sum(ws.map((s) => s.actual?.distanceKm ?? 0)),
      isCurrent: w === cw,
    });
  }
  return points;
}

/** La séance prévue aujourd'hui, sinon la prochaine. */
export function getNextSession(today: string): Session | undefined {
  return getSessions(today).find((s) => s.status === "today" || s.status === "upcoming");
}

export function daysToRace(today: string): number {
  return daysBetween(today, RACE.date);
}

function sum(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) * 10) / 10;
}
