import { describe, expect, it } from "vitest";
import { computeAutoLinks, diffLinks, type LinkableActivity, type LinkableSession } from "@/planner/link";

const session = (id: string, date: string, distanceKm: number): LinkableSession => ({ id, date, distanceKm });
const activity = (id: string, date: string, distanceKm: number, extra: Partial<LinkableActivity> = {}): LinkableActivity => ({
  id,
  date,
  startTime: `${date}T12:00:00Z`,
  distanceKm,
  eligible: true,
  ...extra,
});

// Semaine 2 du plan : mar. 29 sept. fractionné, mer. 30 EF, ven. 2 oct. EF, dim. 4 oct. sortie longue.
const week2 = [session("tue", "2026-09-29", 7), session("wed", "2026-09-30", 5), session("fri", "2026-10-02", 6), session("sun", "2026-10-04", 17)];

describe("computeAutoLinks — jour même et ± 1 jour (D28)", () => {
  it("lie d'abord le jour même, y compris plusieurs activités à la même séance, quelle que soit la distance", () => {
    const links = computeAutoLinks([session("s", "2026-10-20", 7)], [activity("a1", "2026-10-20", 11.1), activity("a2", "2026-10-20", 0.78)]);
    expect(links).toEqual([
      { activityId: "a1", sessionId: "s" },
      { activityId: "a2", sessionId: "s" },
    ]);
  });

  it("sam. 3 oct. → séance du dim. 4 oct., la plus proche en distance", () => {
    expect(computeAutoLinks(week2, [activity("long", "2026-10-03", 22.6)])).toEqual([{ activityId: "long", sessionId: "sun" }]);
  });

  it("ne prend qu'une séance libre, à ± 1 jour seulement", () => {
    const links = computeAutoLinks(week2, [activity("wedrun", "2026-09-30", 5), activity("thu", "2026-10-01", 6)]);
    expect(links).toEqual([
      { activityId: "wedrun", sessionId: "wed" },
      { activityId: "thu", sessionId: "fri" },
    ]);
    expect(computeAutoLinks([session("sun", "2026-10-04", 17)], [activity("mon", "2026-09-28", 8)])).toEqual([]);
  });

  it("ignore les activités non éligibles (marche, autre sport)", () => {
    expect(computeAutoLinks(week2, [activity("walk", "2026-10-04", 4, { eligible: false })])).toEqual([]);
  });
});

describe("computeAutoLinks — seuil et recalcul (D29)", () => {
  const longRun18 = session("sl18", "2026-10-18", 18);
  const longRun21 = session("sl21", "2026-11-15", 21);

  it("0,41 km la veille d'une sortie longue de 18 km → pas de liaison (< 50 %)", () => {
    expect(computeAutoLinks([longRun18], [activity("tiny", "2026-10-17", 0.41)])).toEqual([]);
  });

  it("14,5 km la veille d'une sortie longue de 21 km → liaison (≥ 50 %)", () => {
    expect(computeAutoLinks([longRun21], [activity("sat", "2026-11-14", 14.5)])).toEqual([{ activityId: "sat", sessionId: "sl21" }]);
  });

  it("une course le jour même reprend la séance liée la veille", () => {
    const sat = activity("sat", "2026-11-14", 14.5);
    const before = computeAutoLinks([longRun21], [sat]);
    const after = computeAutoLinks([longRun21], [sat, activity("sun", "2026-11-15", 21.2)]);
    expect(after).toEqual([{ activityId: "sun", sessionId: "sl21" }]);
    expect(diffLinks(before, after)).toEqual({
      toDelete: [{ activityId: "sat", sessionId: "sl21" }],
      toInsert: [{ activityId: "sun", sessionId: "sl21" }],
    });
  });

  it("une liaison manuelle reste intacte après recalcul : jamais supprimée, son activité jamais réattribuée", () => {
    const manual = [{ activityId: "sat", sessionId: "sl21" }];
    const sessions = [longRun21, session("sat-session", "2026-11-14", 10)];
    // « sat » est liée à la main à la séance du dimanche : elle n'est pas reprise par la séance du samedi.
    const desired = computeAutoLinks(sessions, [activity("sat", "2026-11-14", 14.5), activity("sun", "2026-11-15", 21.2)], manual);
    expect(desired).toEqual([{ activityId: "sun", sessionId: "sl21" }]); // la course du jour s'agrège (D28)
    // Le recalcul ne porte que sur les liaisons automatiques existantes : la manuelle n'en fait pas partie.
    const { toDelete } = diffLinks([{ activityId: "old", sessionId: "sat-session" }], desired);
    expect(toDelete).toEqual([{ activityId: "old", sessionId: "sat-session" }]);
    expect(toDelete).not.toContainEqual(manual[0]);
  });
});
