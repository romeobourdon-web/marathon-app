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

/** Lundi de la semaine (lundi → dimanche) qui contient la date. */
export function mondayOf(isoDate: string): string {
  const weekday = new Date(toUtc(isoDate)).getUTCDay(); // 0 = dimanche
  return addDays(isoDate, -((weekday + 6) % 7));
}

/** Décalage (minutes) de l'heure de Paris par rapport à UTC à un instant donné (+60 l'hiver, +120 l'été). */
function parisOffsetMinutes(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - utcMs) / 60000);
}

/** Heure locale de Paris (« AAAA-MM-JJTHH:MM:SS ») → instant ISO 8601 en UTC. */
export function parisLocalToUtcIso(local: string): string {
  const naive = Date.parse(`${local}Z`);
  let utc = naive - parisOffsetMinutes(naive) * 60000;
  utc = naive - parisOffsetMinutes(utc) * 60000; // autour d'un changement d'heure
  return new Date(utc).toISOString();
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

/** 45 → { weeks: 6, days: 3 } */
export function splitWeeksDays(totalDays: number): { weeks: number; days: number } {
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}

/** Découpe [from, to] (bornes incluses) en tranches d'au plus `maxDays` jours. */
export function dateChunks(from: string, to: string, maxDays: number): { from: string; to: string }[] {
  const chunks: { from: string; to: string }[] = [];
  for (let start = from; start <= to; start = addDays(start, maxDays)) {
    const end = addDays(start, maxDays - 1);
    chunks.push({ from: start, to: end < to ? end : to });
  }
  return chunks;
}
