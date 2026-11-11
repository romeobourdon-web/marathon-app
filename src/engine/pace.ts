// Écarts d'allure par rapport à une fourchette visée.

import type { Range } from "@/planner/types";

/** Écart (s/km) à la fourchette visée : négatif = trop vite, positif = trop lent, 0 = dans la fourchette. */
export function paceGap(pace: number, target: Range): number {
  if (pace < target.min) return pace - target.min;
  if (pace > target.max) return pace - target.max;
  return 0;
}
