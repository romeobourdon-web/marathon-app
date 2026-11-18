import { describe, expect, it } from "vitest";
import type { ActivityRecord } from "@/db/types";
import { dayFocus, offPlanActivities, weekDays } from "@/planner/today";
import type { Session } from "@/planner/types";

const session = (id: string, date: string, status: Session["status"]): Session => ({
  id,
  date,
  week: 9,
  phase: "base",
  type: "ef",
  title: "Footing",
  details: "",
  distanceKm: 8,
  targetPace: { min: 330, max: 360 },
  targetHr: { min: 120, max: 142 },
  status,
});

const activity = (id: string, date: string, sport: string, distanceKm: number, avgPace: number): ActivityRecord => ({
  id,
  date,
  startTime: `${date}T10:00:00Z`,
  sport,
  distanceKm,
  durationSec: distanceKm * avgPace,
  avgPace,
  avgHr: null,
});

// Semaine du lundi 16 nov. 2026 : mar. 17 fait, jeu. 19 prévu, dim. 22 prévu.
const sessions = [session("tue", "2026-11-17", "done"), session("thu", "2026-11-19", "upcoming"), session("sun", "2026-11-22", "upcoming")];

describe("dayFocus", () => {
  it("séance prévue aujourd'hui, même déjà faite", () => {
    expect(dayFocus(sessions, "2026-11-17")).toEqual({ kind: "today", session: sessions[0] });
  });
  it("jour de repos → prochaine séance", () => {
    expect(dayFocus(sessions, "2026-11-18")).toEqual({ kind: "next", session: sessions[1] });
  });
  it("plus rien de prévu", () => {
    expect(dayFocus(sessions, "2026-11-23")).toEqual({ kind: "none" });
  });
});

describe("weekDays", () => {
  it("7 jours lundi → dimanche : faite, repos, prévue ; aujourd'hui marqué", () => {
    const days = weekDays("2026-11-16", [...sessions, session("mon", "2026-11-16", "skipped")], "2026-11-18");
    expect(days.map((d) => d.status)).toEqual(["skipped", "done", "rest", "planned", "rest", "rest", "planned"]);
    expect(days.findIndex((d) => d.isToday)).toBe(2);
    expect(days[6].date).toBe("2026-11-22");
  });
});

describe("offPlanActivities (D28, D31)", () => {
  it("autres sports et marche de la période ; pas les courses", () => {
    const acts = [
      activity("bike", "2026-11-17", "cycling", 25, 120),
      activity("walk", "2026-11-16", "running", 5.1, 1000),
      activity("run", "2026-11-17", "running", 10, 300),
      activity("old", "2026-11-10", "cycling", 30, 120),
    ];
    expect(offPlanActivities(acts, "2026-09-21", "2026-11-16", "2026-11-22")).toEqual([
      { date: "2026-11-17", sport: "cycling", distanceKm: 25 },
      { date: "2026-11-16", sport: "walking", distanceKm: 5.1 },
    ]);
  });
});
