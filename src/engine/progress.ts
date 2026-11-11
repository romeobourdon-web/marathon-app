// Pourcentages de progression affichés par les écrans.

/** Avancement dans le plan, en % arrondi à l'unité. */
export function planProgressPct(week: number, totalWeeks: number): number {
  return Math.round((week / totalWeeks) * 100);
}

/** Part de `total` représentée par `part`, en %, plafonnée à 100 (non arrondie). */
export function cappedPct(part: number, total: number): number {
  return Math.min(100, (part / total) * 100);
}
