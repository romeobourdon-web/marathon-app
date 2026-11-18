// Import des sorties enregistrées au téléphone (D32) : fichier préparé par le QG depuis Strava,
// data/imports/strava-phone-runs.json (résumés seulement : ni GPS ni FC).

import type { NeutralActivity } from "@/connectors/types";
import { parisLocalToUtcIso } from "@/lib/dates";

export interface PhoneRunFile {
  count: number;
  total_km: number;
  activities: PhoneRun[];
}

export interface PhoneRun {
  strava_id: string;
  /** Heure locale de départ, « AAAA-MM-JJTHH:MM:SS ». */
  start_local: string;
  timezone: string;
  sport: string;
  distance_m: number;
  moving_time_s: number;
  elapsed_time_s: number;
  elevation_gain_m: number | null;
}

/** Préfixe de source_id des sorties importées (source = 'manual'). */
export const PHONE_SOURCE_PREFIX = "strava:";

/** Une sortie du fichier → activité neutre (heure de Paris convertie en UTC, vitesse moyenne déduite). */
export function phoneRunToActivity(r: PhoneRun): NeutralActivity {
  if (r.timezone !== "Europe/Paris") throw new Error(`Fuseau non géré pour ${r.strava_id} : ${r.timezone}`);
  return {
    sourceId: `${PHONE_SOURCE_PREFIX}${r.strava_id}`,
    startTime: parisLocalToUtcIso(r.start_local),
    localDate: r.start_local.slice(0, 10),
    sport: r.sport,
    distanceM: r.distance_m,
    movingTimeS: r.moving_time_s,
    elapsedTimeS: r.elapsed_time_s,
    avgHr: null,
    maxHr: null,
    avgSpeedMps: r.moving_time_s > 0 ? r.distance_m / r.moving_time_s : null,
    elevationGainM: r.elevation_gain_m,
    deviceRpe: null,
    deviceFeel: null,
    raw: r,
  };
}
