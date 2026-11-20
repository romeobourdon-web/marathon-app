import { describe, expect, it } from "vitest";
import { parseDate, parseDuration, parsePositive, parseReturnPath, parseScale, parseText, parseTime, parseUuid } from "@/lib/form";

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

describe("saisie d'une sortie ou d'une échéance", () => {
  it("parseDuration", () => {
    expect(parseDuration("45:12")).toBe(2712);
    expect(parseDuration("1:06:00")).toBe(3960);
    expect(parseDuration("45")).toBe(2700);
    expect(parseDuration("1h06:00")).toBe(3960);
    expect(parseDuration("45:75")).toBeNull();
    expect(parseDuration("abc")).toBeNull();
    expect(parseDuration("0")).toBeNull();
  });
  it("parsePositive", () => {
    expect(parsePositive("10,5", 300)).toBe(10.5);
    expect(parsePositive("0", 300)).toBeNull();
    expect(parsePositive("400", 300)).toBeNull();
  });
  it("parseDate, parseTime", () => {
    expect(parseDate("2026-11-20")).toBe("2026-11-20");
    expect(parseDate("2026-02-30")).toBeNull();
    expect(parseTime("07:05")).toBe("07:05");
    expect(parseTime("24:00")).toBeNull();
  });
});
