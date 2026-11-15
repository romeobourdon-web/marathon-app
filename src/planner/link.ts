// Liaison automatique prévu ↔ réalisé (D28, D29) :
//  1. le jour même : chaque course éligible est liée à la séance prévue de sa date (plusieurs activités possibles, agrégées) ;
//  2. sinon : une séance prévue NON liée à ± 1 jour, la plus proche en distance, à condition que l'activité
//     fasse au moins 50 % de la distance prévue (D29).
// Seules les courses éligibles au plan sont liées (D22 : pas d'autre sport ; D28 : pas de marche).
// Les liaisons automatiques sont recalculées entièrement à chaque synchro ; les liaisons manuelles ne bougent jamais (D29).

import { daysBetween } from "@/lib/dates";

/** Part minimale de la distance prévue pour une liaison à ± 1 jour (D29). */
export const NEIGHBOUR_MIN_SHARE = 0.5;

export interface LinkableSession {
  id: string;
  date: string;
  distanceKm: number;
}

export interface LinkableActivity {
  id: string;
  date: string;
  startTime: string;
  distanceKm: number;
  /** Course qui compte pour le plan (engine/activity.countsForPlan). */
  eligible: boolean;
}

export interface LinkPair {
  activityId: string;
  sessionId: string;
}

/**
 * Liaisons automatiques souhaitées, recalculées de zéro.
 * `manual` : liaisons manuelles existantes, figées ; leurs activités et leurs séances ne sont pas réattribuées.
 */
export function computeAutoLinks(sessions: LinkableSession[], activities: LinkableActivity[], manual: LinkPair[] = []): LinkPair[] {
  const links: LinkPair[] = [];
  const manualActivities = new Set(manual.map((l) => l.activityId));
  const takenSessions = new Set(manual.map((l) => l.sessionId));
  const sessionByDate = new Map(sessions.map((s) => [s.date, s]));
  const pending = activities
    .filter((a) => a.eligible && !manualActivities.has(a.id))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // 1. Le jour même : toute course compte (prioritaire sur une liaison à ± 1 jour, D29)
  const remaining: LinkableActivity[] = [];
  for (const a of pending) {
    const s = sessionByDate.get(a.date);
    if (s) {
      links.push({ activityId: a.id, sessionId: s.id });
      takenSessions.add(s.id);
    } else {
      remaining.push(a);
    }
  }

  // 2. Une séance non liée à ± 1 jour, assez proche en distance (≥ 50 % du prévu), la plus proche
  for (const a of remaining) {
    const candidates = sessions.filter(
      (s) =>
        !takenSessions.has(s.id) &&
        Math.abs(daysBetween(a.date, s.date)) === 1 &&
        a.distanceKm >= NEIGHBOUR_MIN_SHARE * s.distanceKm,
    );
    if (candidates.length === 0) continue;
    const best = candidates.reduce((x, y) => (Math.abs(y.distanceKm - a.distanceKm) < Math.abs(x.distanceKm - a.distanceKm) ? y : x));
    links.push({ activityId: a.id, sessionId: best.id });
    takenSessions.add(best.id);
  }
  return links;
}

/** Différence entre les liaisons automatiques existantes et celles souhaitées. */
export function diffLinks<T extends LinkPair>(existingAuto: T[], desired: LinkPair[]): { toDelete: T[]; toInsert: LinkPair[] } {
  const key = (l: LinkPair) => `${l.activityId}→${l.sessionId}`;
  const desiredKeys = new Set(desired.map(key));
  const existingKeys = new Set(existingAuto.map(key));
  return {
    toDelete: existingAuto.filter((l) => !desiredKeys.has(key(l))),
    toInsert: desired.filter((l) => !existingKeys.has(key(l))),
  };
}
