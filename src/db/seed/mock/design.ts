// Données FICTIVES pour la page /design (aperçu du design system, D16).
// Score de forme, temps prédit et tendances ne sont pas encore calculés par engine/ :
// tout ce qui vient d'ici est affiché avec un Chip « démo ».
// Mesures brutes (m, s, bpm) ; les mots et tons d'état simulent ce que renverra engine/.

export const DESIGN_PREVIEW = {
  today: "2026-11-14",

  plannedSession: {
    title: "Endurance fondamentale",
    distanceM: 12_400,
    pace: { min: 345, max: 370 },
    hrMax: 142,
  },

  doneSession: {
    title: "Sortie longue",
    plannedM: 18_000,
    doneM: 17_400,
    pace: { min: 340, max: 360 },
    gapVerdict: { word: "Un peu court", tone: "warn" as const },
  },

  restDay: {
    title: "Repos",
    note: "Récupération : marche ou mobilité légère si l'envie est là.",
  },

  form: {
    score: 72,
    status: { word: "Bonne forme", tone: "good" as const },
    verdict: "Prêt pour la séance prévue.",
    restingHr: 48,
    restingHrVerdict: { word: "stable", tone: "good" as const },
    hrvMs: 58,
    hrvVerdict: { word: "sous la normale", tone: "warn" as const },
    sleepS: 7 * 3600 + 20 * 60,
    fatigue: 2,
  },

  week: {
    labels: ["L", "M", "M", "J", "V", "S", "D"],
    plannedM: [8_000, 0, 10_000, 0, 12_400, 0, 18_000],
    doneM: [8_200, 0, 7_100, 0, 0, 0, 0],
    todayIndex: 4,
    flagged: [false, false, true, false, false, false, false],
  },

  /** Temps prédit au marathon (s), une valeur par semaine, et l'objectif. */
  predictedTime: {
    valuesS: [13_380, 13_260, 13_200, 13_080, 12_990, 12_930, 12_870],
    targetS: 12_600,
  },
};
