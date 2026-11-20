// Mise à l'échelle des graphiques : l'UI reçoit des coordonnées toutes faites (DESIGN.md §2.7).

const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Hauteurs de barres en % (0–100), relatives à `scaleMax` (par défaut : la plus grande valeur).
 * Une échelle commune permet de comparer prévu et réalisé sur le même axe.
 */
export function barHeightsPct(values: number[], scaleMax = Math.max(0, ...values)): number[] {
  if (scaleMax <= 0) return values.map(() => 0);
  return values.map((v) => round2(clamp((v / scaleMax) * 100, 0, 100)));
}

/** Écart réalisé − prévu, en mètres (négatif = plus court que prévu). */
export function distanceGapM(plannedM: number, doneM: number): number {
  return doneM - plannedM;
}

export interface LineGeometry {
  points: { x: number; y: number }[];
  /** Ordonnées (0–100, 0 en haut) des valeurs de référence (cible, bornes d'une zone visée). */
  refY: number[];
}

/**
 * Courbe dans un repère 0–100 (y = 0 en haut), l'échelle incluant les valeurs de référence.
 * `invert` : axe inversé, la plus petite valeur en haut (allure : plus rapide = plus haut, DESIGN.md §5).
 */
export function lineGeometry(values: number[], refs: number[], options: { invert?: boolean; paddingPct?: number } = {}): LineGeometry {
  const { invert = false, paddingPct = 10 } = options;
  const all = [...values, ...refs];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const inner = 100 - 2 * paddingPct;
  const y = (v: number) => round2(paddingPct + ((invert ? v - min : max - v) / range) * inner);
  const x = (i: number) => (values.length === 1 ? 50 : round2((i / (values.length - 1)) * 100));
  return { points: values.map((v, i) => ({ x: x(i), y: y(v) })), refY: refs.map(y) };
}

/** Haut d'échelle « rond » : le plus petit multiple de `step` qui couvre toutes les valeurs (au moins `step`). */
export function niceScaleMax(values: number[], step: number): number {
  return Math.max(step, Math.ceil(Math.max(0, ...values) / step) * step);
}
