// Tons d'état du design system (DESIGN.md §2.3) : une couleur d'état est toujours doublée d'un mot.
// Le ton arrive tout fait depuis engine/ ou planner/ : le composant ne décide jamais d'un seuil.

export type Tone = "neutral" | "good" | "warn" | "alert";

export const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-text",
  good: "text-good",
  warn: "text-warn",
  alert: "text-alert",
};

export const TONE_STROKE: Record<Tone, string> = {
  neutral: "stroke-text",
  good: "stroke-good",
  warn: "stroke-warn",
  alert: "stroke-alert",
};
