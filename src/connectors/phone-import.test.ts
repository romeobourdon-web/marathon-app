import { describe, expect, it } from "vitest";
import { phoneRunToActivity } from "@/connectors/phone-import";

// Sortie anonymisée (valeurs inventées).
const run = {
  strava_id: "123",
  start_local: "2026-06-10T07:15:00",
  timezone: "Europe/Paris",
  sport: "running",
  distance_m: 5000,
  moving_time_s: 1500,
  elapsed_time_s: 1600,
  elevation_gain_m: 12,
};

describe("phoneRunToActivity (D32)", () => {
  it("source_id strava:<id>, départ converti depuis Paris, vitesse déduite, sans FC", () => {
    const a = phoneRunToActivity(run);
    expect(a.sourceId).toBe("strava:123");
    expect(a.startTime).toBe("2026-06-10T05:15:00.000Z");
    expect(a.localDate).toBe("2026-06-10");
    expect(a.avgSpeedMps).toBeCloseTo(3.333, 3);
    expect(a.avgHr).toBeNull();
  });

  it("refuse un autre fuseau", () => {
    expect(() => phoneRunToActivity({ ...run, timezone: "Europe/London" })).toThrow();
  });
});
