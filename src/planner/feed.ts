// Historique « Séances » (DESIGN.md §6) : séances réalisées ou non, courses libres et activités hors plan,
// de la plus récente à la plus ancienne, groupées par semaine du plan puis « Avant le plan ».

import type { ActivityRecord } from "@/db/types";
import { countsForPlan, isWalk } from "@/engine/activity";
import { daysBetween } from "@/lib/dates";
import { TOTAL_WEEKS } from "@/planner/plan";
import type { Session } from "@/planner/types";

export type FeedItem =
  /** Séance prévue et réalisée (une ou plusieurs activités liées). */
  | { kind: "done"; id: string; date: string; session: Session }
  /** Séance prévue passée, sans activité liée. */
  | { kind: "skipped"; id: string; date: string; session: Session }
  /** Course qui compte dans le volume (D28) mais liée à aucune séance. */
  | { kind: "run"; id: string; date: string; activity: ActivityRecord }
  /** Hors plan : autre sport (D31), marche (D28) ou sortie d'avant le plan. `sport` = « walking » pour la marche. */
  | { kind: "offplan"; id: string; date: string; activity: ActivityRecord; sport: string };

export type FeedFilter = "all" | "run" | "offplan" | "skipped";

export interface FeedGroup {
  /** Semaine du plan ; null = « Avant le plan ». */
  week: number | null;
  items: FeedItem[];
}

const FILTERS: Record<FeedFilter, (i: FeedItem) => boolean> = {
  all: () => true,
  run: (i) => i.kind === "done" || i.kind === "run",
  offplan: (i) => i.kind === "offplan",
  skipped: (i) => i.kind === "skipped",
};

/** Semaine du plan d'une date (null avant le plan). */
export function planWeekOf(planStart: string, date: string): number | null {
  const days = daysBetween(planStart, date);
  return days < 0 ? null : Math.min(Math.floor(days / 7) + 1, TOTAL_WEEKS);
}

/** Historique jusqu'à `today` inclus, filtré, groupé par semaine (la plus récente d'abord). */
export function sessionFeed(
  sessions: Session[],
  activities: ActivityRecord[],
  planStart: string,
  today: string,
  filter: FeedFilter = "all",
): FeedGroup[] {
  const linked = new Set(sessions.flatMap((s) => s.activityIds ?? []));
  const items: FeedItem[] = [
    ...sessions
      .filter((s) => s.status === "done" || s.status === "skipped")
      .map((s): FeedItem => (s.status === "done" ? { kind: "done", id: s.id, date: s.date, session: s } : { kind: "skipped", id: s.id, date: s.date, session: s })),
    ...activities
      .filter((a) => a.date <= today && !linked.has(a.id))
      .map(
        (a): FeedItem =>
          countsForPlan(a, planStart)
            ? { kind: "run", id: a.id, date: a.date, activity: a }
            : { kind: "offplan", id: a.id, date: a.date, activity: a, sport: isWalk(a) ? "walking" : a.sport },
      ),
  ]
    .filter(FILTERS[filter])
    .sort((a, b) => b.date.localeCompare(a.date) || startOf(b).localeCompare(startOf(a)));

  const groups: FeedGroup[] = [];
  for (const item of items) {
    const week = planWeekOf(planStart, item.date);
    const last = groups[groups.length - 1];
    if (last && last.week === week) last.items.push(item);
    else groups.push({ week, items: [item] });
  }
  return groups;
}

function startOf(i: FeedItem): string {
  return "activity" in i ? i.activity.startTime : i.date;
}
