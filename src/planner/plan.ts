// Génère le plan d'entraînement (30 semaines, 4 phases) à partir de quelques tableaux.
// Le plan généré est ensuite inséré en base, qui fait foi (D11).

import { addDays } from "@/lib/dates";
import type { Phase, PhaseId, PlannedSession, SessionType, TrainingZones } from "@/planner/types";

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

/** Paramètres de génération, issus des données de référence (db/seed/reference.ts). */
export interface PlanParams {
  start: string; // un lundi, "AAAA-MM-JJ"
  raceName: string;
  zones: TrainingZones;
}

function longRun(km: number, phase: PhaseId, zones: TrainingZones): Workout {
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
    details: `${km} km en endurance, FC sous ${zones["sortie-longue"].hr.max}. Boire toutes les 20'.`,
  };
}

function session(
  params: PlanParams,
  week: number,
  dayOffset: number,
  w: Workout,
  distanceKm: number,
  phase: PhaseId,
): PlannedSession {
  const date = addDays(params.start, (week - 1) * 7 + dayOffset);
  return {
    id: `s${week}-${dayOffset}`,
    date,
    week,
    phase,
    ...w,
    distanceKm,
    targetPace: params.zones[w.type].pace,
    targetHr: params.zones[w.type].hr,
  };
}

export function buildPlan(params: PlanParams): PlannedSession[] {
  const sessions: PlannedSession[] = [];

  WEEKS.forEach(([volume, longKm, light], i) => {
    const week = i + 1;
    const phase = phaseOf(week);

    if (week === WEEKS.length) {
      // Semaine de course
      sessions.push(
        session(params, week, 1, { type: "allure", title: "Dernier rappel", details: "Échauffement 15', 3 × 2 km à 4'58, 10' au calme." }, 9, phase),
        session(params, week, 3, { type: "ef", title: "Footing de veille", details: "Très facile, quelques lignes droites. Préparer le dossard." }, 6, phase),
        session(params, week, 6, { type: "course", title: params.raceName, details: "Départ prudent (5'00 sur 5 km), puis 4'58 jusqu'au 30e. Ensuite, tout donner." }, 42.2, phase),
      );
      return;
    }

    const rest = volume - longKm;
    const q = Math.round(rest * 0.4);
    const ef1 = Math.round(rest * 0.3);
    const ef2 = rest - q - ef1;

    sessions.push(
      session(params, week, 1, qualityWorkout(week, phase, light), q, phase),
      session(
        params,
        week,
        2,
        light
          ? { type: "recup", title: "Footing récup", details: "Très lent, en aisance respiratoire totale." }
          : { type: "ef", title: "Footing EF", details: `Allure conversation. Surveiller la FC : rester sous ${params.zones.ef.hr.max}.` },
        ef1,
        phase,
      ),
      session(params, week, 4, { type: "ef", title: "Footing + lignes droites", details: "Endurance facile, puis 5 lignes droites de 80 m relâchées." }, ef2, phase),
      session(params, week, 6, longRun(longKm, phase, params.zones), longKm, phase),
    );
  });

  return sessions;
}

export const TOTAL_WEEKS = WEEKS.length;

/** Lundi de la semaine `week` du plan. */
export function weekStart(planStart: string, week: number): string {
  return addDays(planStart, (week - 1) * 7);
}
