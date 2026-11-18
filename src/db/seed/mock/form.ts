// Score de forme FICTIF (D16) : le calcul arrive en phase 3. Toujours affiché avec un Chip « démo ».
// Les 4 mesures de la carte Forme, elles, sont réelles (bien-être, questionnaire du matin).

export const FORM_DEMO = {
  score: 70,
  status: { word: "Exemple", tone: "neutral" as const },
  verdict: "Score de démonstration : le vrai calcul arrive en phase 3. Les 4 mesures ci-dessous sont réelles.",
};
