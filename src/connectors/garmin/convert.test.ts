import { describe, expect, it } from "vitest";
import { gmtToIso, toNeutralActivity, toNeutralStream, toNeutralWellness, type GarminActivity } from "./convert";

// Données ANONYMISÉES : noms de champs réels (samples/garmin, GARMIN.md §3-4), valeurs fictives.
// Aucune coordonnée GPS réelle, aucune valeur de santé réelle.
const activity: GarminActivity = {
  activityId: 1000000001,
  startTimeLocal: "2026-04-04 10:15:00",
  startTimeGMT: "2026-04-04 08:15:00",
  activityType: { typeKey: "running" },
  distance: 5000,
  duration: 1200,
  movingDuration: 1195,
  elapsedDuration: 1260,
  averageHR: 150,
  maxHR: 170,
  averageSpeed: 4.1667,
  elevationGain: 12,
};

describe("gmtToIso", () => {
  it("ajoute le fuseau UTC à startTimeGMT", () => {
    expect(gmtToIso("2026-04-04 08:15:00")).toBe("2026-04-04T08:15:00Z");
  });
});

describe("toNeutralActivity", () => {
  it("reprend les mesures brutes et la date locale", () => {
    const n = toNeutralActivity(activity);
    expect(n).toMatchObject({
      sourceId: "1000000001",
      startTime: "2026-04-04T08:15:00Z",
      localDate: "2026-04-04",
      sport: "running",
      distanceM: 5000,
      movingTimeS: 1195,
      elapsedTimeS: 1260,
      avgHr: 150,
      maxHr: 170,
      avgSpeedMps: 4.1667,
      elevationGainM: 12,
      deviceRpe: null,
      deviceFeel: null,
    });
    expect(n.raw).toBe(activity);
  });

  it("lit le ressenti saisi sur la montre dans le détail (D20)", () => {
    const n = toNeutralActivity(activity, { summaryDTO: { directWorkoutRpe: 50, directWorkoutFeel: 75 } });
    expect(n.deviceRpe).toBe(50);
    expect(n.deviceFeel).toBe(75);
  });

  it("garde les autres sports et tolère les mesures absentes (D21)", () => {
    const n = toNeutralActivity({ ...activity, activityType: { typeKey: "cycling" }, averageHR: null, movingDuration: undefined });
    expect(n.sport).toBe("cycling");
    expect(n.avgHr).toBeNull();
    expect(n.movingTimeS).toBe(1200);
  });
});

describe("toNeutralWellness", () => {
  it("fusionne FC repos, VFC et sommeil par date, sans inventer de valeur", () => {
    const rows = toNeutralWellness(
      [
        { calendarDate: "2026-05-17", heartRate: { restingValue: 50 } },
        { calendarDate: "2026-05-18", heartRate: { restingValue: null } },
      ],
      [{ calendarDate: "2026-05-17", lastNightAvg: 60 }],
      [
        { calendarDate: "2026-05-17", sleepTimeSeconds: 27000, sleepScores: { overall: { value: 80 } } },
        { calendarDate: "2026-05-18", sleepTimeSeconds: 0 },
      ],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ date: "2026-05-17", restingHr: 50, hrvMs: 60, sleepS: 27000, sleepScore: 80 });
  });
});

describe("toNeutralStream", () => {
  it("aligne les séries sur le temps écoulé et convertit les semicircles en degrés", () => {
    const t0 = new Date("2026-04-04T08:15:00Z");
    const s = toNeutralStream([
      { timestamp: t0, distance: 0, enhancedSpeed: 0, heartRate: 100, cadence: 80, positionLat: 2 ** 30, positionLong: -(2 ** 29) },
      { timestamp: new Date(t0.getTime() + 2000), distance: 8, enhancedSpeed: 4, heartRate: 110, enhancedAltitude: 20 },
    ]);
    expect(s).not.toBeNull();
    expect(s!.timeS).toEqual([0, 2]);
    expect(s!.distanceM).toEqual([0, 8]);
    expect(s!.hr).toEqual([100, 110]);
    expect(s!.cadence).toEqual([80, null]);
    expect(s!.altitudeM).toEqual([null, 20]);
    expect(s!.lat).toEqual([90, null]);
    expect(s!.lng).toEqual([-45, null]);
  });

  it("renvoie null sans record horodaté", () => {
    expect(toNeutralStream([])).toBeNull();
  });
});
