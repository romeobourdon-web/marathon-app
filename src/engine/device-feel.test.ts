import { describe, expect, it } from "vitest";
import { garminFeelTo5, garminRpeTo10 } from "@/engine/device-feel";

describe("ressenti montre → échelles de l'app (D20)", () => {
  it("ressenti Garmin 0–100 → 1–5", () => {
    expect([0, 25, 50, 75, 100].map(garminFeelTo5)).toEqual([1, 2, 3, 4, 5]);
    expect(garminFeelTo5(null)).toBeNull();
  });
  it("RPE Garmin 10–100 → 1–10, borné", () => {
    expect([10, 50, 100].map(garminRpeTo10)).toEqual([1, 5, 10]);
    expect(garminRpeTo10(0)).toBe(1);
    expect(garminRpeTo10(undefined)).toBeNull();
  });
});
