import { describe, expect, it } from "vitest";
import {
  formatClock,
  formatDate,
  formatDistance,
  formatDistanceParts,
  formatDurationApprox,
  formatPacePerKm,
  formatPaceRangeValue,
  formatPaceValue,
  formatWeeksDays,
  formatSignedDelta,
} from "./format";

const NBSP = " ";

describe("formatPacePerKm", () => {
  it("formate une allure en min'ss /km", () => {
    expect(formatPacePerKm(330)).toBe(`5'30${NBSP}/km`);
    expect(formatPacePerKm(298)).toBe(`4'58${NBSP}/km`);
  });
  it("arrondit à la seconde sans produire 60 secondes", () => {
    expect(formatPacePerKm(359.6)).toBe(`6'00${NBSP}/km`);
  });
});

describe("formatClock", () => {
  it("affiche h:mm:ss au-delà d'une heure", () => {
    expect(formatClock(3960)).toBe("1:06:00");
    expect(formatClock(12600)).toBe("3:30:00");
  });
  it("affiche m:ss en dessous d'une heure", () => {
    expect(formatClock(2712)).toBe("45:12");
  });
});

describe("formatDurationApprox", () => {
  it("affiche ≈ h h mm", () => {
    expect(formatDurationApprox(3960)).toBe(`≈${NBSP}1${NBSP}h${NBSP}06`);
  });
  it("affiche ≈ m min en dessous d'une heure", () => {
    expect(formatDurationApprox(2700)).toBe(`≈${NBSP}45${NBSP}min`);
  });
});

describe("formatDistance", () => {
  it("convertit les mètres en km avec une virgule décimale", () => {
    expect(formatDistance(25_600)).toBe(`25,6${NBSP}km`);
    expect(formatDistance(42_195, 2)).toBe(`42,20${NBSP}km`);
    expect(formatDistance(10_000)).toBe(`10,0${NBSP}km`);
  });
});

describe("formatDistanceParts", () => {
  it("sépare la valeur et l'unité", () => {
    expect(formatDistanceParts(12_400)).toEqual({ value: "12,4", unit: "km" });
  });
});

describe("formatSignedDelta", () => {
  it("préfixe + pour un écart positif", () => {
    expect(formatSignedDelta(5)).toBe("+5");
  });
  it("utilise le vrai signe moins U+2212", () => {
    expect(formatSignedDelta(-0.6, 1)).toBe("−0,6");
    expect(formatSignedDelta(-0.6, 1)).not.toContain("-");
  });
  it("n'affiche pas de signe pour zéro, même après arrondi", () => {
    expect(formatSignedDelta(0)).toBe("0");
    expect(formatSignedDelta(-0.04, 1)).toBe("0,0");
  });
});

describe("formatDate", () => {
  it("formate une date ISO en français", () => {
    expect(formatDate("2026-11-14")).toBe("sam. 14 nov.");
    expect(formatDate("2026-11-14", "long")).toBe("samedi 14 novembre");
    expect(formatDate("2027-04-18", "full")).toBe("dim. 18 avril 2027");
  });
});

describe("formatPaceValue / formatPaceRangeValue", () => {
  it("allure sans unité, fourchette avec tiret demi-cadratin", () => {
    expect(formatPaceValue(298)).toBe("4'58");
    expect(formatPaceRangeValue({ min: 345, max: 370 })).toBe("5'45–6'10");
    expect(formatPaceRangeValue({ min: 300, max: 300 })).toBe("5'00");
  });
});

describe("formatWeeksDays", () => {
  it("accorde semaine(s) et jour(s)", () => {
    expect(formatWeeksDays(22, 1)).toBe(`22${NBSP}semaines et 1${NBSP}jour`);
    expect(formatWeeksDays(1, 0)).toBe(`1${NBSP}semaine et 0${NBSP}jour`);
    expect(formatWeeksDays(3, 4)).toBe(`3${NBSP}semaines et 4${NBSP}jours`);
  });
});
