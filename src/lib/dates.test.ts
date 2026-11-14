import { describe, expect, it } from "vitest";
import { addDays, dateChunks, daysBetween, splitWeeksDays, todayInParis } from "@/lib/dates";

describe("dates", () => {
  it("addDays traverse les mois et les années", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-09-21", -1)).toBe("2026-09-20");
  });

  it("daysBetween ignore le changement d'heure", () => {
    expect(daysBetween("2026-10-20", "2026-10-27")).toBe(7);
    expect(daysBetween("2027-04-18", "2026-11-11")).toBe(-158);
  });

  it("todayInParis utilise le fuseau de Paris", () => {
    expect(todayInParis(new Date("2026-11-11T23:30:00Z"))).toBe("2026-11-12");
  });

  it("splitWeeksDays découpe en semaines et jours", () => {
    expect(splitWeeksDays(158)).toEqual({ weeks: 22, days: 4 });
    expect(splitWeeksDays(7)).toEqual({ weeks: 1, days: 0 });
    expect(splitWeeksDays(0)).toEqual({ weeks: 0, days: 0 });
  });
});

describe("dateChunks", () => {
  it("découpe une plage en tranches de taille maximale, bornes incluses", () => {
    expect(dateChunks("2026-04-04", "2026-05-10", 31)).toEqual([
      { from: "2026-04-04", to: "2026-05-04" },
      { from: "2026-05-05", to: "2026-05-10" },
    ]);
  });
  it("renvoie une seule tranche si la plage est courte, aucune si elle est vide", () => {
    expect(dateChunks("2026-04-04", "2026-04-04", 31)).toEqual([{ from: "2026-04-04", to: "2026-04-04" }]);
    expect(dateChunks("2026-04-05", "2026-04-04", 31)).toEqual([]);
  });
});
