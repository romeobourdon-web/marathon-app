import { describe, expect, it } from "vitest";
import { parseReturnPath, parseScale, parseText, parseUuid } from "@/lib/form";

describe("lecture des formulaires", () => {
  it("parseScale : entier dans l'échelle, sinon null", () => {
    expect(parseScale("3", 5)).toBe(3);
    expect(parseScale("6", 5)).toBeNull();
    expect(parseScale("2.5", 10)).toBeNull();
    expect(parseScale("", 5)).toBeNull();
    expect(parseScale(null, 5)).toBeNull();
  });
  it("parseText : nettoyé, vide → null, tronqué", () => {
    expect(parseText("  bien  ")).toBe("bien");
    expect(parseText("   ")).toBeNull();
    expect(parseText("abcdef", 3)).toBe("abc");
  });
  it("parseReturnPath : chemins internes seulement", () => {
    expect(parseReturnPath("/seances/abc-123", "/journal")).toBe("/seances/abc-123");
    expect(parseReturnPath("/", "/journal")).toBe("/");
    expect(parseReturnPath("//evil.example", "/journal")).toBe("/journal");
    expect(parseReturnPath("https://evil.example", "/journal")).toBe("/journal");
  });
  it("parseUuid", () => {
    expect(parseUuid("fea8e364-c807-4695-8a59-9794538550a4")).toBe("fea8e364-c807-4695-8a59-9794538550a4");
    expect(parseUuid("x")).toBeNull();
  });
});
