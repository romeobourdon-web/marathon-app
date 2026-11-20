import { describe, expect, it } from "vitest";
import { eventsView, type EventRecord } from "@/planner/events";

const event = (id: string, date: string, extra: Partial<EventRecord> = {}): EventRecord => ({
  id,
  name: id,
  date,
  distanceKm: 10,
  targetTimeSec: null,
  kind: "test",
  isTarget: false,
  result: null,
  ...extra,
});

describe("eventsView", () => {
  const { upcoming, past } = eventsView(
    [
      event("marathon", "2027-04-18", { kind: "race", isTarget: true, distanceKm: 42.195, targetTimeSec: 12600 }),
      event("10k", "2027-01-10"),
      event("ref", "2026-04-04", { distanceKm: 5, result: { durationSec: 1130 } }),
      event("hier", "2026-11-19"),
    ],
    "2026-09-21",
    "2026-11-20",
  );

  it("course cible en tête, puis par date ; passées de la plus récente à la plus ancienne", () => {
    expect(upcoming.map((e) => e.id)).toEqual(["marathon", "10k"]);
    expect(past.map((e) => e.id)).toEqual(["hier", "ref"]);
  });

  it("J-n, semaine du plan, allure visée et réalisée", () => {
    expect(upcoming[0]).toMatchObject({ daysLeft: 149, week: 30, targetPace: 298 });
    expect(past[1]).toMatchObject({ week: null, resultPace: 226 });
  });
});
