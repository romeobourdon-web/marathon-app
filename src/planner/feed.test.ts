import { describe, expect, it } from "vitest";
import type { ActivityRecord } from "@/db/types";
import { planWeekOf, sessionFeed } from "@/planner/feed";
import type { Session } from "@/planner/types";

const PLAN_START = "2026-09-21";

const session = (id: string, date: string, status: Session["status"], activityIds?: string[]): Session => ({
  id,
  date,
  week: planWeekOf(PLAN_START, date) ?? 1,
  phase: "base",
  type: "ef",
  title: "Footing",
  details: "",
  distanceKm: 8,
  targetPace: { min: 330, max: 360 },
  targetHr: { min: 120, max: 142 },
  status,
  activityIds,
});

const activity = (id: string, date: string, sport = "running", avgPace = 300): ActivityRecord => ({
  id,
  date,
  startTime: `${date}T10:00:00Z`,
  sport,
  distanceKm: 8,
  durationSec: 8 * avgPace,
  avgPace,
  avgHr: 140,
});

const sessions = [
  session("s1", "2026-11-10", "done", ["a1"]),
  session("s2", "2026-11-12", "skipped"),
  session("s3", "2026-11-19", "upcoming"),
];
const activities = [
  activity("a1", "2026-11-10"),
  activity("bike", "2026-11-11", "cycling", 120),
  activity("free", "2026-11-17"),
  activity("walk", "2026-11-16", "running", 1000),
  activity("old", "2026-07-08"),
];

describe("planWeekOf", () => {
  it("semaine du plan, null avant le plan", () => {
    expect(planWeekOf(PLAN_START, "2026-09-21")).toBe(1);
    expect(planWeekOf(PLAN_START, "2026-11-15")).toBe(8);
    expect(planWeekOf(PLAN_START, "2026-11-16")).toBe(9);
    expect(planWeekOf(PLAN_START, "2026-09-20")).toBeNull();
  });
});

describe("sessionFeed", () => {
  it("groupes par semaine, du plus récent au plus ancien ; « avant le plan » à la fin ; pas de séance à venir", () => {
    const groups = sessionFeed(sessions, activities, PLAN_START, "2026-11-18");
    expect(groups.map((g) => [g.week, g.items.map((i) => `${i.kind}:${i.id}`)])).toEqual([
      [9, ["run:free", "offplan:walk"]],
      [8, ["skipped:s2", "offplan:bike", "done:s1"]],
      [null, ["offplan:old"]],
    ]);
  });

  it("une activité liée n'apparaît qu'avec sa séance ; la marche garde son nom", () => {
    const items = sessionFeed(sessions, activities, PLAN_START, "2026-11-18").flatMap((g) => g.items);
    expect(items.filter((i) => i.id === "a1")).toEqual([]);
    expect(items.find((i) => i.id === "walk")).toMatchObject({ kind: "offplan", sport: "walking" });
  });

  it("filtres : course (réalisées + courses libres), hors plan, non réalisées", () => {
    const ids = (f: "run" | "offplan" | "skipped") =>
      sessionFeed(sessions, activities, PLAN_START, "2026-11-18", f).flatMap((g) => g.items.map((i) => i.id));
    expect(ids("run")).toEqual(["free", "s1"]);
    expect(ids("offplan")).toEqual(["walk", "bike", "old"]);
    expect(ids("skipped")).toEqual(["s2"]);
  });
});
