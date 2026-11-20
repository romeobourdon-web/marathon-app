import { describe, expect, it } from "vitest";
import { toActivityRecord, toActivityResult, toPlannedSession, toRace, type PlannedSessionRow } from "@/db/mappers";

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
            id: "a1",
            source: "garmin",
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
      activityIds: ["a1"],
    });
  });

  it("agrège une séance faite en plusieurs activités (D28) et tolère un journal absent", () => {
    const activity = (start: string, d: number, pace: number, hr: number, time: number) => ({
      id: start.slice(11, 16),
      source: "garmin",
      start_time: start,
      distance_m: d,
      moving_time_s: time,
      avg_hr: hr,
      avg_speed_mps: 1000 / pace,
      journal_entry: null,
    });
    const r = toActivityResult({
      ...row,
      session_link: [
        { activity: activity("2026-10-25T16:29:00+00:00", 7_800, 282, 154, 2_200) },
        { activity: activity("2026-10-25T15:15:00+00:00", 1_970, 284, 136, 561) },
      ],
    });
    expect(r).toEqual({ skipped: false, actual: { distanceKm: 9.77, durationSec: 2_761, avgPace: 282, avgHr: 150 }, journal: undefined, activityIds: ["15:15", "16:29"] });
  });

  it("ignore le réalisé fictif quand de vraies activités existent", () => {
    const mockLinked: PlannedSessionRow = {
      ...row,
      session_link: [
        {
          activity: {
            id: "m1",
            source: "mock",
            start_time: "2026-10-06T07:00:00+00:00",
            distance_m: 8_000,
            moving_time_s: 2_700,
            avg_hr: 140,
            avg_speed_mps: 3,
            journal_entry: null,
          },
        },
      ],
    };
    expect(toActivityResult(mockLinked).skipped).toBe(false);
    expect(toActivityResult(mockLinked, { ignoreMock: true })).toEqual({ skipped: true });
  });
});

describe("toActivityRecord", () => {
  it("convertit m → km et m/s → allure, sans perdre une FC absente", () => {
    expect(
      toActivityRecord({
        id: "a",
        local_date: "2026-10-31",
        start_time: "2026-10-31T21:05:00+00:00",
        sport: "running",
        distance_m: 5_680,
        moving_time_s: 4_119,
        avg_hr: null,
        avg_speed_mps: 1000 / 1163,
      }),
    ).toEqual({ id: "a", date: "2026-10-31", startTime: "2026-10-31T21:05:00+00:00", sport: "running", distanceKm: 5.68, durationSec: 4_119, avgPace: 1163, avgHr: null });
  });
});
