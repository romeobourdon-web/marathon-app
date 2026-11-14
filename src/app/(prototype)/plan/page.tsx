import { Suspense } from "react";
import { connection } from "next/server";
import { getPlanStart, getSessions } from "@/db/repository";
import { currentWeek } from "@/planner/calendar";
import { PHASES, TOTAL_WEEKS } from "@/planner/plan";
import { weekSummary } from "@/planner/summary";
import { addDays, todayInParis } from "@/lib/dates";
import { formatDayShort, formatKm, formatPaceRange } from "@/lib/format";
import { Card, PageHeader, TypeBadge } from "@/components/ui";

export default function PlanPage() {
  return (
    <>
      <PageHeader title="Plan" subtitle={`${TOTAL_WEEKS} semaines en 4 phases, jusqu'au jour J.`} />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}>
        <Plan />
      </Suspense>
    </>
  );
}

async function Plan() {
  await connection();
  const today = todayInParis();
  const planStart = getPlanStart();
  const sessions = getSessions(today);
  const cw = currentWeek(planStart, today);

  return (
    <div className="space-y-8">
      {PHASES.map((phase, i) => (
        <section key={phase.id}>
          <div className="mb-3 flex items-baseline gap-3">
            <span className="font-display text-5xl leading-none font-bold text-accent tabular">{i + 1}</span>
            <div>
              <h2 className="font-display text-2xl font-bold">{phase.name}</h2>
              <p className="text-sm text-ink-2">
                Semaines {phase.weeks.min} à {phase.weeks.max} · {phase.goal}
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {Array.from({ length: phase.weeks.max - phase.weeks.min + 1 }, (_, k) => {
              const w = weekSummary(sessions, planStart, phase.weeks.min + k, today);
              const isCurrent = w.week === cw;
              return (
                <Card key={w.week} className={isCurrent ? "ring-2 ring-accent" : ""}>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <span className="font-display text-xl font-bold">Semaine {w.week}</span>
                      {isCurrent && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">en cours</span>}
                      <div className="text-xs text-ink-3">
                        du {formatDayShort(w.start)} au {formatDayShort(addDays(w.start, 6))}
                      </div>
                    </div>
                    <div className="font-display text-2xl font-bold tabular">
                      {formatKm(w.plannedKm)}
                      <span className="ml-1 text-sm text-ink-3">km</span>
                    </div>
                  </div>
                  <ul className="divide-y divide-line">
                    {w.sessions.map((s) => (
                      <li key={s.id} className="flex items-center gap-3 py-2.5">
                        <span className="w-14 shrink-0 text-xs font-semibold text-ink-3 capitalize">{formatDayShort(s.date).split(" ")[0]}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{s.title}</span>
                            <TypeBadge type={s.type} />
                          </div>
                          <div className="text-xs text-ink-2 tabular">
                            {formatPaceRange(s.targetPace)} /km · FC {s.targetHr.min}–{s.targetHr.max}
                          </div>
                        </div>
                        <span className="font-display text-lg font-bold tabular">{formatKm(s.distanceKm)} km</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
