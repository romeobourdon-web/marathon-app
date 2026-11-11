import { describe, expect, it } from "vitest";
import { easyRunFocus } from "@/engine/endurance";
import type { Session } from "@/planner/types";

function run(date: string, type: Session["type"], avgPace: number, avgHr: number, status: Session["status"] = "done"): Session {
  return {
    id: date,
    date,
    week: 1,
    phase: "base",
    type,
    title: "",
    details: "",
    distanceKm: 10,
    targetPace: { min: 345, max: 370 },
    targetHr: { min: 128, max: 142 },
    status,
    actual: status === "done" ? { distanceKm: 10, durationSec: 3500, avgPace, avgHr } : undefined,
  };
}

describe("easyRunFocus", () => {
  const today = "2026-11-11";

  it("aucun footing → écart 0, pas trop vite", () => {
    expect(easyRunFocus([], today)).toEqual({ count: 0, paceGap: 0, tooFast: false, hrOverCount: 0, hrZoneMax: undefined });
  });

  it("moyenne l'écart à la borne rapide et compte les FC au-dessus de la zone", () => {
    const sessions = [
      run("2026-11-08", "ef", 325, 150), // −20, FC au-dessus
      run("2026-11-10", "recup", 340, 140), // −5
      run("2026-10-20", "ef", 300, 170), // hors période
      run("2026-11-09", "seuil", 270, 165), // pas un footing
      run("2026-11-07", "ef", 0, 0, "skipped"), // non réalisé
    ];
    // (−20 − 5) / 2 = −12,5 → Math.round arrondit vers +∞ : −12
    expect(easyRunFocus(sessions, today)).toEqual({ count: 2, paceGap: -12, tooFast: true, hrOverCount: 1, hrZoneMax: 142 });
  });

  it("inclut le jour limite (today − 14)", () => {
    expect(easyRunFocus([run("2026-10-28", "ef", 350, 130)], today).count).toBe(1);
    expect(easyRunFocus([run("2026-10-27", "ef", 350, 130)], today).count).toBe(0);
  });
});
