import { describe, expect, it } from "vitest";
import { paceFromSpeed, paceGap, rangeGap, targetPace } from "@/engine/pace";

describe("paceGap", () => {
  const target = { min: 345, max: 370 };

  it("0 dans la fourchette, bornes incluses", () => {
    expect(paceGap(345, target)).toBe(0);
    expect(paceGap(360, target)).toBe(0);
    expect(paceGap(370, target)).toBe(0);
  });

  it("négatif si plus rapide que la borne rapide", () => {
    expect(paceGap(330, target)).toBe(-15);
  });

  it("positif si plus lent que la borne lente", () => {
    expect(paceGap(380, target)).toBe(10);
  });
});

describe("paceFromSpeed", () => {
  it("convertit une vitesse en allure", () => {
    expect(paceFromSpeed(1000 / 298)).toBe(298);
    expect(paceFromSpeed(2.5)).toBe(400);
  });
  it("renvoie null pour une vitesse nulle", () => {
    expect(paceFromSpeed(0)).toBeNull();
  });
});

describe("targetPace", () => {
  it("donne l'allure à tenir pour un temps visé (arrondi inférieur)", () => {
    expect(targetPace(3 * 3600 + 30 * 60, 42_195)).toBe(298);
  });
});

describe("rangeGap", () => {
  it("FC : 0 dans la zone, sinon l'écart à la borne", () => {
    expect(rangeGap(146, { min: 128, max: 142 })).toBe(4);
    expect(rangeGap(135, { min: 128, max: 142 })).toBe(0);
  });
});
