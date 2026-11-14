export type TrendPoint = {
  /** Coordonnées dans le repère du graphique (0–100, y = 0 en haut), calculées hors UI. */
  x: number;
  y: number;
};

type TrendChartProps = {
  points: TrendPoint[];
  /** Position verticale de la cible (0–100, 0 en haut). */
  targetY: number;
  targetLabel: string;
  /** Dernière valeur, déjà formatée, affichée près du dernier point. */
  lastLabel: string;
  /** Lecture complète des valeurs (DESIGN.md §6). */
  ariaLabel: string;
};

/** Valeur dans le temps vs cible : ligne text 1,6 px, cible en pointillés, dernier point marqué, pas de grille. */
export function TrendChart({ points, targetY, targetLabel, lastLabel, ariaLabel }: TrendChartProps) {
  const last = points.at(-1);
  return (
    <figure className="flex flex-col gap-3">
      <div role="img" aria-label={ariaLabel} className="relative h-32">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          <line
            x1="0"
            x2="100"
            y1={targetY}
            y2={targetY}
            className="stroke-text-muted stroke-(length:--border-hairline)"
            style={{ strokeDasharray: "var(--space-1) var(--space-1)" }}
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            className="stroke-text stroke-(length:--stroke-chart)"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {last && (
          <span
            className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-text"
            style={{ left: `${last.x}%`, top: `${last.y}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      <figcaption className="flex justify-between gap-4 text-caption text-text-muted" aria-hidden="true">
        <span>{targetLabel}</span>
        <span className="font-mono text-num-sm text-text">{lastLabel}</span>
      </figcaption>
    </figure>
  );
}
