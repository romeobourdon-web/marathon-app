// Écran Plan (DESIGN.md §6) : les 30 semaines, regroupées par phase, avec réalisé / prévu et écarts.

import type { ActivityRecord } from "@/db/types";
import { paceGap, rangeGap } from "@/engine/pace";
import type { WeekStatus } from "@/engine/week-status";
import { addDays } from "@/lib/dates";
import { currentWeek } from "@/planner/calendar";
import { PHASES, TOTAL_WEEKS, isLightWeek } from "@/planner/plan";
import { weekSummary } from "@/planner/summary";
import type { Phase, Session } from "@/planner/types";

export interface PlanSessionRow {
  session: Session;
  dot: "done" | "skipped" | "planned";
  /** Écarts hors zone (0 = dans la zone ou non réalisée) : allure en s/km, FC en bpm. */
  paceGap: number;
  hrGap: number;
}

export interface PlanWeek {
  week: number;
  start: string;
  end: string;
  state: "past" | "current" | "future";
  light: boolean;
  plannedKm: number;
  /** Toutes les courses de la semaine (D28) ; null pour une semaine à venir. */
  doneKm: number | null;
  /** null pour une semaine à venir. */
  status: WeekStatus | null;
  sessions: PlanSessionRow[];
}

export interface PlanPhase {
  phase: Phase;
  /** 1 à 4. */
  number: number;
  state: "done" | "current" | "future";
  weeks: PlanWeek[];
}

export interface PlanView {
  currentWeek: number;
  phases: PlanPhase[];
}

function sessionRow(s: Session): PlanSessionRow {
  if (s.status !== "done" || !s.actual) return { session: s, dot: s.status === "skipped" ? "skipped" : "planned", paceGap: 0, hrGap: 0 };
  return {
    session: s,
    dot: "done",
    paceGap: s.actual.avgPace > 0 ? paceGap(s.actual.avgPace, s.targetPace) : 0,
    hrGap: s.actual.avgHr > 0 ? rangeGap(s.actual.avgHr, s.targetHr) : 0,
  };
}

/** Les 30 semaines du plan à la date `today`, par phase. */
export function planView(sessions: Session[], activities: ActivityRecord[], planStart: string, today: string): PlanView {
  const cw = currentWeek(planStart, today);
  const weeks: PlanWeek[] = Array.from({ length: TOTAL_WEEKS }, (_, i) => {
    const week = i + 1;
    const summary = weekSummary(sessions, activities, planStart, week, today);
    const state = week < cw ? "past" : week === cw ? "current" : "future";
    return {
      week,
      start: summary.start,
      end: addDays(summary.start, 6),
      state,
      light: isLightWeek(week),
      plannedKm: summary.plannedKm,
      doneKm: state === "future" ? null : summary.doneKm,
      status: state === "future" ? null : summary.status,
      sessions: summary.sessions.map(sessionRow),
    };
  });
  return {
    currentWeek: cw,
    phases: PHASES.map((phase, i) => ({
      phase,
      number: i + 1,
      state: cw > phase.weeks.max ? "done" : cw >= phase.weeks.min ? "current" : "future",
      weeks: weeks.filter((w) => w.week >= phase.weeks.min && w.week <= phase.weeks.max),
    })),
  };
}

/**
 * Phase en cours sur PC : seules les `keep` dernières semaines jusqu'à la semaine en cours sont dépliées ;
 * les plus anciennes sont regroupées (« Semaines 1 à 4 · afficher »). Les semaines à venir restent à part.
 */
export function splitCurrentPhase(weeks: PlanWeek[], keep = 4): { older: PlanWeek[]; recent: PlanWeek[]; future: PlanWeek[] } {
  const started = weeks.filter((w) => w.state !== "future");
  return {
    older: started.slice(0, Math.max(0, started.length - keep)),
    recent: started.slice(-keep),
    future: weeks.filter((w) => w.state === "future"),
  };
}

/** Somme réalisé / prévu d'un groupe de semaines passées. */
export function weeksTotal(weeks: PlanWeek[]): { doneKm: number; plannedKm: number } {
  const round = (v: number) => Math.round(v * 10) / 10;
  return {
    doneKm: round(weeks.reduce((s, w) => s + (w.doneKm ?? 0), 0)),
    plannedKm: round(weeks.reduce((s, w) => s + w.plannedKm, 0)),
  };
}
