// Seul point d'accès aux données pour les écrans. Aujourd'hui tout vient de
// seed/ ; le jour où l'on branche Supabase, seul ce fichier change.

import type { Race } from "@/db/types";
import { mockActivity } from "@/db/seed/mock/activity";
import { PLAN_START, RACE, ZONES } from "@/db/seed/reference";
import { buildPlan } from "@/planner/plan";
import { linkSessions } from "@/planner/sessions";
import type { Session } from "@/planner/types";

// D11 : le plan est généré par planner/ puis inséré en base. En attendant
// Supabase, la « base » est ce tableau généré une fois au chargement.
const PLANNED_SESSIONS = buildPlan({ start: PLAN_START, raceName: RACE.name, zones: ZONES });

export function getRace(): Race {
  return RACE;
}

/** Lundi de la semaine 1 du plan. */
export function getPlanStart(): string {
  return PLAN_START;
}

/** Toutes les séances du plan, liées au réalisé à la date `today`. */
export function getSessions(today: string): Session[] {
  return linkSessions(PLANNED_SESSIONS, today, mockActivity);
}
