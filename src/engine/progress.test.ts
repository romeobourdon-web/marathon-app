import { describe, expect, it } from "vitest";
import { cappedPct, planProgressPct } from "@/engine/progress";

describe("planProgressPct", () => {
  it("arrondit à l'unité", () => {
    expect(planProgressPct(8, 30)).toBe(27);
    expect(planProgressPct(30, 30)).toBe(100);
  });
});

describe("cappedPct", () => {
  it("calcule le pourcentage sans l'arrondir", () => {
    expect(cappedPct(10, 40)).toBe(25);
    expect(cappedPct(1, 3)).toBeCloseTo(33.333, 3);
  });

  it("plafonne à 100", () => {
    expect(cappedPct(50, 40)).toBe(100);
  });
});
