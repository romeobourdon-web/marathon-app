// Repères dans le temps : semaine courante du plan, jours avant la course.

import { daysBetween } from "@/lib/dates";
import { PHASES, TOTAL_WEEKS, weekStart } from "@/planner/plan";

/** Numéro de la semaine du plan contenant `today` (borné entre 1 et TOTAL_WEEKS). */
export function currentWeek(planStart: string, today: string): number {
  const w = Math.floor(daysBetween(weekStart(planStart, 1), today) / 7) + 1;
  return Math.min(Math.max(w, 1), TOTAL_WEEKS);
}

export function daysToRace(today: string, raceDate: string): number {
  return daysBetween(today, raceDate);
}

export interface PhaseProgress {
  id: string;
  name: string;
  weeks: number;
  state: "done" | "current" | "future";
  /** Part écoulée de la phase courante (semaines entières), en % arrondi. */
  progressPct: number;
}

/** État de chaque phase du plan pour la semaine `week` (frise des phases). */
export function phaseProgress(week: number): PhaseProgress[] {
  return PHASES.map((p) => {
    const weeks = p.weeks.max - p.weeks.min + 1;
    const state = week > p.weeks.max ? "done" : week >= p.weeks.min ? "current" : "future";
    const progressPct = state === "done" ? 100 : state === "current" ? Math.round(((week - p.weeks.min + 1) / weeks) * 100) : 0;
    return { id: p.id, name: p.name, weeks, state, progressPct };
  });
}

/** Position d'une date sur toute la durée du plan, en % (0 = début, 100 = fin), bornée. */
export function planPositionPct(planStart: string, date: string): number {
  const pct = (daysBetween(weekStart(planStart, 1), date) / (TOTAL_WEEKS * 7)) * 100;
  return Math.round(Math.min(100, Math.max(0, pct)) * 10) / 10;
}
