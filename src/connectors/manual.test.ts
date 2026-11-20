import { describe, expect, it } from "vitest";
import { manualRunToActivity } from "@/connectors/manual";

describe("manualRunToActivity (D18)", () => {
  it("heure de Paris → UTC, vitesse moyenne déduite, sans séries", () => {
    const a = manualRunToActivity({ date: "2026-11-20", time: "07:30", sport: "running", distanceKm: 10, durationSec: 3000, avgHr: 145 }, "manual:x");
    expect(a.startTime).toBe("2026-11-20T06:30:00.000Z");
    expect(a.localDate).toBe("2026-11-20");
    expect(a.distanceM).toBe(10000);
    expect(a.avgSpeedMps).toBeCloseTo(3.333, 3);
    expect(a.avgHr).toBe(145);
  });
});
