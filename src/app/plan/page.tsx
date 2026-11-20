import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AppNav } from "@/components/ui/app-nav";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PhaseTimeline } from "@/components/ui/phase-timeline";
import { getActivities, getPlanStart, getSessions } from "@/db/repository";
import { todayInParis } from "@/lib/dates";
import { formatDistanceParts } from "@/lib/format";
import { phaseProgress } from "@/planner/calendar";
import { PHASES, TOTAL_WEEKS } from "@/planner/plan";
import { planView, splitCurrentPhase, weeksTotal, type PlanPhase } from "@/planner/plan-view";
import { WeekCard, WeekRow } from "./weeks";

export default function PlanPage() {
  return (
    <>
      <AppNav current="/plan" />
      <main className="mx-auto w-full max-w-content px-page-x pt-6 pb-28 lg:pt-8 lg:pb-12">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-surface-raised" />}>
          <Plan />
        </Suspense>
      </main>
    </>
  );
}

async function Plan() {
  await connection();
  const today = todayInParis();
  const [planStart, sessions, activities] = await Promise.all([getPlanStart(), getSessions(today), getActivities()]);
  const view = planView(sessions, activities, planStart, today);
  const current = view.phases.flatMap((p) => p.weeks).find((w) => w.state === "current")!;
  const phases = phaseProgress(view.currentWeek);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div>
          <h1 className="font-display text-title-lg text-text">Plan</h1>
          <p className="text-body text-text-muted">{TOTAL_WEEKS} semaines en {PHASES.length} phases, jusqu&apos;au jour J.</p>
        </div>
        <ButtonLink href="#semaine-en-cours" variant="secondary" className="max-lg:hidden">
          Aller à aujourd&apos;hui
        </ButtonLink>
      </header>

      <Card>
        <PhaseTimeline
          phases={phases.map((p) => ({ name: p.name, weeks: p.weeks, state: p.state, progressPct: p.progressPct }))}
          ariaLabel={`Plan en ${PHASES.length} phases, semaine ${view.currentWeek} sur ${TOTAL_WEEKS}`}
        />
      </Card>

      {/* Téléphone : la semaine en cours d'abord, dépliée ; puis chaque phase, semaines repliées */}
      <div className="flex flex-col gap-6 lg:hidden">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="eyebrow">Semaine en cours</h2>
            <Link href="/" className="focus-ring -mx-2 inline-flex min-h-(--touch-min) items-center rounded-sm px-2 text-label text-accent-ink">
              Aujourd&apos;hui
            </Link>
          </div>
          <WeekCard week={current} />
        </section>
        {view.phases.map((p) => (
          <section key={p.phase.id} className="flex flex-col gap-3">
            <PhaseHeading phase={p} />
            <ul className="flex flex-col gap-2">
              {p.weeks
                .filter((w) => w.state !== "current")
                .map((w) => (
                  <li key={w.week}>
                    <WeekRow week={w} />
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>

      {/* PC : par phase, semaines dépliées en 2 colonnes ; phase en cours : 4 dernières semaines seulement */}
      <div className="flex flex-col gap-10 max-lg:hidden">
        {view.phases.map((p) => (
          <section key={p.phase.id} className="flex flex-col gap-4">
            <PhaseHeading phase={p} />
            <PhaseWeeksPc phase={p} />
          </section>
        ))}
      </div>
    </div>
  );
}

function PhaseHeading({ phase }: { phase: PlanPhase }) {
  return (
    <div className="flex items-start gap-3">
      <span className="font-display text-num-lg text-accent tabular-nums" aria-hidden="true">
        {phase.number}
      </span>
      <div>
        <h2 className="font-display text-title-sm text-text">{phase.phase.name}</h2>
        <p className="text-body-sm text-text-muted">
          Semaines {phase.phase.weeks.min} à {phase.phase.weeks.max} · {phase.phase.goal}
        </p>
      </div>
    </div>
  );
}

function PhaseWeeksPc({ phase }: { phase: PlanPhase }) {
  if (phase.state === "future") {
    return (
      <ul className="grid grid-cols-2 gap-3">
        {phase.weeks.map((w) => (
          <li key={w.week}>
            <WeekRow week={w} />
          </li>
        ))}
      </ul>
    );
  }
  const { older, recent, future } = phase.state === "current" ? splitCurrentPhase(phase.weeks) : { older: [], recent: phase.weeks, future: [] };
  const total = weeksTotal(older);
  const km = (v: number, digits = 1) => formatDistanceParts(v * 1000, digits).value;
  return (
    <div className="flex flex-col gap-grid-gap">
      {older.length > 0 && (
        <details className="group">
          <summary className="focus-ring inline-flex min-h-(--touch-min) cursor-pointer list-none items-center gap-2 rounded-md text-label text-accent-ink [&::-webkit-details-marker]:hidden">
            Semaines {older[0].week} à {older[older.length - 1].week} · {km(total.doneKm)} / {km(total.plannedKm, 0)} km ·{" "}
            <span className="group-open:hidden">afficher</span>
            <span className="hidden group-open:inline">masquer</span>
          </summary>
          <div className="mt-3 grid grid-cols-2 items-start gap-grid-gap">
            {older.map((w) => (
              <WeekCard key={w.week} week={w} />
            ))}
          </div>
        </details>
      )}
      <div className="grid grid-cols-2 items-start gap-grid-gap">
        {recent.map((w) => (
          <WeekCard key={w.week} week={w} id={w.state === "current" ? "semaine-en-cours" : undefined} />
        ))}
      </div>
      {future.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {future.map((w) => (
            <li key={w.week}>
              <WeekRow week={w} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
