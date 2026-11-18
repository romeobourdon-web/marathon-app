// Écran Aujourd'hui (DESIGN.md §6) : la séance à afficher, les 7 jours de la semaine, les activités hors plan.

import type { ActivityRecord } from "@/db/types";
import { countsForPlan, isWalk } from "@/engine/activity";
import { addDays } from "@/lib/dates";
import type { Session } from "@/planner/types";

export type DayFocus =
  /** Une séance est prévue aujourd'hui (faite ou non). */
  | { kind: "today"; session: Session }
  /** Jour de repos : la prochaine séance (« Prochaine séance » + « Aujourd'hui : repos »). */
  | { kind: "next"; session: Session }
  /** Plus rien de prévu. */
  | { kind: "none" };

/** Séance du jour si elle existe, sinon la prochaine séance prévue (règle « jour de repos »). */
export function dayFocus(sessions: Session[], today: string): DayFocus {
  const todays = sessions.find((s) => s.date === today);
  if (todays) return { kind: "today", session: todays };
  const next = sessions.find((s) => s.date > today && (s.status === "upcoming" || s.status === "today"));
  return next ? { kind: "next", session: next } : { kind: "none" };
}

export type DayStatus = "done" | "skipped" | "planned" | "rest";

export interface WeekDay {
  date: string;
  status: DayStatus;
  isToday: boolean;
  session?: Session;
}

/** Les 7 jours (lundi → dimanche) d'une semaine du plan, avec le statut de leur séance. */
export function weekDays(weekStartDate: string, sessions: Session[], today: string): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStartDate, i);
    const session = sessions.find((s) => s.date === date);
    const status: DayStatus = !session
      ? "rest"
      : session.status === "done"
        ? "done"
        : session.status === "skipped"
          ? "skipped"
          : "planned";
    return { date, status, isToday: date === today, session };
  });
}

export interface OffPlanActivity {
  date: string;
  /** Sport de la source, ou « walking » pour une course à allure de marche (D28). */
  sport: string;
  distanceKm: number;
}

/** Activités d'une période qui ne comptent pas dans les km du plan : autres sports (D31), marche (D28). */
export function offPlanActivities(activities: ActivityRecord[], planStart: string, from: string, to: string): OffPlanActivity[] {
  return activities
    .filter((a) => a.date >= from && a.date <= to && !countsForPlan(a, planStart))
    .map((a) => ({ date: a.date, sport: isWalk(a) ? "walking" : a.sport, distanceKm: a.distanceKm }));
}
