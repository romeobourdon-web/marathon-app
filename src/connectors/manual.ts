// Sortie saisie à la main (D18, D33) : faite sans montre. Résumé seulement, sans séries.

import type { NeutralActivity } from "@/connectors/types";
import { parisLocalToUtcIso } from "@/lib/dates";

export interface ManualRunInput {
  /** « AAAA-MM-JJ » et « HH:MM », heure de Paris. */
  date: string;
  time: string;
  sport: string;
  distanceKm: number;
  durationSec: number;
  avgHr: number | null;
}

/** Sports proposés dans le formulaire (typeKey Garmin, libellés par lib/format.formatSport). */
export const MANUAL_SPORTS = ["running", "treadmill_running", "trail_running", "cycling", "soccer", "walking", "hiking", "other"] as const;

/** Saisie → activité neutre ; `sourceId` unique fourni par l'appelant (source = 'manual'). */
export function manualRunToActivity(input: ManualRunInput, sourceId: string): NeutralActivity {
  const distanceM = Math.round(input.distanceKm * 1000);
  return {
    sourceId,
    startTime: parisLocalToUtcIso(`${input.date}T${input.time}:00`),
    localDate: input.date,
    sport: input.sport,
    distanceM,
    movingTimeS: input.durationSec,
    elapsedTimeS: input.durationSec,
    avgHr: input.avgHr,
    maxHr: null,
    avgSpeedMps: distanceM / input.durationSec,
    elevationGainM: null,
    deviceRpe: null,
    deviceFeel: null,
    raw: { entered: "app" },
  };
}
