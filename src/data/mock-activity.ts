// Simule ce que Strava renverra plus tard : pour chaque séance passée,
// un « réalisé » et une entrée de journal. Le hasard est « graine fixe »
// (même séance → même résultat à chaque rechargement).

import type { CompletedRun, JournalEntry } from "@/db/types";
import type { PlannedSession } from "@/planner/types";

function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (rand: () => number, a: number, b: number) => a + rand() * (b - a);

// Écart d'allure typique (s/km, négatif = plus vite que prévu) et de FC.
// Roméo a tendance à courir ses footings trop vite : c'est son point de travail.
const DRIFT: Record<PlannedSession["type"], { pace: [number, number]; hr: [number, number] }> = {
  ef: { pace: [-34, -10], hr: [3, 14] },
  recup: { pace: [-30, -8], hr: [2, 12] },
  "sortie-longue": { pace: [-12, 14], hr: [0, 9] },
  allure: { pace: [-6, 5], hr: [-2, 4] },
  seuil: { pace: [-6, 7], hr: [-2, 3] },
  fractionne: { pace: [-4, 6], hr: [-3, 2] },
  course: { pace: [-3, 6], hr: [0, 4] },
};

const RPE_BASE: Record<PlannedSession["type"], [number, number]> = {
  recup: [2, 3],
  ef: [3, 5],
  "sortie-longue": [5, 7],
  allure: [6, 7],
  seuil: [7, 8],
  fractionne: [7, 9],
  course: [8, 10],
};

const NOTES: Record<"tooFast" | "good" | "hard" | "short", string[]> = {
  tooFast: [
    "Parti trop vite, j'ai dû me forcer à ralentir après 3 km.",
    "Allure EF dépassée, la FC est montée au-dessus de 150. À surveiller.",
    "Sensations top donc j'ai accéléré… pas l'objectif d'un footing.",
  ],
  good: [
    "Bonnes jambes, séance maîtrisée du début à la fin.",
    "Allure régulière, respiration facile.",
    "Séance propre, je me sens progresser.",
    "Récup bien gérée entre les blocs.",
  ],
  hard: [
    "Jambes lourdes, la fin a été difficile.",
    "Grosse fatigue après la semaine de partiels.",
    "Dur de tenir l'allure sur le dernier bloc.",
  ],
  short: [
    "Raccourci : douleur légère au mollet, je préfère être prudent.",
    "Coupé un peu avant la fin, manque de temps.",
  ],
};

const pick = (rand: () => number, list: string[]) => list[Math.floor(rand() * list.length)];

export function mockActivity(
  s: PlannedSession,
): { skipped: true } | { skipped: false; actual: CompletedRun; journal: JournalEntry } {
  const rand = seededRandom(s.id);

  if (s.type !== "course" && rand() < 0.07) return { skipped: true };

  const drift = DRIFT[s.type];
  const targetPace = (s.targetPace.min + s.targetPace.max) / 2;
  const targetHr = (s.targetHr.min + s.targetHr.max) / 2;

  const cutShort = s.type === "sortie-longue" && rand() < 0.15;
  const distanceKm = s.distanceKm * (cutShort ? between(rand, 0.82, 0.9) : between(rand, 0.97, 1.04));
  const avgPace = targetPace + between(rand, ...drift.pace);
  const avgHr = Math.round(targetHr + between(rand, ...drift.hr));

  const actual: CompletedRun = {
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationSec: Math.round(distanceKm * avgPace),
    avgPace: Math.round(avgPace),
    avgHr,
  };

  const tooFast = avgPace < s.targetPace.min - 5 || avgHr > s.targetHr.max;
  const hard = rand() < 0.2;
  const [rMin, rMax] = RPE_BASE[s.type];
  const rpe = Math.min(10, Math.round(between(rand, rMin, rMax)) + (hard ? 1 : 0));

  const kind = cutShort ? "short" : hard ? "hard" : tooFast && (s.type === "ef" || s.type === "recup") ? "tooFast" : "good";
  const feeling = (kind === "hard" || kind === "short" ? 2 : kind === "tooFast" ? 4 : rand() < 0.5 ? 4 : 5) as JournalEntry["feeling"];

  return { skipped: false, actual, journal: { feeling, rpe, note: pick(rand, NOTES[kind]) } };
}
