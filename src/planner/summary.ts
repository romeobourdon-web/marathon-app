// Résumés prévu vs réalisé : par semaine et tendance du volume.

import type { ActivityRecord } from "@/db/types";
import { countsForPlan } from "@/engine/activity";
import { weekStatus, type WeekStatus } from "@/engine/week-status";
import { addDays } from "@/lib/dates";
import { currentWeek } from "@/planner/calendar";
import { TOTAL_WEEKS, phaseForWeek, weekStart } from "@/planner/plan";
import type { Phase, Session } from "@/planner/types";

export interface WeekSummary {
  week: number;
  start: string;
  phase: Phase;
  plannedKm: number;
  doneKm: number; // toutes les courses de la semaine qui comptent pour le plan, liées ou non (D28)
  plannedToDateKm: number; // ce qui était prévu jusqu'à hier inclus
  sessions: Session[];
  doneCount: number;
  remainingCount: number;
  status: WeekStatus;
}

/**
 * Km réalisés une semaine du plan : toutes les courses de la semaine, liées ou non à une séance (D28).
 * Hors plan et donc exclues : autres sports (D22), marche (D28), sorties d'avant le plan.
 */
export function doneKmForWeek(activities: ActivityRecord[], planStart: string, week: number): number {
  const start = weekStart(planStart, week);
  const end = addDays(start, 6);
  return sum(activities.filter((a) => a.date >= start && a.date <= end && countsForPlan(a, planStart)).map((a) => a.distanceKm));
}

/**
 * `sessions` = toutes les séances du plan, liées au réalisé à la date `today` ;
 * `activities` = toutes les activités réalisées (le volume ne dépend pas des liaisons).
 */
export function weekSummary(sessions: Session[], activities: ActivityRecord[], planStart: string, week: number, today: string): WeekSummary {
  const ws = sessions.filter((s) => s.week === week);
  const plannedKm = sum(ws.map((s) => s.distanceKm));
  const doneKm = doneKmForWeek(activities, planStart, week);
  const plannedToDateKm = sum(ws.filter((s) => s.date < today).map((s) => s.distanceKm));

  return {
    week,
    start: weekStart(planStart, week),
    phase: phaseForWeek(week),
    plannedKm,
    doneKm,
    plannedToDateKm,
    sessions: ws,
    doneCount: ws.filter((s) => s.status === "done").length,
    remainingCount: ws.filter((s) => s.status === "today" || s.status === "upcoming").length,
    status: weekStatus(doneKm, plannedToDateKm),
  };
}

export interface VolumePoint {
  week: number;
  plannedKm: number;
  doneKm: number | null; // null = semaine pas encore commencée
  isCurrent: boolean;
}

/** Volume hebdo prévu vs réalisé, des semaines passées jusqu'à quelques semaines à venir. */
export function volumeTrend(
  sessions: Session[],
  activities: ActivityRecord[],
  planStart: string,
  today: string,
  past = 7,
  ahead = 3,
): VolumePoint[] {
  const cw = currentWeek(planStart, today);
  const points: VolumePoint[] = [];
  for (let w = Math.max(1, cw - past); w <= Math.min(TOTAL_WEEKS, cw + ahead); w++) {
    const ws = sessions.filter((s) => s.week === w);
    points.push({
      week: w,
      plannedKm: sum(ws.map((s) => s.distanceKm)),
      doneKm: w > cw ? null : doneKmForWeek(activities, planStart, w),
      isCurrent: w === cw,
    });
  }
  return points;
}

/** Somme arrondie au dixième de km. */
function sum(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) * 10) / 10;
}
