export type TrendPoint = {
  /** Coordonnées dans le repère du graphique (0–100, y = 0 en haut), calculées hors UI (engine/chart). */
  x: number;
  y: number;
};

export type TrendBar = {
  /** Libellé d'axe (« S8 »). */
  label: string;
  /** Hauteurs en % de l'échelle (0–100), calculées par engine/chart. */
  plannedPct: number;
  /** null = semaine à venir (prévu en pointillés). */
  donePct: number | null;
  isCurrent?: boolean;
  /** Lecture de la barre (« Semaine 8 : 25,6 km réalisés sur 44 km prévus »), DESIGN.md §7. */
  ariaLabel: string;
  /** Info-bulle au survol / au focus (téléphone : au tap). */
  tooltip?: { title: string; lines: string[] };
  /** Masquée sur téléphone (fenêtre décidée par planner/) ; prioritaire sur `mobileLast`. */
  hiddenOnPhone?: boolean;
};

type LineProps = {
  variant?: "line";
  points: TrendPoint[];
  /** Position verticale de la cible ponctuelle (0–100, 0 en haut), en tirets accent-ink. */
  targetY: number;
  targetLabel: string;
  /** Dernière valeur, déjà formatée, affichée près du dernier point. */
  lastLabel: string;
  /** Zone visée (allure, FC) : bande surface-raised bordée de tirets (v2.1). Bornes en 0–100, 0 en haut. */
  zone?: { fromY: number; toY: number; label: string };
  ariaLabel: string;
};

type BarsProps = {
  variant: "bars";
  bars: TrendBar[];
  /** Repères de la grille (en % de l'échelle, libellé formaté), ex. 100 % = « 60 km ». */
  grid: { pct: number; label: string }[];
  /** Sur téléphone, seules les N dernières barres sont affichées (8) ; sur PC, toutes. */
  mobileLast?: number;
  ariaLabel: string;
};

type TrendChartProps = LineProps | BarsProps;

/**
 * Valeur dans le temps (DESIGN.md §5).
 * bars : volume hebdo, prévu = aplat plan + liseré, réalisé = barre corail plus étroite, futur = pointillés.
 * line : ligne text 2 px, cible en tirets accent-ink, zone visée optionnelle.
 */
export function TrendChart(props: TrendChartProps) {
  return props.variant === "bars" ? <Bars {...props} /> : <Line {...props} />;
}

function Bars({ bars, grid, mobileLast = 8, ariaLabel }: BarsProps) {
  // Plus de 16 barres (tout le plan sur PC) : un libellé d'axe sur deux, la semaine en cours toujours.
  const dense = bars.length > 16;
  const hiddenOnPhone = (i: number) => ((bars[i].hiddenOnPhone ?? i < bars.length - mobileLast) ? "max-lg:hidden" : "");
  return (
    <figure aria-label={ariaLabel}>
      <div className="relative h-40 lg:h-50">
        {grid.map((g) => (
          <div key={g.pct} className="absolute inset-x-0 border-t-(length:--border-hairline) border-dashed border-line" style={{ bottom: `${g.pct}%` }} aria-hidden="true">
            <span className="absolute -top-2.5 right-0 bg-surface pl-1 text-caption text-text-subtle">{g.label}</span>
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 border-t-(length:--border-hairline) border-plan-edge" aria-hidden="true" />
        <ol className={`absolute inset-y-0 right-10 left-0 flex items-end gap-2 ${dense ? "lg:gap-1.5" : "lg:gap-2.5"}`}>
          {bars.map((b, i) => (
            <li
              key={b.label}
              tabIndex={0}
              aria-label={b.ariaLabel}
              className={`group focus-ring relative flex h-full flex-1 items-end justify-center rounded-sm ${hiddenOnPhone(i)}`}
            >
              {b.donePct === null ? (
                <span
                  className="absolute bottom-0 w-full max-w-9 rounded-t-sm border-(length:--border-plan) border-b-0 border-dashed border-plan-edge"
                  style={{ height: `${b.plannedPct}%` }}
                />
              ) : (
                <>
                  <span
                    className="absolute bottom-0 w-full max-w-9 rounded-t-sm border-t-(length:--border-plan) border-plan-edge bg-plan"
                    style={{ height: `${b.plannedPct}%` }}
                  />
                  <span
                    className="animate-grow relative w-[62%] max-w-6 rounded-t-sm bg-done"
                    style={{ height: `${b.donePct}%`, ["--i" as string]: i }}
                  />
                </>
              )}
              {b.tooltip && (
                <span className="pointer-events-none absolute bottom-[calc(100%+var(--space-2))] left-1/2 z-10 hidden -translate-x-1/2 rounded-md bg-text px-3 py-2 text-caption whitespace-nowrap text-surface shadow-pop group-hover:block group-focus:block">
                  <span className="block font-bold">{b.tooltip.title}</span>
                  {b.tooltip.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className={`mt-2 mr-10 flex gap-2 ${dense ? "lg:gap-1.5" : "lg:gap-2.5"}`} aria-hidden="true">
        {bars.map((b, i) => (
          <span
            key={b.label}
            className={`min-w-0 flex-1 text-center text-caption tabular-nums ${b.isCurrent ? "font-bold text-text" : "text-text-subtle"} ${hiddenOnPhone(i)} ${
              dense && i % 2 === 1 && !b.isCurrent ? "lg:invisible" : ""
            }`}
          >
            {b.label}
          </span>
        ))}
      </div>
      <figcaption className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-caption text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-done" aria-hidden="true" />
          Réalisé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border-t-(length:--border-plan) border-plan-edge bg-plan" aria-hidden="true" />
          Prévu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border-(length:--border-plan) border-dashed border-plan-edge" aria-hidden="true" />
          À venir
        </span>
      </figcaption>
    </figure>
  );
}

function Line({ points, targetY, targetLabel, lastLabel, zone, ariaLabel }: LineProps) {
  const last = points.at(-1);
  return (
    <figure className="flex flex-col gap-3">
      <div role="img" aria-label={ariaLabel} className="relative h-32 lg:h-40">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          {zone && (
            <rect
              x="0"
              width="100"
              y={Math.min(zone.fromY, zone.toY)}
              height={Math.abs(zone.toY - zone.fromY)}
              className="fill-surface-raised stroke-plan-edge stroke-(length:--border-hairline)"
              style={{ strokeDasharray: "var(--space-1) var(--space-1)" }}
              vectorEffect="non-scaling-stroke"
            />
          )}
          <line
            x1="0"
            x2="100"
            y1={targetY}
            y2={targetY}
            className="stroke-accent-ink stroke-(length:--stroke-chart)"
            style={{ strokeDasharray: "var(--space-2) var(--space-1)" }}
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
            className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-text ring-2 ring-surface"
            style={{ left: `${last.x}%`, top: `${last.y}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      <figcaption className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-caption text-text-muted" aria-hidden="true">
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-(length:--stroke-chart) border-dashed border-accent-ink" />
          {targetLabel}
        </span>
        {zone && (
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border-(length:--border-hairline) border-dashed border-plan-edge bg-surface-raised" />
            {zone.label}
          </span>
        )}
        <span className="font-display text-num-sm text-text tabular-nums">{lastLabel}</span>
      </figcaption>
    </figure>
  );
}
