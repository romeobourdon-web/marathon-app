// Génère le plan d'entraînement fictif (30 semaines, 4 phases).
// Tout est calculé à partir de quelques tableaux : facile à ajuster.

import { addDays } from "@/lib/dates";
import type { Race } from "@/db/types";
import type { Phase, PhaseId, PlannedSession, Range, SessionType } from "@/planner/types";

export const RACE: Race = {
  name: "Marathon du Lac d'Annecy",
  // ⚠️ Date à confirmer : la date officielle 2027 n'est pas encore publiée (prévue mi-avril).
  // Si elle change, ajuster aussi le nombre de semaines dans WEEKS (le dernier dimanche = jour J).
  date: "2027-04-18",
  distanceKm: 42.195,
  targetTimeSec: 3 * 3600 + 30 * 60,
  targetPace: 298, // 4'58/km
};

// Un lundi. En pratique, l'athlète est encore en « phase libre » (pas strictement le plan) :
// ~40-50 km/semaine et sortie longue déjà à 22 km, donc au-dessus des premières semaines prévues.
export const PLAN_START = "2026-09-21";

export const PHASES: Phase[] = [
  {
    id: "base",
    name: "Base aérobie",
    goal: "Courir lentement pour construire le moteur : FC basse, régularité.",
    weeks: { min: 1, max: 8 },
  },
  {
    id: "construction",
    name: "Construction",
    goal: "Monter le volume et la sortie longue, introduire le seuil.",
    weeks: { min: 9, max: 18 },
  },
  {
    id: "specifique",
    name: "Spécifique marathon",
    goal: "Apprivoiser l'allure 4'58 sur de longues portions.",
    weeks: { min: 19, max: 27 },
  },
  {
    id: "affutage",
    name: "Affûtage",
    goal: "Réduire le volume, garder l'intensité, arriver frais.",
    weeks: { min: 28, max: 30 },
  },
];

// FC max 185 bpm : la même valeur que celle utilisée pour les zones Strava de l'athlète.
export const HR_MAX = 185;

/** Fourchette de FC en % de la FC max → bpm. */
function hr(minPct: number, maxPct: number): Range {
  return { min: Math.round((HR_MAX * minPct) / 100), max: Math.round((HR_MAX * maxPct) / 100) };
}

// Zones d'allure (s/km) et de fréquence cardiaque (% FC max → bpm).
export const ZONES: Record<SessionType, { pace: Range; hr: Range }> = {
  recup: { pace: { min: 370, max: 395 }, hr: hr(62, 71) }, // 115–131
  ef: { pace: { min: 345, max: 370 }, hr: hr(69, 77) }, // 128–142
  "sortie-longue": { pace: { min: 340, max: 360 }, hr: hr(71, 78) }, // 131–144
  allure: { pace: { min: 293, max: 300 }, hr: hr(82, 86) }, // 152–159
  seuil: { pace: { min: 270, max: 280 }, hr: hr(87, 91) }, // 161–168
  fractionne: { pace: { min: 235, max: 245 }, hr: hr(91, 97) }, // 168–179
  course: { pace: { min: 295, max: 300 }, hr: hr(82, 88) }, // 152–163
};

export const TYPE_LABELS: Record<SessionType, string> = {
  ef: "Endurance",
  recup: "Récupération",
  fractionne: "Fractionné",
  seuil: "Seuil",
  allure: "Allure marathon",
  "sortie-longue": "Sortie longue",
  course: "Course",
};

// [volume hebdo km, sortie longue km, semaine allégée ?]
const WEEKS: [number, number, boolean][] = [
  // Base (1-8)
  [34, 16, false], [36, 17, false], [38, 18, false], [40, 18, false],
  [33, 15, true], [40, 19, false], [42, 20, false], [44, 21, false],
  // Construction (9-18)
  [44, 20, true], [46, 22, false], [48, 23, false], [40, 18, true],
  [50, 24, false], [52, 25, false], [54, 26, false], [44, 20, true],
  [54, 27, false], [55, 27, false],
  // Spécifique (19-27)
  [56, 28, false], [58, 30, false], [48, 22, true], [58, 30, false],
  [60, 32, false], [62, 32, false], [50, 24, true], [60, 30, false],
  [56, 28, false],
  // Affûtage (28-30)
  [48, 22, false], [38, 16, false], [57, 42.2, false],
];

function phaseOf(week: number): PhaseId {
  return PHASES.find((p) => week >= p.weeks.min && week <= p.weeks.max)!.id;
}

type Workout = { type: SessionType; title: string; details: string };

