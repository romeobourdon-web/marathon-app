// Sports Garmin comptés comme de la course à pied (D21 : tout est importé, le filtrage se fait ici).

const RUNNING_SPORTS = new Set(["running", "treadmill_running", "trail_running", "track_running", "street_running", "indoor_running"]);

/** Vrai si l'activité est une course à pied (et peut donc réaliser une séance prévue). */
export function isRunningSport(sport: string): boolean {
  return RUNNING_SPORTS.has(sport);
}
