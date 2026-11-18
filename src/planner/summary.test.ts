import { describe, expect, it } from "vitest";
import type { ActivityRecord } from "@/db/types";
import { doneKmForWeek, volumeTrend, weekSummary } from "@/planner/summary";
import type { Session } from "@/planner/types";

const PLAN_START = "2026-09-21"; // lundi de la semaine 1

const act = (date: string, distanceKm: number, extra: Partial<ActivityRecord> = {}): ActivityRecord => ({
  id: `${date}-${distanceKm}`,
  date,
  startTime: `${date}T18:00:00Z`,
  sport: "running",
  distanceKm,
  durationSec: distanceKm * 300,
  avgPace: 300,
  avgHr: 150,
  ...extra,
});

const session = (date: string, week: number, distanceKm: number, status: Session["status"]): Session => ({
  id: date,
  date,
  week,
  phase: "base",
  type: "ef",
  title: "Footing",
  details: "",
  distanceKm,
  targetPace: { min: 345, max: 370 },
  targetHr: { min: 128, max: 142 },
  status,
});

describe("doneKmForWeek (D22, D28)", () => {
  it("compte les courses de la semaine même sans séance liée (sam. 3 oct., séance le dim.)", () => {
    expect(doneKmForWeek([act("2026-09-30", 7.5), act("2026-10-03", 22.6)], PLAN_START, 2)).toBe(30.1);
  });
  it("exclut la marche, les autres sports et les sorties d'avant le plan", () => {
    const activities = [
      act("2026-09-21", 6.9),
      act("2026-09-20", 10), // avant le plan (et semaine 0)
      act("2026-09-22", 20, { sport: "cycling" }),
      act("2026-09-23", 4.1, { avgPace: 1326 }), // marche
    ];
    expect(doneKmForWeek(activities, PLAN_START, 1)).toBe(6.9);
  });
  it("additionne les doubles sorties d'une même journée", () => {
    expect(doneKmForWeek([act("2026-10-20", 11.1), act("2026-10-20", 0.78)], PLAN_START, 5)).toBe(11.9);
  });
});

describe("weekSummary et volumeTrend", () => {
  it("le statut de la semaine se calcule sur toutes les courses, pas seulement les séances liées", () => {
    // Semaine 8 (9-15 nov.) : 23 km prévus avant le 14, 32,7 km courus dont 11,3 km un jour sans séance.
    const sessions = [
      session("2026-11-10", 8, 9, "skipped"),
      session("2026-11-11", 8, 7, "done"),
      session("2026-11-13", 8, 7, "done"),
      session("2026-11-15", 8, 21, "upcoming"),
    ];
    const activities = [act("2026-11-09", 7.18), act("2026-11-09", 4.12, { avgPace: 1326 }), act("2026-11-11", 10.14), act("2026-11-13", 11.23)];
    const s = weekSummary(sessions, activities, PLAN_START, 8, "2026-11-14");
    expect(s.doneKm).toBe(28.6); // la marche du 9 nov. (4,12 km) est exclue
    expect(s.plannedToDateKm).toBe(23);
    expect(s.status).toBe("avance");
    expect(s.doneCount).toBe(2);
  });
  it("la tendance utilise le même calcul et laisse vides les semaines à venir", () => {
    const points = volumeTrend([], [act("2026-10-03", 22.6)], PLAN_START, "2026-10-04", 1, 1);
    expect(points.map((p) => [p.week, p.doneKm])).toEqual([
      [1, 0],
      [2, 22.6],
      [3, null],
    ]);
  });
  it("fenêtre téléphone : les 8 semaines qui finissent à la semaine en cours (dès le début du plan : S1 à S8)", () => {
    const all = volumeTrend([], [], PLAN_START, "2026-11-18", 30, 30);
    expect(all.filter((p) => p.inPhoneWindow).map((p) => p.week)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    const early = volumeTrend([], [], PLAN_START, "2026-09-30", 30, 30);
    expect(early.filter((p) => p.inPhoneWindow).map((p) => p.week)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
