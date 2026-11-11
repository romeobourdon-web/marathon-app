// Footings récents (EF et récup) : écart d'allure et dépassements de FC.

import { addDays } from "@/lib/dates";
import type { Session } from "@/planner/types";

export interface EasyRunFocus {
  count: number; // footings réalisés sur la période
  paceGap: number; // écart moyen (s/km) à la borne rapide de la zone, arrondi ; négatif = trop vite
  tooFast: boolean;
  hrOverCount: number; // footings dont la FC moyenne dépasse le haut de la zone
  hrZoneMax?: number; // haut de la zone de FC du premier footing de la période
}

/** Footings (EF, récup) réalisés entre `today - days` et `today`. */
export function easyRunFocus(sessions: Session[], today: string, days = 14): EasyRunFocus {
  const since = addDays(today, -days);
  const easy = sessions.filter((s) => s.status === "done" && (s.type === "ef" || s.type === "recup") && s.date >= since);
  const gap = easy.length
    ? Math.round(easy.reduce((acc, s) => acc + (s.actual!.avgPace - s.targetPace.min), 0) / easy.length)
    : 0;
  return {
    count: easy.length,
    paceGap: gap,
    tooFast: gap < 0,
    hrOverCount: easy.filter((s) => s.actual!.avgHr > s.targetHr.max).length,
    hrZoneMax: easy[0]?.targetHr.max,
  };
}
