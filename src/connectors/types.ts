// Interface commune à toutes les sources de données (ARCHITECTURE.md §3, D13).
// Types NEUTRES : mesures brutes (m, s, m/s, bpm), dates ISO, rien de propre à une source.
// La réponse d'origine est conservée telle quelle dans `raw` (D14, GPS compris : D19).

/** Une activité, quel que soit le sport (D21 : tout est importé). */
export interface NeutralActivity {
  /** Identifiant de l'activité dans la source (clé d'unicité avec la source). */
  sourceId: string;
  /** Début de l'activité, ISO 8601 en UTC. */
  startTime: string;
  /** Date locale du début (« AAAA-MM-JJ »), pour la liaison avec la séance prévue. */
  localDate: string;
  sport: string;
  distanceM: number | null;
  movingTimeS: number | null;
  elapsedTimeS: number | null;
  avgHr: number | null;
  maxHr: number | null;
  avgSpeedMps: number | null;
  elevationGainM: number | null;
  /** Ressenti saisi sur l'appareil (D20), échelle propre à la source ; null si absent ou non demandé. */
  deviceRpe: number | null;
  deviceFeel: number | null;
  raw: unknown;
}

/** Séries temporelles d'une activité : tableaux alignés sur timeS (secondes depuis le début). null = mesure absente à cet instant. */
export interface NeutralStream {
  timeS: number[];
  distanceM: (number | null)[];
  hr: (number | null)[];
  speedMps: (number | null)[];
  altitudeM: (number | null)[];
  cadence: (number | null)[];
  lat: (number | null)[];
  lng: (number | null)[];
}

/** Bien-être d'une journée. null = pas de mesure ce jour-là (jamais d'interpolation, D04). */
export interface NeutralWellness {
  date: string;
  restingHr: number | null;
  hrvMs: number | null;
  sleepS: number | null;
  sleepScore: number | null;
  raw: unknown;
}

export interface FetchActivitiesOptions {
  /** Activités déjà connues : leurs détails ne sont pas redemandés (moins d'appels). */
  knownSourceIds?: Set<string>;
}

export interface DataSource {
  readonly source: "garmin" | "fit_file";
  /** Activités dont le début est entre `from` et `to` (dates locales incluses). */
  fetchActivities(from: string, to: string, options?: FetchActivitiesOptions): Promise<NeutralActivity[]>;
  /** Séries temporelles d'une activité ; null si la source n'en fournit pas. */
  fetchStreams(sourceId: string): Promise<NeutralStream | null>;
  /** Bien-être quotidien entre `from` et `to` inclus. */
  fetchWellness(from: string, to: string): Promise<NeutralWellness[]>;
}
