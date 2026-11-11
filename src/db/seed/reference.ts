// Données RÉELLES de référence : course, profil athlète, zones.
// (Les données fictives vivent dans ./mock/.)

import type { Race } from "@/db/types";
import type { Range, TrainingZones } from "@/planner/types";

export const RACE: Race = {
  name: "Marathon du Lac d'Annecy",
  // ⚠️ Date à confirmer : la date officielle 2027 n'est pas encore publiée (prévue mi-avril).
  // Si elle change, ajuster aussi le nombre de semaines dans WEEKS (planner/plan.ts, le dernier dimanche = jour J).
  date: "2027-04-18",
  distanceKm: 42.195,
  targetTimeSec: 3 * 3600 + 30 * 60,
  targetPace: 298, // 4'58/km
};

// Un lundi. En pratique, l'athlète est encore en « phase libre » (pas strictement le plan) :
// ~40-50 km/semaine et sortie longue déjà à 22 km, donc au-dessus des premières semaines prévues.
export const PLAN_START = "2026-09-21";

// FC max 185 bpm : la même valeur que celle utilisée pour les zones Strava de l'athlète.
export const HR_MAX = 185;

/** Fourchette de FC en % de la FC max → bpm. */
function hr(minPct: number, maxPct: number): Range {
  return { min: Math.round((HR_MAX * minPct) / 100), max: Math.round((HR_MAX * maxPct) / 100) };
}

// Zones d'allure (s/km) et de fréquence cardiaque (% FC max → bpm).
export const ZONES: TrainingZones = {
  recup: { pace: { min: 370, max: 395 }, hr: hr(62, 71) }, // 115–131
  ef: { pace: { min: 345, max: 370 }, hr: hr(69, 77) }, // 128–142
  "sortie-longue": { pace: { min: 340, max: 360 }, hr: hr(71, 78) }, // 131–144
  allure: { pace: { min: 293, max: 300 }, hr: hr(82, 86) }, // 152–159
  seuil: { pace: { min: 270, max: 280 }, hr: hr(87, 91) }, // 161–168
  fractionne: { pace: { min: 235, max: 245 }, hr: hr(91, 97) }, // 168–179
  course: { pace: { min: 295, max: 300 }, hr: hr(82, 88) }, // 152–163
};
