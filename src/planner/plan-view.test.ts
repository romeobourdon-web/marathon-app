import { describe, expect, it } from "vitest";
import type { ActivityRecord } from "@/db/types";
import { RACE, ZONES } from "@/db/seed/reference";
import { buildPlan } from "@/planner/plan";
import { planView, splitCurrentPhase, weeksTotal } from "@/planner/plan-view";
import { linkSessions } from "@/planner/sessions";

const PLAN_START = "2026-09-21";
const TODAY = "2026-11-18"; // semaine 9 (phase 2)
const planned = buildPlan({ start: PLAN_START, raceName: RACE.name, zones: ZONES }).map((s, i) => ({ ...s, id: `s${i}` }));

describe("planView", () => {
  const sessions = linkSessions(planned, TODAY, (s) =>
    s.id === "s0"
      ? { skipped: false, actual: { distanceKm: 8, durationSec: 2400, avgPace: s.targetPace.min - 20, avgHr: s.targetHr.max + 5 } }
      : { skipped: true },
  );
  const activities: ActivityRecord[] = [
    { id: "a", date: "2026-09-22", startTime: "2026-09-22T10:00:00Z", sport: "running", distanceKm: 8, durationSec: 2400, avgPace: 300, avgHr: 150 },
  ];
  const view = planView(sessions, activities, PLAN_START, TODAY);

  it("30 semaines en 4 phases, semaine en cours et états", () => {
    expect(view.currentWeek).toBe(9);
    expect(view.phases.map((p) => [p.number, p.state, p.weeks.length])).toEqual([
      [1, "done", 8],
      [2, "current", 10],
      [3, "future", 9],
      [4, "future", 3],
    ]);
    const w9 = view.phases[1].weeks[0];
    expect([w9.week, w9.state, w9.light]).toEqual([9, "current", true]);
    expect(view.phases[2].weeks[0]).toMatchObject({ state: "future", doneKm: null, status: null });
  });

  it("réalisé = toutes les courses de la semaine (D28), écarts seulement hors zone", () => {
    const w1 = view.phases[0].weeks[0];
    expect(w1.doneKm).toBe(8);
    const done = w1.sessions.find((r) => r.dot === "done")!;
    expect(done.paceGap).toBe(-20); // 20 s/km plus vite que la zone
    expect(done.hrGap).toBe(5);
    expect(w1.sessions.filter((r) => r.dot === "skipped").length).toBe(w1.sessions.length - 1);
  });

  it("phase en cours sur PC : 4 dernières semaines dépliées, plus anciennes regroupées", () => {
    const weeks = view.phases[0].weeks.map((w) => ({ ...w, state: "past" as const }));
    const { older, recent, future } = splitCurrentPhase(weeks);
    expect(older.map((w) => w.week)).toEqual([1, 2, 3, 4]);
    expect(recent.map((w) => w.week)).toEqual([5, 6, 7, 8]);
    expect(future).toEqual([]);
    expect(weeksTotal(older).doneKm).toBe(8);
  });
});
