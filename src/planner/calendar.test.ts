import { describe, expect, it } from "vitest";
import { currentWeek, daysToRace, phaseProgress, planPositionPct } from "@/planner/calendar";

const PLAN_START = "2026-09-21";

describe("currentWeek / daysToRace", () => {
  it("semaine 8 le 15 nov., 154 jours avant le 18 avril", () => {
    expect(currentWeek(PLAN_START, "2026-11-15")).toBe(8);
    expect(daysToRace("2026-11-15", "2027-04-18")).toBe(154);
  });
});

describe("phaseProgress", () => {
  it("semaine 8 : base en cours (8/8), les autres à venir, durées 8/10/9/3", () => {
    const p = phaseProgress(8);
    expect(p.map((x) => [x.id, x.weeks, x.state, x.progressPct])).toEqual([
      ["base", 8, "current", 100],
      ["construction", 10, "future", 0],
      ["specifique", 9, "future", 0],
      ["affutage", 3, "future", 0],
    ]);
  });
  it("semaine 12 : base terminée, construction à 40 %", () => {
    const p = phaseProgress(12);
    expect(p[0].state).toBe("done");
    expect(p[1]).toMatchObject({ state: "current", progressPct: 40 });
  });
});

describe("planPositionPct", () => {
  it("place une date sur la durée du plan, bornée à 0–100", () => {
    expect(planPositionPct(PLAN_START, PLAN_START)).toBe(0);
    expect(planPositionPct(PLAN_START, "2026-10-26")).toBe(16.7); // 35 jours sur 210
    expect(planPositionPct(PLAN_START, "2027-06-01")).toBe(100);
    expect(planPositionPct(PLAN_START, "2026-04-04")).toBe(0);
  });
});
