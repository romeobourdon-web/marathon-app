import { describe, expect, it } from "vitest";
import { latestWellness } from "@/engine/wellness";

// Valeurs inventées.
const day = (date: string, hrvMs: number | null, restingHr: number | null, sleepS: number | null) => ({ date, hrvMs, restingHr, sleepS });

describe("latestWellness", () => {
  it("prend, mesure par mesure, la valeur la plus récente des 2 derniers jours", () => {
    const days = [day("2026-11-16", 60, 50, 25000), day("2026-11-17", null, 48, 26000), day("2026-11-18", null, null, null)];
    expect(latestWellness(days, "2026-11-18")).toEqual({ hrvMs: 60, restingHr: 48, sleepS: 26000 });
  });

  it("rien au-delà de 2 jours, ni dans le futur", () => {
    expect(latestWellness([day("2026-11-10", 60, 50, 25000), day("2026-11-19", 70, 45, 28000)], "2026-11-18")).toEqual({
      hrvMs: null,
      restingHr: null,
      sleepS: null,
    });
  });
});
