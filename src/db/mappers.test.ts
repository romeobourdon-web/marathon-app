import { describe, expect, it } from "vitest";
import { toActivityResult, toPlannedSession, toRace, type PlannedSessionRow } from "@/db/mappers";

const row: PlannedSessionRow = {
  id: "uuid-1",
  date: "2026-10-06",
  week: 3,
  type: "ef",
  title: "Footing EF",
  details: "Allure conversation.",
  distance_m: 8_200,
  pace_min_s_km: 345,
  pace_max_s_km: 370,
  hr_min: 128,
  hr_max: 142,
  plan_phase: { code: "base" },
  session_link: [],
};

describe("toRace", () => {
  it("convertit l'événement et calcule l'allure cible", () => {
    expect(toRace({ name: "Marathon", date: "2027-04-18", distance_m: 42_195, target_time_s: 12_600 })).toEqual({
      name: "Marathon",
      date: "2027-04-18",
      distanceKm: 42.195,
      targetTimeSec: 12_600,
      targetPace: 298,
    });
  });
});

describe("toPlannedSession", () => {
  it("convertit les mètres en km et regroupe les fourchettes", () => {
    const s = toPlannedSession(row);
    expect(s).toMatchObject({ id: "uuid-1", phase: "base", type: "ef", distanceKm: 8.2 });
    expect(s.targetPace).toEqual({ min: 345, max: 370 });
    expect(s.targetHr).toEqual({ min: 128, max: 142 });
  });
});

describe("toActivityResult", () => {
  it("sans activité liée : séance non faite", () => {
    expect(toActivityResult(row)).toEqual({ skipped: true });
  });

  it("avec activité liée : réalisé et journal", () => {
    const linked: PlannedSessionRow = {
      ...row,
      session_link: [
        {
          activity: {
            start_time: "2026-10-06T07:00:00+00:00",
            distance_m: 8_400,
            moving_time_s: 2_772,
            avg_hr: 139,
            avg_speed_mps: 1000 / 330,
            journal_entry: { feeling: 4, rpe: 4, comment: "Bonnes jambes." },
          },
        },
      ],
    };
    expect(toActivityResult(linked)).toEqual({
      skipped: false,
      actual: { distanceKm: 8.4, durationSec: 2_772, avgPace: 330, avgHr: 139 },
      journal: { feeling: 4, rpe: 4, note: "Bonnes jambes." },
    });
  });

  it("garde la première activité de la journée et tolère un journal absent", () => {
    const activity = (start: string, d: number) => ({
      start_time: start,
      distance_m: d,
      moving_time_s: 1_800,
      avg_hr: 140,
      avg_speed_mps: 3,
      journal_entry: null,
    });
    const r = toActivityResult({
      ...row,
      session_link: [{ activity: activity("2026-10-06T18:00:00+00:00", 5_000) }, { activity: activity("2026-10-06T07:00:00+00:00", 6_000) }],
    });
    expect(r.skipped).toBe(false);
    if (!r.skipped) {
      expect(r.actual.distanceKm).toBe(6);
      expect(r.journal).toBeUndefined();
    }
  });
});
