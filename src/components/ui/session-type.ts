import type { SessionType } from "@/planner/types";
import type { ChipVariant } from "./chip";

/** Ton du Chip de type de séance (DESIGN.md §5) : quality = fractionné, seuil, allure, course ; long = sortie longue. */
export const SESSION_TYPE_TONE: Record<SessionType, Extract<ChipVariant, "neutral" | "quality" | "long">> = {
  ef: "neutral",
  recup: "neutral",
  fractionne: "quality",
  seuil: "quality",
  allure: "quality",
  course: "quality",
  "sortie-longue": "long",
};
