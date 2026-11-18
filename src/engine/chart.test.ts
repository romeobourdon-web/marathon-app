import { describe, expect, it } from "vitest";
import { barHeightsPct, distanceGapM, lineGeometry, niceScaleMax, pairedBarHeightsPct, trendGeometry } from "./chart";

describe("barHeightsPct", () => {
  it("met à l'échelle de la plus grande valeur", () => {
    expect(barHeightsPct([0, 9, 18])).toEqual([0, 50, 100]);
  });
  it("accepte une échelle commune et plafonne à 100", () => {
    expect(barHeightsPct([10, 25], 20)).toEqual([50, 100]);
  });
  it("renvoie 0 partout si rien n'est prévu", () => {
    expect(barHeightsPct([0, 0])).toEqual([0, 0]);
    expect(barHeightsPct([])).toEqual([]);
  });
});

describe("trendGeometry", () => {
  it("place la plus grande valeur en haut et la plus petite en bas, avec la marge", () => {
    const { points, targetY } = trendGeometry([200, 100], 150);
    expect(points).toEqual([
      { x: 0, y: 10 },
      { x: 100, y: 90 },
    ]);
    expect(targetY).toBe(50);
  });
  it("inclut la cible dans l'échelle même hors des valeurs", () => {
    const { points, targetY } = trendGeometry([200, 200], 100, 0);
    expect(points.every((p) => p.y === 0)).toBe(true);
    expect(targetY).toBe(100);
  });
  it("centre un point unique", () => {
    expect(trendGeometry([5], 5).points[0].x).toBe(50);
  });
});

describe("distanceGapM", () => {
  it("est négatif quand le réalisé est plus court", () => {
    expect(distanceGapM(18_000, 17_400)).toBe(-600);
  });
});

describe("pairedBarHeightsPct", () => {
  it("met prévu et réalisé sur la même échelle", () => {
    expect(pairedBarHeightsPct([10, 20], [5, 25])).toEqual({ planned: [40, 80], done: [20, 100] });
  });
});

describe("lineGeometry", () => {
  it("axe normal : la plus grande valeur en haut, références placées sur la même échelle", () => {
    const g = lineGeometry([200, 100], [150], { paddingPct: 0 });
    expect(g.points.map((p) => p.y)).toEqual([0, 100]);
    expect(g.refY).toEqual([50]);
  });
  it("axe inversé (allure) : la plus rapide (plus petite) en haut", () => {
    const g = lineGeometry([300, 360], [345, 370], { invert: true, paddingPct: 0 });
    expect(g.points.map((p) => p.y)).toEqual([0, 85.71]);
    expect(g.refY).toEqual([64.29, 100]);
  });
});

describe("niceScaleMax", () => {
  it("arrondit au multiple supérieur du pas, au moins un pas", () => {
    expect(niceScaleMax([43, 51.1, 38], 20)).toBe(60);
    expect(niceScaleMax([60], 20)).toBe(60);
    expect(niceScaleMax([], 20)).toBe(20);
  });
});
