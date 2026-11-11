// Types des données stockées (réalisé, journal, course). Quand on branchera
// Supabase, les tables reprendront ces formes.

export interface CompletedRun {
  distanceKm: number;
  durationSec: number;
  avgPace: number; // secondes/km (sur les blocs pour les séances de qualité)
  avgHr: number;
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
