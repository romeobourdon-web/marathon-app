// Les dates sont manipulées comme des chaînes "AAAA-MM-JJ" pour éviter
// les décalages de fuseau horaire. Les calculs se font en UTC.

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtc(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`);
}

export function addDays(isoDate: string, days: number): string {
  return new Date(toUtc(isoDate) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Nombre de jours entre deux dates (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / DAY_MS);
}

/** Date du jour à Paris, au format "AAAA-MM-JJ". */
export function todayInParis(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
