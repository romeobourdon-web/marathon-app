// Façade temporaire : délègue à planner/ et engine/. Supprimée à l'étape suivante
// (les écrans passeront par db/repository).

import { mockActivity } from "@/db/seed/mock/activity";
import { PLAN_START, RACE, ZONES } from "@/db/seed/reference";
import * as calendar from "@/planner/calendar";
import { buildPlan } from "@/planner/plan";
import { linkSessions, nextSession } from "@/planner/sessions";
import { volumeTrend, weekSummary, type VolumePoint, type WeekSummary } from "@/planner/summary";
import type { Session } from "@/planner/types";

export { RACE, ZONES } from "@/db/seed/reference";
export { PHASES, TOTAL_WEEKS, TYPE_LABELS, phaseForWeek } from "@/planner/plan";
export type { WeekStatus } from "@/engine/week-status";
export type { VolumePoint, WeekSummary } from "@/planner/summary";
export type * from "@/db/types";
export type * from "@/planner/types";

const PLANNED_SESSIONS = buildPlan({ start: PLAN_START, raceName: RACE.name, zones: ZONES });

export function getSessions(today: string): Session[] {
  return linkSessions(PLANNED_SESSIONS, today, mockActivity);
}

export function currentWeek(today: string): number {
  return calendar.currentWeek(PLAN_START, today);
}

export function getWeekSummary(week: number, today: string): WeekSummary {
  return weekSummary(getSessions(today), PLAN_START, week, today);
}

export function getVolumeTrend(today: string, past = 7, ahead = 3): VolumePoint[] {
  return volumeTrend(getSessions(today), PLAN_START, today, past, ahead);
}

export function getNextSession(today: string): Session | undefined {
  return nextSession(getSessions(today));
}

export function daysToRace(today: string): number {
  return calendar.daysToRace(today, RACE.date);
}

