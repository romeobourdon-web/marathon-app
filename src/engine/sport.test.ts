import { describe, expect, it } from "vitest";
import { isRunningSport } from "@/engine/sport";

describe("isRunningSport", () => {
  it("reconnaît la course, y compris sur tapis", () => {
    expect(isRunningSport("running")).toBe(true);
    expect(isRunningSport("treadmill_running")).toBe(true);
  });
  it("exclut les autres sports", () => {
    expect(isRunningSport("cycling")).toBe(false);
    expect(isRunningSport("stand_up_paddleboarding_v2")).toBe(false);
  });
});
