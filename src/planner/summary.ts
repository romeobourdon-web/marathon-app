// Résumés prévu vs réalisé : par semaine et tendance du volume.

import { weekStatus, type WeekStatus } from "@/engine/week-status";
import { currentWeek } from "@/planner/calendar";
import { TOTAL_WEEKS, phaseForWeek, weekStart } from "@/planner/plan";
import type { Phase, Session } from "@/planner/types";

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

/** `sessions` = toutes les séances du plan, liées au réalisé à la date `today`. */
export function weekSummary(sessions: Session[], planStart: string, week: number, today: string): WeekSummary {
  const ws = sessions.filter((s) => s.week === week);
  const plannedKm = sum(ws.map((s) => s.distanceKm));
  const doneKm = sum(ws.map((s) => s.actual?.distanceKm ?? 0));
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
export function volumeTrend(sessions: Session[], planStart: string, today: string, past = 7, ahead = 3): VolumePoint[] {
  const cw = currentWeek(planStart, today);
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

/** Somme arrondie au dixième de km. */
function sum(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) * 10) / 10;
}
