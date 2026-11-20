// Analyse d'une sortie à partir de ses séries temporelles (activity_stream, D04) :
// découpage km par km (allure, FC), dérive cardiaque en fin de sortie, cadence moyenne.

export interface StreamInput {
  timeS: number[];
  distanceM: (number | null)[];
  hr: (number | null)[];
}

export interface KmSplit {
  /** Numéro du km (1, 2…) ; le dernier peut être partiel. */
  km: number;
  distanceM: number;
  durationS: number;
  /** Allure du tour, s/km arrondie. */
  paceS: number;
  /** FC moyenne du tour (échantillons du tour), arrondie ; null sans mesure. */
  avgHr: number | null;
}

/** En dessous (m/s), un intervalle est un arrêt : son temps n'entre pas dans l'allure du tour. */
export const MOVING_MIN_SPEED_MPS = 0.5;

/** En dessous, un dernier tour partiel n'est pas montré (quelques pas après le dernier km). */
export const MIN_LAST_SPLIT_M = 100;

/**
 * Tours de 1 km, en temps de mouvement (arrêts exclus) : le passage à chaque km est interpolé entre deux échantillons.
 * La FC d'un tour est la moyenne des échantillons dont la distance tombe dans le tour.
 */
export function kmSplits({ timeS, distanceM, hr }: StreamInput): KmSplit[] {
  // t = temps en mouvement : un intervalle plus lent que MOVING_MIN_SPEED_MPS (arrêt, feu rouge) ne compte pas.
  const pts: { t: number; d: number; hr: number | null }[] = [];
  let lastRawT = 0;
  for (let i = 0; i < timeS.length; i++) {
    const d = distanceM[i];
    if (d === null || d === undefined || (pts.length > 0 && d < pts[pts.length - 1].d)) continue;
    if (pts.length === 0) {
      pts.push({ t: 0, d, hr: hr[i] ?? null });
    } else {
      const prev = pts[pts.length - 1];
      const dt = timeS[i] - lastRawT;
      const moving = dt > 0 && (d - prev.d) / dt >= MOVING_MIN_SPEED_MPS;
      pts.push({ t: prev.t + (moving ? dt : 0), d, hr: hr[i] ?? null });
    }
    lastRawT = timeS[i];
  }
  if (pts.length < 2) return [];

  const splits: KmSplit[] = [];
  let startT = pts[0].t;
  let startD = pts[0].d;
  let hrSum = 0;
  let hrCount = 0;
  const close = (endT: number, endD: number) => {
    const distance = endD - startD;
    const duration = endT - startT;
    splits.push({
      km: splits.length + 1,
      distanceM: Math.round(distance),
      durationS: Math.round(duration),
      paceS: Math.round(duration / (distance / 1000)),
      avgHr: hrCount > 0 ? Math.round(hrSum / hrCount) : null,
    });
    startT = endT;
    startD = endD;
    hrSum = 0;
    hrCount = 0;
  };

  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    let boundary = (splits.length + 1) * 1000 + pts[0].d;
    while (b.d >= boundary && b.d > a.d) {
      const t = a.t + ((boundary - a.d) / (b.d - a.d)) * (b.t - a.t);
      close(t, boundary);
      boundary += 1000;
    }
    if (b.hr !== null && b.hr > 0) {
      hrSum += b.hr;
      hrCount++;
    }
  }
  const last = pts[pts.length - 1];
  if (last.d - startD >= MIN_LAST_SPLIT_M) close(last.t, last.d);
  return splits;
}

/** « Dérive en fin » : la FC moyenne de chacun des `lastN` derniers km dépasse le haut de la zone visée. */
export function endHrDrift(splits: KmSplit[], hrMax: number, lastN = 3): boolean {
  if (splits.length < lastN) return false;
  return splits.slice(-lastN).every((s) => s.avgHr !== null && s.avgHr > hrMax);
}

/**
 * Cadence moyenne en pas par minute (deux pieds) : Garmin enregistre la cadence d'un pied, d'où × 2 (D22).
 * Les arrêts (cadence nulle) sont ignorés ; null sans mesure.
 */
export function avgCadenceSpm(cadence: (number | null)[]): number | null {
  const values = cadence.filter((c): c is number => c !== null && c > 0);
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 2);
}
