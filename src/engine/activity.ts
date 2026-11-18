// Règles sur les activités réalisées (D22, D28) : marche, éligibilité au plan, agrégation.

import type { CompletedRun } from "@/db/types";
import { isRunningSport } from "@/engine/sport";

/** Au-delà de 9'00/km en moyenne, une activité « running » est de la marche (D28). */
export const WALK_PACE_S_PER_KM = 9 * 60;

/** Vrai si une activité de course a une allure moyenne plus lente que 9'00/km (D28). */
export function isWalk(a: { sport: string; avgPace: number | null }): boolean {
  return isRunningSport(a.sport) && a.avgPace !== null && a.avgPace > WALK_PACE_S_PER_KM;
}

/**
 * Vrai si l'activité compte dans le plan : une course (pas un autre sport, D22), pas de la marche (D28),
 * à partir du début du plan. Les autres sont « hors plan » : gardées et visibles, mais hors des totaux.
 */
export function countsForPlan(a: { sport: string; avgPace: number | null; date: string }, planStart: string): boolean {
  return isRunningSport(a.sport) && !isWalk(a) && a.date >= planStart;
}

/**
 * Une séance réalisée en plusieurs activités (D28) : distances et durées additionnées,
 * allure pondérée par la distance (= temps total / distance totale), FC pondérée par le temps.
 */
export function combineActivities(runs: CompletedRun[]): CompletedRun | null {
  if (runs.length === 0) return null;
  if (runs.length === 1) return runs[0];
  const distanceKm = runs.reduce((s, r) => s + r.distanceKm, 0);
  const durationSec = runs.reduce((s, r) => s + r.durationSec, 0);
  const avgPace = distanceKm > 0 ? Math.round(runs.reduce((s, r) => s + r.avgPace * r.distanceKm, 0) / distanceKm) : 0;
  const withHr = runs.filter((r) => r.avgHr > 0);
  const hrTime = withHr.reduce((s, r) => s + r.durationSec, 0);
  const avgHr = hrTime > 0 ? Math.round(withHr.reduce((s, r) => s + r.avgHr * r.durationSec, 0) / hrTime) : 0;
  return { distanceKm: Math.round(distanceKm * 1000) / 1000, durationSec, avgPace, avgHr };
}

/** Écart maximal entre deux départs pour considérer deux enregistrements comme la même sortie (D32). */
export const SAME_RUN_WINDOW_MIN = 30;

/** Vrai si les deux départs (ISO 8601) sont à ± 30 min l'un de l'autre : même sortie enregistrée deux fois (D32). */
export function isSameRun(startA: string, startB: string): boolean {
  return Math.abs(Date.parse(startA) - Date.parse(startB)) <= SAME_RUN_WINDOW_MIN * 60000;
}
