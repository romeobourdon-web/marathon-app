export type WeekChartDay = {
  /** Initiale du jour (« L », « M »…). */
  label: string;
  /** Hauteurs en % de l'échelle du graphique (0–100), calculées hors UI. */
  plannedPct: number;
  donePct: number;
  isToday?: boolean;
  /** Écart signalé par engine/ : point warn, expliqué par la légende et l'aria-label. */
  flagged?: boolean;
};

type WeekChartProps = {
  days: WeekChartDay[];
  /** Lecture complète des valeurs pour les lecteurs d'écran (DESIGN.md §6). */
  ariaLabel: string;
};

/** Prévu vs réalisé de la semaine : 7 barres, contour plan, plein done (DESIGN.md §4). */
export function WeekChart({ days, ariaLabel }: WeekChartProps) {
  return (
    <figure className="flex flex-col gap-4">
      <div role="img" aria-label={ariaLabel} className="grid h-32 grid-cols-7 items-end gap-2">
        {days.map((day, i) => (
          <div key={`${day.label}-${i}`} className="flex h-full flex-col items-center justify-end gap-2" aria-hidden="true">
            <span className={`size-1 rounded-pill ${day.flagged ? "bg-warn" : "bg-transparent"}`} />
            <div className="relative w-full flex-1">
              <div
                className="absolute inset-x-0 bottom-0 overflow-hidden rounded-sm border-(length:--border-hairline) border-plan"
                style={{ height: `${day.plannedPct}%` }}
              />
              <div className="absolute inset-x-0 bottom-0 rounded-sm bg-done" style={{ height: `${day.donePct}%` }} />
            </div>
            <span className={`text-caption ${day.isToday ? "text-accent" : "text-text-muted"}`}>{day.label}</span>
          </div>
        ))}
      </div>
      <figcaption className="flex flex-wrap gap-4 text-caption text-text-muted">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm border-(length:--border-hairline) border-plan" aria-hidden="true" />
          Prévu
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-done" aria-hidden="true" />
          Réalisé
        </span>
        <span className="flex items-center gap-2">
          <span className="size-1 rounded-pill bg-warn" aria-hidden="true" />
          Écart signalé
        </span>
      </figcaption>
    </figure>
  );
}
