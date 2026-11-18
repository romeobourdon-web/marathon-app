// Bien-être du matin (VFC, FC de repos, sommeil) : la valeur la plus récente encore valable.

export interface WellnessDay {
  date: string;
  hrvMs: number | null;
  restingHr: number | null;
  sleepS: number | null;
}

export interface LatestWellness {
  hrvMs: number | null;
  restingHr: number | null;
  sleepS: number | null;
}

/**
 * Pour chaque mesure, la valeur la plus récente datée de `today` ou des `maxAgeDays` jours précédents ;
 * null au-delà (une mesure trop ancienne n'est pas montrée comme celle du jour).
 */
export function latestWellness(days: WellnessDay[], today: string, maxAgeDays = 2): LatestWellness {
  const since = new Date(Date.parse(`${today}T00:00:00Z`) - maxAgeDays * 86_400_000).toISOString().slice(0, 10);
  const recent = days.filter((d) => d.date >= since && d.date <= today).sort((a, b) => b.date.localeCompare(a.date));
  const pick = <K extends keyof LatestWellness>(k: K) => recent.find((d) => d[k] !== null)?.[k] ?? null;
  return { hrvMs: pick("hrvMs"), restingHr: pick("restingHr"), sleepS: pick("sleepS") };
}
