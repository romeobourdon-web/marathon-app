// Tons d'état du design system v2.1 (DESIGN.md §2.4) : une couleur d'état est toujours doublée
// d'un glyphe et d'un mot. Le ton arrive tout fait depuis engine/ ou planner/ : le composant ne décide
// jamais d'un seuil.

export type Tone = "neutral" | "good" | "info" | "warn" | "alert";

export const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-text",
  good: "text-good",
  info: "text-info",
  warn: "text-warn",
  alert: "text-alert",
};

export const TONE_STROKE: Record<Tone, string> = {
  neutral: "stroke-text",
  good: "stroke-good",
  info: "stroke-info",
  warn: "stroke-warn",
  alert: "stroke-alert",
};

/** Glyphe par défaut de chaque état (✓ Dans les clous, ↑ En avance, ! En retard, ! Alerte). */
export const TONE_GLYPH: Record<Exclude<Tone, "neutral">, string> = {
  good: "✓",
  info: "↑",
  warn: "!",
  alert: "!",
};
