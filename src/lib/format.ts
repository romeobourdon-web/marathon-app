// Petites fonctions d'affichage partagées par toutes les pages.
import { daysBetween } from "@/lib/dates";

// ── Formats du design system (DESIGN.md §3) ─────────────────────────────
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

const dayMonth = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

/** ("2026-11-09", "2026-11-15") → "9–15 nov." ; ("2026-09-28", "2026-10-04") → "28 sept.–4 oct." */
export function formatDateRange(from: string, to: string): string {
  const a = new Date(`${from}T00:00:00Z`);
  const b = new Date(`${to}T00:00:00Z`);
  if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()}–${dayMonth.format(b)}`;
  return `${dayMonth.format(a)}–${dayMonth.format(b)}`;
}

const FEELING_WORDS = ["Épuisé", "Difficile", "Correct", "Bien", "Excellent"];

/** Ressenti 1–5 → mot (« 4 » → « Bien ») ; hors échelle → chaîne vide. */
export function formatFeeling(feeling: number): string {
  return FEELING_WORDS[feeling - 1] ?? "";
}

/** "2026-11-17" → "mar." (jour court, lignes de séance du Plan) */
export function formatWeekday(isoDate: string): string {
  return formatDate(isoDate).split(" ")[0];
}
