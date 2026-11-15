export type TimelinePhase = {
  name: string;
  /** Nombre de semaines : largeur proportionnelle du segment (8 / 10 / 9 / 3). */
  weeks: number;
  state: "done" | "current" | "future";
  /** Phase courante : part déjà écoulée, en % déjà calculé par planner/. */
  progressPct?: number;
};

export type TimelineEvent = {
  label: string;
  /** Position sur la frise, en % de la durée totale du plan, calculée par planner/. */
  pct: number;
  kind: "target" | "event" | "today";
};

type PhaseTimelineProps = {
  phases: TimelinePhase[];
  /** Échéances (variante PC, Échéances) : repères verticaux ; course cible en accent-ink, aujourd'hui en accent. */
  events?: TimelineEvent[];
  ariaLabel: string;
};

const SEGMENT: Record<TimelinePhase["state"], string> = {
  done: "bg-text",
  current: "bg-surface-raised",
  future: "bg-surface-raised",
};

const PIN: Record<TimelineEvent["kind"], string> = {
  target: "w-0.75 bg-accent-ink",
  event: "w-0.5 bg-text",
  today: "w-0.5 bg-accent",
};

/**
 * Frise des 4 phases du plan (DESIGN.md §5, v2.1) : segments proportionnels, passé = text,
 * phase courante remplie en accent, futur = surface-raised. Noms dessous (courante en accent-ink).
 */
export function PhaseTimeline({ phases, events = [], ariaLabel }: PhaseTimelineProps) {
  const columns = { gridTemplateColumns: phases.map((p) => `${p.weeks}fr`).join(" ") };
  return (
    <figure aria-label={ariaLabel}>
      <div className="relative">
        <ol className="grid gap-1" style={columns}>
          {phases.map((p) => (
            <li key={p.name} className={`relative h-2.5 overflow-hidden rounded-pill ${SEGMENT[p.state]}`} aria-label={`${p.name} : ${p.state === "done" ? "terminée" : p.state === "current" ? "en cours" : "à venir"}`}>
              {p.state === "current" && <span className="absolute inset-y-0 left-0 rounded-pill bg-accent" style={{ width: `${p.progressPct ?? 0}%` }} />}
            </li>
          ))}
        </ol>
        {events.map((e) => (
          <span
            key={`${e.kind}-${e.label}`}
            aria-hidden="true"
            className={`absolute -top-1.5 h-5.5 -translate-x-1/2 rounded-pill ${PIN[e.kind]}`}
            style={{ left: `${e.pct}%` }}
          />
        ))}
      </div>
      <div className="mt-2 grid gap-1" style={columns} aria-hidden="true">
        {phases.map((p) => (
          <span key={p.name} className={`truncate text-caption ${p.state === "current" ? "font-bold text-accent-ink" : "text-text-subtle"}`}>
            {p.name}
          </span>
        ))}
      </div>
      {events.length > 0 && (
        <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-text-muted">
          {events.map((e) => (
            <span key={`${e.kind}-${e.label}-l`} className="flex items-center gap-1.5">
              <span className={`h-3 rounded-pill ${PIN[e.kind]}`} aria-hidden="true" />
              {e.label}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