function qualityWorkout(week: number, phase: PhaseId, light: boolean): Workout {
  const odd = week % 2 === 1;
  if (light)
    return phase === "specifique"
      ? { type: "allure", title: "Rappel allure marathon", details: "Échauffement 20', 2 × 3 km à 4'58, retour au calme." }
      : { type: "fractionne", title: "Fartlek", details: "Échauffement 20', 8 × 1' vite / 1' trot, retour au calme." };
  switch (phase) {
    case "base":
      return odd
        ? { type: "fractionne", title: "VMA courte", details: "Échauffement 20', 10 × 400 m (récup 1'15), retour au calme." }
        : { type: "fractionne", title: "Côtes", details: "Échauffement 20', 8 × 200 m en côte, retour en trottinant." };
    case "construction":
      return odd
        ? { type: "seuil", title: "Seuil", details: "Échauffement 20', 3 × 10' au seuil (récup 2'), retour au calme." }
        : { type: "fractionne", title: "VMA longue", details: "Échauffement 20', 6 × 1000 m (récup 2'), retour au calme." };
    case "specifique":
      return odd
        ? { type: "allure", title: "Allure marathon", details: "Échauffement 20', 3 × 4 km à 4'58 (récup 1 km EF), retour au calme." }
        : { type: "seuil", title: "Seuil long", details: "Échauffement 20', 2 × 15' au seuil (récup 3'), retour au calme." };
    case "affutage":
      return week === 28
        ? { type: "allure", title: "Allure marathon", details: "Échauffement 20', 2 × 5 km à 4'58, retour au calme." }
        : { type: "allure", title: "Rappel allure", details: "Échauffement 15', 3 × 3 km à 4'58, retour au calme." };
  }
}

function longRun(km: number, phase: PhaseId): Workout {
  if (phase === "specifique") {
    const am = Math.round(km * 0.35);
    return {
      type: "sortie-longue",
      title: "Sortie longue avec allure",
      details: `${km} km dont ${am} km à 4'58 dans la seconde moitié. Gels testés comme le jour J.`,
    };
  }
  return {
    type: "sortie-longue",
    title: "Sortie longue",
    details: `${km} km en endurance, FC sous ${ZONES["sortie-longue"].hr.max}. Boire toutes les 20'.`,
  };
}

function session(
  week: number,
  dayOffset: number,
  w: Workout,
  distanceKm: number,
  phase: PhaseId,
): PlannedSession {
  const date = addDays(PLAN_START, (week - 1) * 7 + dayOffset);
  return {
    id: `s${week}-${dayOffset}`,
    date,
    week,
    phase,
    ...w,
    distanceKm,
    targetPace: ZONES[w.type].pace,
    targetHr: ZONES[w.type].hr,
  };
}

function buildPlan(): PlannedSession[] {
  const sessions: PlannedSession[] = [];

  WEEKS.forEach(([volume, longKm, light], i) => {
    const week = i + 1;
    const phase = phaseOf(week);

    if (week === WEEKS.length) {
      // Semaine de course
      sessions.push(
        session(week, 1, { type: "allure", title: "Dernier rappel", details: "Échauffement 15', 3 × 2 km à 4'58, 10' au calme." }, 9, phase),
        session(week, 3, { type: "ef", title: "Footing de veille", details: "Très facile, quelques lignes droites. Préparer le dossard." }, 6, phase),
        session(week, 6, { type: "course", title: RACE.name, details: "Départ prudent (5'00 sur 5 km), puis 4'58 jusqu'au 30e. Ensuite, tout donner." }, 42.2, phase),
      );
      return;
    }

    const rest = volume - longKm;
    const q = Math.round(rest * 0.4);
    const ef1 = Math.round(rest * 0.3);
    const ef2 = rest - q - ef1;

    sessions.push(
      session(week, 1, qualityWorkout(week, phase, light), q, phase),
      session(
        week,
        2,
        light
          ? { type: "recup", title: "Footing récup", details: "Très lent, en aisance respiratoire totale." }
          : { type: "ef", title: "Footing EF", details: `Allure conversation. Surveiller la FC : rester sous ${ZONES.ef.hr.max}.` },
        ef1,
        phase,
      ),
      session(week, 4, { type: "ef", title: "Footing + lignes droites", details: "Endurance facile, puis 5 lignes droites de 80 m relâchées." }, ef2, phase),
      session(week, 6, longRun(longKm, phase), longKm, phase),
    );
  });

  return sessions;
}

export const PLANNED_SESSIONS: PlannedSession[] = buildPlan();
export const TOTAL_WEEKS = WEEKS.length;

export function weekStart(week: number): string {
  return addDays(PLAN_START, (week - 1) * 7);
}
