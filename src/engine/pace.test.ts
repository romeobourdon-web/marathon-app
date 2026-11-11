import { describe, expect, it } from "vitest";
import { paceGap } from "@/engine/pace";

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
