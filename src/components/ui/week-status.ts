import type { WeekStatus } from "@/engine/week-status";
import type { Tone } from "./tone";

/** Statut d'une semaine (engine/week-status) → Chip : ✓ Dans les clous · ↑ En avance · ! En retard. */
export const WEEK_STATUS_CHIP: Record<WeekStatus, { word: string; tone: Extract<Tone, "good" | "info" | "warn"> }> = {
  ok: { word: "Dans les clous", tone: "good" },
  avance: { word: "En avance", tone: "info" },
  retard: { word: "En retard", tone: "warn" },
};
