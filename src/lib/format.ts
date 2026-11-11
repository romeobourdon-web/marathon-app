// Petites fonctions d'affichage partagées par toutes les pages.

/** 298 → "4'58" */
export function formatPace(secondsPerKm: number): string {
  const s = Math.round(secondsPerKm);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}'${sec.toString().padStart(2, "0")}`;
}

/** { min: 290, max: 300 } → "4'50–5'00" (min = plus rapide) */
export function formatPaceRange(range: { min: number; max: number }): string {
  if (range.min === range.max) return formatPace(range.min);
  return `${formatPace(range.min)}–${formatPace(range.max)}`;
}

/** 12600 → "3h30" ; 3725 → "1h02" ; 2700 → "45 min" */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function formatKm(km: number, digits = 1): string {
  return km.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const shortFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** "2026-10-16" → "vendredi 16 octobre" */
export function formatDayLong(isoDate: string): string {
  return dayFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

/** "2026-10-16" → "ven. 16 oct." */
export function formatDayShort(isoDate: string): string {
  return shortFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}
