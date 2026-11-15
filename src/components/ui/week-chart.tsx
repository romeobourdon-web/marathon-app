import { Stat, type StatProps } from "./stat";

export type DayStatus = "done" | "skipped" | "planned" | "rest";

export type WeekChartDay = {
  /** Initiale du jour (« L », « M »…). */
  label: string;
  /** v1 : hauteurs en % de l'échelle (0–100), calculées hors UI. Servent à déduire le statut s'il n'est pas donné. */
  plannedPct: number;
  donePct: number;
  isToday?: boolean;
  /** Écart signalé par engine/ (v1) : affiché comme une séance non réalisée. */
  flagged?: boolean;
  /** Statut du jour (v2.1), décidé par planner/. */
  status?: DayStatus;
  /** Lecture du jour pour les lecteurs d'écran (« mar. 10 nov. : VMA courte, faite »). */
  ariaLabel?: string;
};

type WeekChartProps = {
  days: WeekChartDay[];
  /** Lecture complète de la semaine (DESIGN.md §7). */
  ariaLabel: string;
  /** Réalisé et prévu de la semaine, déjà formatés (« 23,6 » et « 44 »). */
  done?: string;
  planned?: string;
  unit?: string;
  /** Barre : réalisé et repère « prévu à date », en % déjà calculés par engine/ ; libellé formaté. */
  progress?: { donePct: number; toDatePct: number; toDateLabel: string };
  /** Les 2 mesures (séances faites, restantes). */
  stats?: StatProps[];
  /** Note de bas de carte (ex. « + 1 activité hors plan (vélo, 25 km), non comptée. »). */
  note?: string;
};

const DOT: Record<DayStatus, { className: string; mark: string; word: string }> = {
  done: { className: "bg-done text-on-accent", mark: "✓", word: "faite" },
  skipped: { className: "bg-warn-soft text-warn", mark: "✕", word: "non réalisée" },
  planned: { className: "border-(length:--border-plan) border-dashed border-plan-edge text-text-muted", mark: "•", word: "prévue" },
  rest: { className: "bg-surface-raised text-text-subtle", mark: "", word: "repos" },
};

function statusOf(d: WeekChartDay): DayStatus {
  if (d.status) return d.status;
  if (d.flagged) return "skipped";
  if (d.donePct > 0) return "done";
  return d.plannedPct > 0 ? "planned" : "rest";
}

/**
 * « Cette semaine » (DESIGN.md §5) : réalisé / prévu en grand, barre avec repère « prévu à date »,
 * 2 mesures, 7 pastilles jour (faite, non réalisée, prévue, repos ; aujourd'hui = anneau accent).
 * Le statut de la semaine se met en Chip dans l'en-tête de la Card.
 */
export function WeekChart({ days, ariaLabel, done, planned, unit = "km", progress, stats = [], note }: WeekChartProps) {
  return (
    <figure className="flex flex-col" aria-label={ariaLabel}>
      {done !== undefined && (
        <p className="flex items-end gap-2">
          <span className="font-display text-num-xl text-text tabular-nums">{done}</span>
          {planned !== undefined && (
            <span className="pb-1 font-display text-title-sm text-text-subtle tabular-nums">
              / {planned} {unit}
            </span>
          )}
        </p>
      )}

      {progress && (
        <>
          <div className="relative mt-4 h-3 rounded-pill bg-track" role="img" aria-label={`${done ?? ""} ${unit} réalisés sur ${planned ?? ""} ; ${progress.toDateLabel}`}>
            <div className="h-full rounded-pill bg-done" style={{ width: `${progress.donePct}%` }} />
            <div className="absolute -top-1 -bottom-1 w-0.5 rounded-sm bg-text" style={{ left: `${progress.toDatePct}%` }} />
          </div>
          <p className="mt-2 text-body-sm text-text-muted">{progress.toDateLabel}</p>
        </>
      )}

      {stats.length > 0 && (
        <dl className="mt-4.5 grid grid-cols-2 gap-4 border-t-(length:--border-hairline) border-line pt-4.5">
          {stats.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </dl>
      )}

      <ol className="mt-4.5 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const status = statusOf(d);
          const dot = DOT[status];
          return (
            <li key={`${d.label}-${i}`} className="flex flex-col items-center gap-1" aria-label={d.ariaLabel ?? `${d.label} : ${dot.word}${d.isToday ? ", aujourd'hui" : ""}`}>
              <span className={`text-nav font-bold ${d.isToday ? "text-accent-ink" : "text-text-subtle"}`} aria-hidden="true">
                {d.label}
              </span>
              <span
                aria-hidden="true"
                className={`grid size-(--day-dot) place-items-center rounded-pill text-body-sm font-bold ${dot.className} ${
                  d.isToday ? "ring-(length:--border-focus) ring-accent ring-offset-2 ring-offset-surface" : ""
                }`}
              >
                {dot.mark}
              </span>
            </li>
          );
        })}
      </ol>

      {note && <figcaption className="mt-3.5 text-caption text-text-muted">{note}</figcaption>}
    </figure>
  );
}
