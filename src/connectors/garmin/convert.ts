// Conversion des réponses Garmin vers les types neutres (docs/GARMIN.md §4). Fonctions pures, testées.

import type { NeutralActivity, NeutralStream, NeutralWellness } from "@/connectors/types";

// ── Formes utiles des réponses Garmin (seuls les champs lus sont typés) ─────

export interface GarminActivity {
  activityId: number;
  startTimeLocal: string; // "AAAA-MM-JJ HH:MM:SS", heure locale
  startTimeGMT: string; // "AAAA-MM-JJ HH:MM:SS", UTC sans fuseau
  activityType?: { typeKey?: string };
  distance?: number | null;
  duration?: number | null;
  movingDuration?: number | null;
  elapsedDuration?: number | null;
  averageHR?: number | null;
  maxHR?: number | null;
  averageSpeed?: number | null;
  elevationGain?: number | null;
}

export interface GarminActivityDetail {
  summaryDTO?: { directWorkoutRpe?: number | null; directWorkoutFeel?: number | null };
}

export interface GarminDailySummary {
  calendarDate: string;
  heartRate?: { restingValue?: number | null };
}

export interface GarminHrvSummary {
  calendarDate: string;
  lastNightAvg?: number | null;
}

export interface GarminSleepSummary {
  calendarDate: string;
  sleepTimeSeconds?: number | null;
  sleepScores?: { overall?: { value?: number | null } };
}

/** Message « record » d'un FIT décodé par @garmin/fitsdk (échelles appliquées). */
export interface FitRecord {
  timestamp?: Date;
  positionLat?: number; // semicircles
  positionLong?: number; // semicircles
  distance?: number; // m
  enhancedSpeed?: number; // m/s
  speed?: number; // m/s
  enhancedAltitude?: number; // m
  altitude?: number; // m
  heartRate?: number; // bpm
  cadence?: number; // pas par minute d'un pied (convention FIT)
}

// ── Conversions ─────────────────────────────────────────────────────────────

const orNull = (v: number | null | undefined): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** "2026-11-13 06:12:30" (UTC sans fuseau) → "2026-11-13T06:12:30Z" */
export function gmtToIso(gmt: string): string {
  return `${gmt.trim().replace(" ", "T")}Z`;
}

export function toNeutralActivity(a: GarminActivity, detail?: GarminActivityDetail | null): NeutralActivity {
  return {
    sourceId: String(a.activityId),
    startTime: gmtToIso(a.startTimeGMT),
    localDate: a.startTimeLocal.slice(0, 10),
    sport: a.activityType?.typeKey ?? "unknown",
    distanceM: orNull(a.distance),
    movingTimeS: orNull(a.movingDuration ?? a.duration),
    elapsedTimeS: orNull(a.elapsedDuration),
    avgHr: orNull(a.averageHR),
    maxHr: orNull(a.maxHR),
    avgSpeedMps: orNull(a.averageSpeed),
    elevationGainM: orNull(a.elevationGain),
    deviceRpe: orNull(detail?.summaryDTO?.directWorkoutRpe),
    deviceFeel: orNull(detail?.summaryDTO?.directWorkoutFeel),
    raw: a,
  };
}

/**
 * Fusionne les trois sources du bien-être par date : résumés quotidiens (FC repos), VFC, sommeil.
 * Une date n'est gardée que si elle a au moins une mesure.
 */
export function toNeutralWellness(
  summaries: GarminDailySummary[],
  hrv: GarminHrvSummary[],
  sleep: GarminSleepSummary[],
): NeutralWellness[] {
  const byDate = new Map<string, { summary?: GarminDailySummary; hrv?: GarminHrvSummary; sleep?: GarminSleepSummary }>();
  const slot = (date: string) => byDate.get(date) ?? byDate.set(date, {}).get(date)!;
  summaries.forEach((s) => (slot(s.calendarDate).summary = s));
  hrv.forEach((h) => (slot(h.calendarDate).hrv = h));
  sleep.forEach((s) => (slot(s.calendarDate).sleep = s));

  return [...byDate.entries()]
    .map(([date, parts]) => ({
      date,
      restingHr: orNull(parts.summary?.heartRate?.restingValue),
      hrvMs: orNull(parts.hrv?.lastNightAvg),
      // 0 s de sommeil = nuit non enregistrée (montre non portée), pas une nuit blanche.
      sleepS: parts.sleep?.sleepTimeSeconds ? parts.sleep.sleepTimeSeconds : null,
      sleepScore: orNull(parts.sleep?.sleepScores?.overall?.value),
      raw: parts,
    }))
    .filter((w) => w.restingHr !== null || w.hrvMs !== null || w.sleepS !== null || w.sleepScore !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

const SEMICIRCLE_TO_DEG = 180 / 2 ** 31;

/** Messages « record » du FIT → séries alignées sur le temps écoulé depuis le premier record. */
export function toNeutralStream(records: FitRecord[]): NeutralStream | null {
  const timed = records.filter((r) => r.timestamp instanceof Date);
  if (timed.length === 0) return null;
  const t0 = timed[0].timestamp!.getTime();
  const deg = (v: number | undefined) => (typeof v === "number" ? v * SEMICIRCLE_TO_DEG : null);
  return {
    timeS: timed.map((r) => (r.timestamp!.getTime() - t0) / 1000),
    distanceM: timed.map((r) => orNull(r.distance)),
    hr: timed.map((r) => orNull(r.heartRate)),
    speedMps: timed.map((r) => orNull(r.enhancedSpeed ?? r.speed)),
    altitudeM: timed.map((r) => orNull(r.enhancedAltitude ?? r.altitude)),
    cadence: timed.map((r) => orNull(r.cadence)),
    lat: timed.map((r) => deg(r.positionLat)),
    lng: timed.map((r) => deg(r.positionLong)),
  };
}
