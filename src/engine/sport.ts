// Sports Garmin comptés comme de la course à pied (D21 : tout est importé ; D22 : seules ces courses
// sont liées aux séances, les autres sports sont « hors plan »).

const RUNNING_SPORTS = new Set(["running", "treadmill_running"]);

/** Vrai si l'activité est une course à pied (et peut donc réaliser une séance prévue). */
export function isRunningSport(sport: string): boolean {
  return RUNNING_SPORTS.has(sport);
}
