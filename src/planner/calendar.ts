// Repères dans le temps : semaine courante du plan, jours avant la course.

import { daysBetween } from "@/lib/dates";
import { TOTAL_WEEKS, weekStart } from "@/planner/plan";

/** Numéro de la semaine du plan contenant `today` (borné entre 1 et TOTAL_WEEKS). */
export function currentWeek(planStart: string, today: string): number {
  const w = Math.floor(daysBetween(weekStart(planStart, 1), today) / 7) + 1;
  return Math.min(Math.max(w, 1), TOTAL_WEEKS);
}

export function daysToRace(today: string, raceDate: string): number {
  return daysBetween(today, raceDate);
}
