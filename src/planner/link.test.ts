import { describe, expect, it } from "vitest";
import { autoLinks, type LinkableActivity, type LinkableSession } from "@/planner/link";

const session = (id: string, date: string, distanceKm: number, linked = false): LinkableSession => ({ id, date, distanceKm, linked });
const activity = (id: string, date: string, distanceKm: number, extra: Partial<LinkableActivity> = {}): LinkableActivity => ({
  id,
  date,
  startTime: `${date}T12:00:00Z`,
  distanceKm,
  eligible: true,
  linked: false,
  ...extra,
});

// Semaine 2 du plan : mar. 29 sept. fractionné, mer. 30 EF, ven. 2 oct. EF, dim. 4 oct. sortie longue.
const week2 = [
  session("tue", "2026-09-29", 7),
  session("wed", "2026-09-30", 5, true),
  session("fri", "2026-10-02", 6),
  session("sun", "2026-10-04", 17),
];

describe("autoLinks (D28)", () => {
  it("lie d'abord le jour même, y compris plusieurs activités à la même séance", () => {
    const links = autoLinks([session("s", "2026-10-20", 7)], [activity("a1", "2026-10-20", 11.1), activity("a2", "2026-10-20", 0.78)]);
    expect(links).toEqual([
      { activityId: "a1", sessionId: "s" },
      { activityId: "a2", sessionId: "s" },
    ]);
  });

  it("sam. 3 oct. → séance non liée du dim. 4 oct., la plus proche en distance", () => {
    expect(autoLinks(week2, [activity("long", "2026-10-03", 22.6)])).toEqual([{ activityId: "long", sessionId: "sun" }]);
  });

  it("ne choisit qu'une séance non liée, à ± 1 jour seulement", () => {
    // jeu. 1er oct. : mer. 30 déjà liée → ven. 2 oct.
    expect(autoLinks(week2, [activity("thu", "2026-10-01", 6)])).toEqual([{ activityId: "thu", sessionId: "fri" }]);
    // lun. 28 sept. : mar. 29 à + 1 jour ; aucune séance à 2 jours n'est prise
    expect(autoLinks([session("sun", "2026-10-04", 17)], [activity("mon", "2026-09-28", 8)])).toEqual([]);
  });

  it("une séance prise à ± 1 jour ne l'est qu'une fois", () => {
    const links = autoLinks([session("sun", "2026-10-04", 17)], [activity("sat", "2026-10-03", 16), activity("mon", "2026-10-05", 17)]);
    expect(links).toEqual([{ activityId: "sat", sessionId: "sun" }]);
  });

  it("ignore les activités non éligibles (marche, autre sport) et celles déjà liées", () => {
    const links = autoLinks(week2, [
      activity("walk", "2026-10-04", 4, { eligible: false }),
      activity("done", "2026-10-02", 6, { linked: true }),
    ]);
    expect(links).toEqual([]);
  });
});
