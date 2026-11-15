import { describe, expect, it } from "vitest";
import type { ActivityResult } from "@/db/types";
import { linkSessions, nextSession } from "@/planner/sessions";
import type { PlannedSession } from "@/planner/types";

const planned = (date: string): PlannedSession => ({
  id: date,
  date,
  week: 8,
  phase: "base",
  type: "sortie-longue",
  title: "Sortie longue",
  details: "",
  distanceKm: 21,
  targetPace: { min: 340, max: 360 },
  targetHr: { min: 131, max: 144 },
});
const done: ActivityResult = { skipped: false, actual: { distanceKm: 14.48, durationSec: 4600, avgPace: 318, avgHr: 144 } };
const none: ActivityResult = { skipped: true };

describe("linkSessions", () => {
  it("statut selon la date quand rien n'est lié", () => {
    const s = linkSessions([planned("2026-11-13"), planned("2026-11-15"), planned("2026-11-17")], "2026-11-15", () => none);
    expect(s.map((x) => x.status)).toEqual(["skipped", "today", "upcoming"]);
  });
  it("une séance liée est réalisée même si c'est celle du jour (sortie faite la veille, D28)", () => {
    const s = linkSessions([planned("2026-11-15")], "2026-11-15", () => done);
    expect(s[0].status).toBe("done");
    expect(s[0].actual?.distanceKm).toBe(14.48);
  });
  it("la prochaine séance ignore celle du jour déjà réalisée", () => {
    const sessions = linkSessions([planned("2026-11-15"), planned("2026-11-17")], "2026-11-15", (p) => (p.date === "2026-11-15" ? done : none));
    expect(nextSession(sessions)?.date).toBe("2026-11-17");
  });
});
