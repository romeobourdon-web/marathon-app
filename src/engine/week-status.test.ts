import { describe, expect, it } from "vitest";
import { weekStatus } from "@/engine/week-status";

describe("weekStatus", () => {
  it("rien de prévu à date → ok", () => {
    expect(weekStatus(0, 0)).toBe("ok");
    expect(weekStatus(12, 0)).toBe("ok");
  });

  it("applique les seuils 1,05 et 0,9 (bornes incluses)", () => {
    expect(weekStatus(21, 20)).toBe("avance"); // 1,05
    expect(weekStatus(20.9, 20)).toBe("ok");
    expect(weekStatus(18, 20)).toBe("ok"); // 0,9
    expect(weekStatus(17.9, 20)).toBe("retard");
  });
});
