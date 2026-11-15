// Liaison automatique prévu ↔ réalisé (D28) :
//  1. le jour même : chaque course éligible est liée à la séance prévue de sa date (plusieurs activités possibles) ;
//  2. sinon : une séance prévue NON liée à ± 1 jour, la plus proche en distance.
// Seules les courses éligibles au plan sont liées (D22 : pas d'autre sport ; D28 : pas de marche).

import { daysBetween } from "@/lib/dates";

export interface LinkableSession {
  id: string;
  date: string;
  distanceKm: number;
  /** Déjà liée à au moins une activité (avant ce passage). */
  linked: boolean;
}

export interface LinkableActivity {
  id: string;
  date: string;
  startTime: string;
  distanceKm: number;
  /** Course qui compte pour le plan (engine/activity.countsForPlan). */
  eligible: boolean;
  /** Déjà liée à une séance. */
  linked: boolean;
}

export interface AutoLink {
  activityId: string;
  sessionId: string;
}

/** Nouvelles liaisons à créer ; les liaisons existantes ne sont jamais modifiées. */
export function autoLinks(sessions: LinkableSession[], activities: LinkableActivity[]): AutoLink[] {
  const links: AutoLink[] = [];
  const linkedSessions = new Set(sessions.filter((s) => s.linked).map((s) => s.id));
  const sessionByDate = new Map(sessions.map((s) => [s.date, s]));
  const pending = activities
    .filter((a) => a.eligible && !a.linked)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // 1. Le jour même
  const remaining: LinkableActivity[] = [];
  for (const a of pending) {
    const s = sessionByDate.get(a.date);
    if (s) {
      links.push({ activityId: a.id, sessionId: s.id });
      linkedSessions.add(s.id);
    } else {
      remaining.push(a);
    }
  }

  // 2. Une séance non liée à ± 1 jour, la plus proche en distance
  for (const a of remaining) {
    const candidates = sessions.filter((s) => !linkedSessions.has(s.id) && Math.abs(daysBetween(a.date, s.date)) === 1);
    if (candidates.length === 0) continue;
    const best = candidates.reduce((x, y) => (Math.abs(y.distanceKm - a.distanceKm) < Math.abs(x.distanceKm - a.distanceKm) ? y : x));
    links.push({ activityId: a.id, sessionId: best.id });
    linkedSessions.add(best.id);
  }
  return links;
}
