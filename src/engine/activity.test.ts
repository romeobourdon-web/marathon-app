import { describe, expect, it } from "vitest";
import { combineActivities, countsForPlan, isWalk } from "@/engine/activity";

describe("isWalk (D28)", () => {
  it("une course plus lente que 9'00/km est de la marche", () => {
    expect(isWalk({ sport: "running", avgPace: 1163 })).toBe(true);
    expect(isWalk({ sport: "running", avgPace: 541 })).toBe(true);
  });
  it("9'00/km pile et plus rapide : course", () => {
    expect(isWalk({ sport: "running", avgPace: 540 })).toBe(false);
    expect(isWalk({ sport: "treadmill_running", avgPace: 300 })).toBe(false);
  });
  it("ne concerne que la course, et pas une allure inconnue", () => {
    expect(isWalk({ sport: "cycling", avgPace: 1200 })).toBe(false);
    expect(isWalk({ sport: "running", avgPace: null })).toBe(false);
  });
});

describe("countsForPlan (D22, D28)", () => {
  const run = { sport: "running", avgPace: 300, date: "2026-10-03" };
  it("compte une course pendant le plan, liée ou non à une séance", () => {
    expect(countsForPlan(run, "2026-09-21")).toBe(true);
  });
  it("exclut les sorties d'avant le plan, les autres sports et la marche", () => {
    expect(countsForPlan({ ...run, date: "2026-09-20" }, "2026-09-21")).toBe(false);
    expect(countsForPlan({ ...run, sport: "cycling" }, "2026-09-21")).toBe(false);
    expect(countsForPlan({ ...run, avgPace: 1326 }, "2026-09-21")).toBe(false);
  });
});

describe("combineActivities (D28)", () => {
  it("additionne les distances et pondère allure et FC (cas du 25 oct. : 1,97 + 7,80 km)", () => {
    const combined = combineActivities([
      { distanceKm: 1.97, durationSec: 561, avgPace: 284, avgHr: 136 },
      { distanceKm: 7.8, durationSec: 2200, avgPace: 282, avgHr: 154 },
    ]);
    expect(combined).toEqual({ distanceKm: 9.77, durationSec: 2761, avgPace: 282, avgHr: 150 });
  });
  it("renvoie l'activité telle quelle s'il n'y en a qu'une, null s'il n'y en a pas", () => {
    const one = { distanceKm: 10, durationSec: 3000, avgPace: 300, avgHr: 150 };
    expect(combineActivities([one])).toBe(one);
    expect(combineActivities([])).toBeNull();
  });
});
