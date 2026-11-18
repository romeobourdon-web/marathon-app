// Petites fonctions d'affichage partagées par toutes les pages.
import { daysBetween } from "@/lib/dates";

/**
 * 298 → "4'58"
 * @deprecated prototype (D10) : supprimer avec le prototype.
 */
export function formatPace(secondsPerKm: number): string {
  const s = Math.round(secondsPerKm);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}'${sec.toString().padStart(2, "0")}`;
}

/**
 * { min: 290, max: 300 } → "4'50–5'00" (min = plus rapide)
 * @deprecated prototype (D10) : supprimer avec le prototype.
 */
export function formatPaceRange(range: { min: number; max: number }): string {
  if (range.min === range.max) return formatPace(range.min);
  return `${formatPace(range.min)}–${formatPace(range.max)}`;
}

/**
 * 12600 → "3h30" ; 3725 → "1h02" ; 2700 → "45 min"
 * @deprecated prototype (D10) : supprimer avec le prototype.
 */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

/** @deprecated prototype (D10) : supprimer avec le prototype. */
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

/**
 * "2026-10-16" → "vendredi 16 octobre"
 * @deprecated prototype (D10) : supprimer avec le prototype.
 */
export function formatDayLong(isoDate: string): string {
  return dayFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

/**
 * "2026-10-16" → "ven. 16 oct."
 * @deprecated prototype (D10) : supprimer avec le prototype.
 */
export function formatDayShort(isoDate: string): string {
  return shortFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

// ── Formats du design system v1 (DESIGN.md §3) ─────────────────────────────
// Espace insécable entre valeur et unité ; virgule décimale ; vrai signe moins (U+2212).

const NBSP = " ";
const MINUS = "−";

function frNumber(value: number, digits: number): string {
  return value.toLocaleString("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false });
}

/** 330 → "5'30" : allure sans unité, pour une tuile ou un tableau dont l'unité est affichée à part */
export function formatPaceValue(secondsPerKm: number): string {
  const s = Math.round(secondsPerKm);
  return `${Math.floor(s / 60)}'${(s % 60).toString().padStart(2, "0")}`;
}

/** { min: 345, max: 370 } → "5'45–6'10" (min = plus rapide) */
export function formatPaceRangeValue(range: { min: number; max: number }): string {
  return range.min === range.max ? formatPaceValue(range.min) : `${formatPaceValue(range.min)}–${formatPaceValue(range.max)}`;
}

/** 330 → "5'30 /km" (secondes par km) */
export function formatPacePerKm(secondsPerKm: number): string {
  const s = Math.round(secondsPerKm);
  return `${Math.floor(s / 60)}'${(s % 60).toString().padStart(2, "0")}${NBSP}/km`;
}

/** 3960 → "1:06:00" ; 2712 → "45:12" */
export function formatClock(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = (s % 60).toString().padStart(2, "0");
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

/** 3960 → "≈ 1 h 06" ; 2700 → "≈ 45 min" (arrondi à la minute) */
export function formatDurationApprox(totalSeconds: number): string {
  const total = Math.round(totalSeconds / 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `≈${NBSP}${h}${NBSP}h${NBSP}${m.toString().padStart(2, "0")}` : `≈${NBSP}${m}${NBSP}min`;
}

/** 25 600 m → { value: "25,6", unit: "km" } : pour un chiffre héros dont l'unité est stylée à part */
export function formatDistanceParts(meters: number, digits = 1): { value: string; unit: string } {
  return { value: frNumber(meters / 1000, digits), unit: "km" };
}

/** 25 600 m → "25,6 km" (mètres en entrée, mesure brute) */
export function formatDistance(meters: number, digits = 1): string {
  const { value, unit } = formatDistanceParts(meters, digits);
  return `${value}${NBSP}${unit}`;
}

/** 5 → "+5" ; −0,6 → "−0,6" ; 0 → "0" (écart signé, vrai signe moins) */
export function formatSignedDelta(value: number, digits = 0): string {
  const rounded = Number(value.toFixed(digits));
  if (rounded === 0) return frNumber(0, digits);
  const abs = frNumber(Math.abs(rounded), digits);
  return rounded > 0 ? `+${abs}` : `${MINUS}${abs}`;
}

/** (22, 1) → "22 semaines et 1 jour" ; (1, 0) → "1 semaine et 0 jour" */
export function formatWeeksDays(weeks: number, days: number): string {
  return `${weeks}${NBSP}semaine${weeks > 1 ? "s" : ""} et ${days}${NBSP}jour${days > 1 ? "s" : ""}`;
}

const dateFormatters = {
  short: new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }),
  long: new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }),
  full: new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
};

/** "2026-11-14" → "sam. 14 nov." (short), "samedi 14 novembre" (long) ou "sam. 14 novembre 2026" (full) */
export function formatDate(isoDate: string, style: "short" | "long" | "full" = "short"): string {
  return dateFormatters[style].format(new Date(`${isoDate}T00:00:00Z`));
}

const SPORT_LABELS: Record<string, string> = {
  running: "Course",
  treadmill_running: "Tapis",
  trail_running: "Trail",
  cycling: "Vélo",
  soccer: "Football",
  football: "Football",
  walking: "Marche",
  hiking: "Randonnée",
  stand_up_paddleboarding: "Paddle",
};

/** Libellé français d'un sport (typeKey Garmin ; suffixe de version « _v2 » ignoré) (D31). */
export function formatSport(sport: string): string {
  return SPORT_LABELS[sport.replace(/_v\d+$/, "")] ?? "Autre";
}

/** "2026-11-19" vu le 18 → "Demain · jeudi 19 novembre" ; le jour même → "Aujourd'hui · …" ; sinon "Jeudi 19 novembre". */
export function formatRelativeDay(isoDate: string, today: string): string {
  const long = formatDate(isoDate, "long");
  const gap = daysBetween(today, isoDate);
  if (gap === 0) return `Aujourd'hui · ${long}`;
  if (gap === 1) return `Demain · ${long}`;
  return long.charAt(0).toUpperCase() + long.slice(1);
}

/** "2026-11-14" → "S" (initiale du jour, pastilles de la semaine) */
export function formatDayInitial(isoDate: string): string {
  return formatDate(isoDate, "long").charAt(0).toUpperCase();
}

/** Ligne « + n activités hors plan (vélo, 25 km ; marche, 5,1 km), non comptées. » (D31) ; undefined s'il n'y en a pas. */
export function formatOffPlanNote(items: { sport: string; distanceKm: number }[]): string | undefined {
  if (items.length === 0) return undefined;
  const list = items.map((i) => `${formatSport(i.sport).toLowerCase()}, ${formatDistance(i.distanceKm * 1000)}`).join(" ; ");
  const plural = items.length > 1;
  return `+ ${items.length} activité${plural ? "s" : ""} hors plan (${list}), non comptée${plural ? "s" : ""}.`;
}
