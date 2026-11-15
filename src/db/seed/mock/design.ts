// Données FICTIVES pour la page /design (aperçu du design system v2.1, D16, D27).
// Tout ce qui vient d'ici est affiché avec un Chip « démo ». Mesures brutes (m, s, s/km, bpm) ;
// les mots et tons d'état simulent ce que renverront engine/ et planner/.
// Valeurs inventées pour l'aperçu, différentes de celles des maquettes (docs/maquettes/).

export const DESIGN_PREVIEW = {
  plannedSession: {
    title: "Footing EF",
    details: "Allure conversation, FC sous 142. Cinq lignes droites relâchées à la fin.",
    distanceM: 9_000,
    pace: { min: 345, max: 370 },
    hr: { min: 128, max: 142 },
  },

  doneSession: {
    title: "Sortie longue",
    plannedM: 18_000,
    doneM: 17_200,
    pace: { min: 340, max: 360, actual: 331 },
    hr: { min: 131, max: 144, actual: 147 },
    gapVerdict: { word: "Un peu court", tone: "warn" as const },
  },

  skippedSession: { title: "Seuil 3 × 8'" },

  restDay: {
    title: "Repos",
    note: "Récupération : marche ou mobilité légère si l'envie est là.",
  },

  form: {
    score: 71,
    status: { word: "Prêt à charger", tone: "good" as const },
    verdict: "Récupération correcte, la séance prévue est maintenue.",
    hrvMs: 61,
    restingHr: 48,
    sleepS: 7 * 3600 + 5 * 60,
    pain: 1,
  },

  week: {
    labels: ["L", "M", "M", "J", "V", "S", "D"],
    days: ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."],
    status: ["rest", "done", "skipped", "rest", "done", "planned", "planned"] as const,
    todayIndex: 5,
    plannedM: 46_000,
    doneM: 19_400,
    plannedToDateM: 24_000,
    doneCount: 2,
    remainingCount: 2,
    offPlanNote: "+ 1 activité hors plan (vélo, 31 km), non comptée.",
  },

  /** Volume hebdo (m) des semaines 1 à 11 : réalisé null = semaine à venir. Échelle des barres : 60 km. */
  volume: {
    plannedM: [34_000, 36_000, 38_000, 40_000, 33_000, 40_000, 42_000, 44_000, 44_000, 46_000, 48_000],
    doneM: [31_000, 39_000, 35_500, 41_200, 30_400, 43_800, 38_900, 19_400, null, null, null] as (number | null)[],
    currentIndex: 7,
    scaleM: 60_000,
  },

  /** Allure moyenne des footings (s/km) semaine après semaine, et zone EF visée. */
  easyPace: {
    valuesS: [318, 326, 322, 331, 336, 334, 341],
    zone: { min: 345, max: 370 },
    targetS: 345,
  },

  /** Échéance hypothétique posée sur la frise (« exemple »). */
  testEvent: { label: "10 km test (exemple)", date: "2027-01-24" },
};
