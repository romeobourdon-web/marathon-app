// Ressenti saisi sur la montre Garmin (D20) → échelles de l'app : ressenti 1–5, RPE 1–10.
// Garmin : directWorkoutFeel 0 / 25 / 50 / 75 / 100 (très faible → très fort) ; directWorkoutRpe 10 à 100 (RPE × 10).

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** 0 → 1, 25 → 2, 50 → 3, 75 → 4, 100 → 5 ; null si absent. */
export function garminFeelTo5(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return clamp(Math.round(value / 25) + 1, 1, 5);
}

/** 10 → 1 … 100 → 10 ; null si absent. */
export function garminRpeTo10(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return clamp(Math.round(value / 10), 1, 10);
}
