// Statut d'une semaine : km réalisés comparés aux km prévus jusqu'à hier inclus.

export type WeekStatus = "avance" | "ok" | "retard";

/** ≥ 105 % du prévu à date → avance ; ≥ 90 % → ok ; sinon retard. Rien de prévu à date → ok. */
export function weekStatus(doneKm: number, plannedToDateKm: number): WeekStatus {
  const ratio = plannedToDateKm === 0 ? 1 : doneKm / plannedToDateKm;
  return ratio >= 1.05 ? "avance" : ratio >= 0.9 ? "ok" : "retard";
}
