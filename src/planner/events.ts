// Écran Échéances (DESIGN.md §6) : course cible en tête, échéances à venir, puis passées avec leur résultat.

import { targetPace } from "@/engine/pace";
import { daysBetween } from "@/lib/dates";
import { planWeekOf } from "@/planner/feed";

export interface EventRecord {
  id: string;
  name: string;
  date: string;
  distanceKm: number;
  targetTimeSec: number | null;
  kind: "race" | "test";
  /** Course objectif du profil (athlete_profile.goal_event_id). */
  isTarget: boolean;
  /** Résultat lu sur l'activité liée (temps en mouvement), s'il y en a une. */
  result: { durationSec: number } | null;
}

export interface EventView extends EventRecord {
  daysLeft: number;
  /** Semaine du plan (null avant le plan). */
  week: number | null;
  /** Allure visée / réalisée, s/km. */
  targetPace: number | null;
  resultPace: number | null;
}

/** À venir (aujourd'hui compris) : course cible d'abord, puis par date ; passées : la plus récente d'abord. */
export function eventsView(events: EventRecord[], planStart: string, today: string): { upcoming: EventView[]; past: EventView[] } {
  const views = events.map((e) => ({
    ...e,
    daysLeft: daysBetween(today, e.date),
    week: planWeekOf(planStart, e.date),
    targetPace: e.targetTimeSec ? targetPace(e.targetTimeSec, e.distanceKm * 1000) : null,
    resultPace: e.result && e.distanceKm > 0 ? Math.round(e.result.durationSec / e.distanceKm) : null,
  }));
  const upcoming = views
    .filter((e) => e.daysLeft >= 0)
    .sort((a, b) => Number(b.isTarget) - Number(a.isTarget) || a.date.localeCompare(b.date));
  const past = views.filter((e) => e.daysLeft < 0).sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, past };
}
