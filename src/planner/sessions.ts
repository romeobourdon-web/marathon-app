// Liaison prévu ↔ réalisé : statut de chaque séance à une date donnée.

import type { ActivityResult } from "@/db/types";
import type { PlannedSession, Session } from "@/planner/types";

/**
 * Statut de chaque séance prévue à la date `today`, à partir de son réalisé (`activityFor`) :
 *  - une séance liée à une activité est « done », quelle que soit sa date (D28 : une sortie de la veille
 *    peut réaliser la séance du jour ou du lendemain) ;
 *  - sinon : passée → « skipped », aujourd'hui → « today », à venir → « upcoming ».
 */
export function linkSessions(
  planned: PlannedSession[],
  today: string,
  activityFor: (s: PlannedSession) => ActivityResult,
): Session[] {
  return planned.map((s) => {
    const result = activityFor(s);
    if (!result.skipped) return { ...s, status: "done", actual: result.actual, journal: result.journal, activityIds: result.activityIds };
    if (s.date < today) return { ...s, status: "skipped" };
    if (s.date === today) return { ...s, status: "today" };
    return { ...s, status: "upcoming" };
  });
}
