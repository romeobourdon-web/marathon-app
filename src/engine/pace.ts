// Écarts d'allure par rapport à une fourchette visée.

import type { Range } from "@/planner/types";

/** Écart (s/km) à la fourchette visée : négatif = trop vite, positif = trop lent, 0 = dans la fourchette. */
export function paceGap(pace: number, target: Range): number {
  if (pace < target.min) return pace - target.min;
  if (pace > target.max) return pace - target.max;
  return 0;
}

/** Écart à une fourchette (FC en bpm, allure en s/km…) : 0 dans la fourchette, sinon l'écart signé à la borne dépassée. */
export function rangeGap(value: number, range: Range): number {
  return paceGap(value, range);
}

/** Allure (s/km, arrondie à la seconde) à partir d'une vitesse en m/s. Vitesse nulle → null. */
export function paceFromSpeed(speedMps: number): number | null {
  if (speedMps <= 0) return null;
  return Math.round(1000 / speedMps);
}

/**
 * Allure cible (s/km) pour tenir un temps sur une distance. Arrondie à la seconde inférieure :
 * c'est l'allure qu'il faut tenir (ou battre) pour passer sous le temps visé (3 h 30 sur 42,195 km → 298).
 */
export function targetPace(targetTimeS: number, distanceM: number): number {
  return Math.floor(targetTimeS / (distanceM / 1000));
}
