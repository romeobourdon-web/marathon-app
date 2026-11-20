// Types des données stockées (réalisé, journal, course). Quand on branchera
// Supabase, les tables reprendront ces formes.

export interface CompletedRun {
  distanceKm: number;
  durationSec: number;
  avgPace: number; // secondes/km (sur les blocs pour les séances de qualité)
  avgHr: number;
}

/** Une activité réalisée (toutes sources), en unités d'affichage. */
export interface ActivityRecord {
  id: string;
  /** Date locale du début (« AAAA-MM-JJ »). */
  date: string;
  startTime: string;
  sport: string;
  distanceKm: number;
  durationSec: number;
  /** s/km ; null si la vitesse moyenne est inconnue. */
  avgPace: number | null;
  avgHr: number | null;
}

export interface JournalEntry {
  feeling: 1 | 2 | 3 | 4 | 5;
  rpe: number; // 1 à 10
  note: string;
}

export interface Race {
  name: string;
  date: string;
  distanceKm: number;
  targetTimeSec: number;
  targetPace: number;
}

/** Ce que la source d'activités renvoie pour une séance passée. */
export type ActivityResult =
  | { skipped: true }
  | { skipped: false; actual: CompletedRun; journal?: JournalEntry; activityIds?: string[] }; // journal absent tant qu'il n'est pas écrit
