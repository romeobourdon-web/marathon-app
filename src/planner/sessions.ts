// Liaison prévu ↔ réalisé : statut de chaque séance à une date donnée.

import type { ActivityResult } from "@/db/types";
import type { PlannedSession, Session } from "@/planner/types";

/**
 * Associe chaque séance prévue à son réalisé. `activityFor` n'est appelée que
 * pour les séances passées (avant `today`).
 */
export function linkSessions(
  planned: PlannedSession[],
  today: string,
  activityFor: (s: PlannedSession) => ActivityResult,
): Session[] {
  return planned.map((s) => {
    if (s.date > today) return { ...s, status: "upcoming" };
    if (s.date === today) return { ...s, status: "today" };
    const result = activityFor(s);
    if (result.skipped) return { ...s, status: "skipped" };
    return { ...s, status: "done", actual: result.actual, journal: result.journal };
  });
}

/** La séance prévue aujourd'hui, sinon la prochaine. */
export function nextSession(sessions: Session[]): Session | undefined {
  return sessions.find((s) => s.status === "today" || s.status === "upcoming");
}
