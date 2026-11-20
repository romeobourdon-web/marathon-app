import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { PhaseTimeline } from "@/components/ui/phase-timeline";
import { getEvents, getPlanStart } from "@/db/repository";
import { todayInParis } from "@/lib/dates";
import { formatClock, formatDate, formatDistance, formatPacePerKm } from "@/lib/format";
import { phaseProgress, planPositionPct, currentWeek } from "@/planner/calendar";
import { eventsView, type EventView } from "@/planner/events";
import { PHASES, TOTAL_WEEKS } from "@/planner/plan";

/** Contenu de /echeances ; aussi affiché derrière le panneau d'ajout sur PC. */
export async function EventsView() {
  const today = todayInParis();
  const [planStart, events] = await Promise.all([getPlanStart(), getEvents()]);
  const { upcoming, past } = eventsView(events, planStart, today);
  const week = currentWeek(planStart, today);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div>
          <h1 className="font-display text-title-lg text-text">Échéances</h1>
          <p className="text-body text-text-muted">Les courses et les tests jusqu&apos;au jour J.</p>
        </div>
        <ButtonLink href="/echeances/ajout" variant="secondary" className="max-lg:hidden">
          Ajouter une échéance
        </ButtonLink>
      </header>

      <div className="max-lg:hidden">
        <Card label="Le plan et ses échéances">
          <PhaseTimeline
            phases={phaseProgress(week).map((p) => ({ name: p.name, weeks: p.weeks, state: p.state, progressPct: p.progressPct }))}
            events={[
              { label: "Aujourd'hui", pct: planPositionPct(planStart, today), kind: "today" as const },
              ...upcoming.map((e) => ({ label: e.name, pct: planPositionPct(planStart, e.date), kind: e.isTarget ? ("target" as const) : ("event" as const) })),
            ]}
            ariaLabel={`Plan en ${PHASES.length} phases, semaine ${week} sur ${TOTAL_WEEKS}, et ses échéances`}
          />
        </Card>
      </div>

      <ul className="grid gap-grid-gap lg:grid-cols-2">
        {upcoming.map((e) => (
          <li key={e.id}>
            <EventCard event={e} />
          </li>
        ))}
      </ul>

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="eyebrow">Passées</h2>
          <ul className="grid gap-grid-gap lg:grid-cols-2">
            {past.map((e) => (
              <li key={e.id}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <ButtonLink href="/echeances/ajout" variant="secondary" className="w-full lg:hidden">
        Ajouter une échéance
      </ButtonLink>
    </div>
  );
}

function EventCard({ event: e }: { event: EventView }) {
  const isPast = e.daysLeft < 0;
  return (
    <Card highlight={e.isTarget}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="flex flex-wrap gap-2">
            {e.isTarget ? <Chip tone="quality">Course cible</Chip> : <Chip>{e.kind === "test" ? "Test" : "Course"}</Chip>}
            {isPast && e.result && <Chip tone="good">Fait</Chip>}
          </p>
          <h3 className="mt-1 font-display text-title-sm text-text">{e.name}</h3>
          <p className="text-caption text-text-subtle">
            {formatDate(e.date, "long")} {e.date.slice(0, 4)}
            {e.week !== null && ` · semaine ${e.week}`} · {formatDistance(e.distanceKm * 1000, e.distanceKm % 1 === 0 ? 0 : 1)}
          </p>
        </div>
        {!isPast && <p className={`shrink-0 font-display text-num-md tabular-nums ${e.isTarget ? "text-accent-ink" : "text-text"}`}>J-{e.daysLeft}</p>}
      </div>
      <p className="mt-4 border-t-(length:--border-hairline) border-line pt-3 text-body-sm text-text-muted tabular-nums">
        {isPast
          ? e.result
            ? `Réalisé : ${formatClock(e.result.durationSec)} · ${formatPacePerKm(e.resultPace!)}`
            : "Pas d'activité liée."
          : e.targetTimeSec
            ? `Objectif : ${formatClock(e.targetTimeSec)} · ${formatPacePerKm(e.targetPace!)}`
            : "Pas d'objectif de temps."}
      </p>
    </Card>
  );
}
