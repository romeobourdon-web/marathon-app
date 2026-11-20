import { describe, expect, it } from "vitest";
import { avgCadenceSpm, endHrDrift, kmSplits, type KmSplit } from "@/engine/splits";

// Série inventée : 2,5 km à vitesse constante 3,333 m/s (5'00/km), un point toutes les 30 s (100 m).
const n = 26;
const timeS = Array.from({ length: n }, (_, i) => i * 30);
const distanceM = timeS.map((t) => t * (1000 / 300));
const hr = timeS.map((t) => (t < 300 ? 140 : t < 600 ? 150 : 160));

describe("kmSplits", () => {
  it("tours de 1 km interpolés, dernier tour partiel gardé s'il fait ≥ 100 m", () => {
    const splits = kmSplits({ timeS, distanceM, hr });
    expect(splits.map((s) => [s.km, s.distanceM, s.durationS, s.paceS])).toEqual([
      [1, 1000, 300, 300],
      [2, 1000, 300, 300],
      [3, 500, 150, 300],
    ]);
    expect(splits.map((s) => s.avgHr)).toEqual([140, 150, 160]);
  });

  it("ignore les distances absentes ; rien sans au moins 2 points", () => {
    expect(kmSplits({ timeS: [0, 10], distanceM: [null, null], hr: [null, null] })).toEqual([]);
    const withGap = kmSplits({ timeS, distanceM: distanceM.map((d, i) => (i === 5 ? null : d)), hr });
    expect(withGap[0].durationS).toBe(300);
  });

  it("un arrêt (vitesse < 0,5 m/s) ne compte pas dans l'allure du tour", () => {
    // 500 m en 150 s, arrêt de 600 s sur place, puis 500 m en 150 s
    const s = kmSplits({ timeS: [0, 150, 750, 900], distanceM: [0, 500, 500, 1000], hr: [null, 140, 100, 140] });
    expect(s[0].durationS).toBe(300);
    expect(s[0].paceS).toBe(300);
  });

  it("un reste de moins de 100 m n'est pas un tour", () => {
    expect(kmSplits({ timeS: [0, 300, 315], distanceM: [0, 1000, 1050], hr: [null, 150, 150] }).length).toBe(1);
  });
});

describe("endHrDrift", () => {
  const split = (avgHr: number | null): KmSplit => ({ km: 1, distanceM: 1000, durationS: 300, paceS: 300, avgHr });
  it("vrai si les 3 derniers km sont au-dessus de la zone", () => {
    expect(endHrDrift([split(140), split(146), split(147), split(150)], 144)).toBe(true);
    expect(endHrDrift([split(146), split(143), split(147), split(150)], 144)).toBe(false);
    expect(endHrDrift([split(150), split(150)], 144)).toBe(false);
  });
});

describe("avgCadenceSpm (D22)", () => {
  it("moyenne d'un pied × 2, arrêts ignorés", () => {
    expect(avgCadenceSpm([85, 86, 0, null, 87])).toBe(172);
    expect(avgCadenceSpm([null, 0])).toBeNull();
  });
});
