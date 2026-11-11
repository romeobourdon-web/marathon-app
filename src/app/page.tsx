import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { getPlanStart, getRace, getSessions } from "@/db/repository";
import { currentWeek, daysToRace } from "@/planner/calendar";
import { TOTAL_WEEKS } from "@/planner/plan";
import { nextSession } from "@/planner/sessions";
import { volumeTrend, weekSummary, type WeekSummary } from "@/planner/summary";
import type { Session } from "@/planner/types";
import { todayInParis, addDays } from "@/lib/dates";
import { formatDayLong, formatDayShort, formatDuration, formatKm, formatPace, formatPaceRange } from "@/lib/format";
import { Card, CardTitle, Stat, TypeBadge, WeekStatusPill } from "@/components/ui";
import { VolumeChart } from "@/components/volume-chart";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

// Composant « dynamique » : il dépend de la date du jour, donc il est
// recalculé à chaque visite (connection() le signale à Next.js).
async function Dashboard() {
  await connection();
  const today = todayInParis();
  const planStart = getPlanStart();
  const sessions = getSessions(today);
  const week = currentWeek(planStart, today);
  const summary = weekSummary(sessions, planStart, week, today);
  const next = nextSession(sessions);
  const trend = volumeTrend(sessions, planStart, today);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5">
      <Countdown today={today} week={week} summary={summary} className="md:col-span-6" />
      <ThisWeek summary={summary} today={today} className="md:col-span-3" />
      <NextSession session={next} today={today} className="md:col-span-3" />
      <Card className="md:col-span-4">
        <CardTitle aside={<span className="text-xs text-ink-3">km / semaine</span>}>Tendance du volume</CardTitle>
        <VolumeChart points={trend} />
      </Card>
      <EnduranceInsight sessions={sessions} today={today} className="md:col-span-2" />
    </div>
  );
}

function Countdown({ today, week, summary, className }: { today: string; week: number; summary: WeekSummary; className?: string }) {
  const RACE = getRace();
  const days = daysToRace(today, RACE.date);
  const progress = Math.round((week / TOTAL_WEEKS) * 100);

  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f2552c] to-[#c2410c] p-6 text-white shadow-[0_12px_32px_-12px_rgba(194,65,12,0.55)] sm:p-8 ${className}`}
    >
      {/* Courbe décorative : un profil de course stylisé */}
      <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full opacity-[0.12]" aria-hidden>
        <path d="M0 160 C 80 120, 120 170, 200 130 S 330 60, 400 100 S 520 40, 600 70 L600 200 L0 200 Z" fill="white" />
        <path d="M0 180 C 100 150, 160 190, 260 160 S 420 110, 600 130" fill="none" stroke="white" strokeWidth="3" />
      </svg>

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-semibold">{RACE.name} · {formatDayLong(RACE.date)} 2027</p>
          <div className="mt-1 font-display text-[5.5rem] leading-[0.9] font-bold tracking-tight tabular sm:text-[8rem]">
            J-{days}
          </div>
          <p className="mt-2 font-semibold">soit {Math.floor(days / 7)} semaines et {days % 7} jours</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:w-[24rem]">
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
            <div className="text-sm font-semibold">Objectif</div>
            <div className="font-display text-4xl font-bold tabular">{formatDuration(RACE.targetTimeSec)}</div>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
            <div className="text-sm font-semibold">Allure cible</div>
            <div className="font-display text-4xl font-bold tabular">
              {formatPace(RACE.targetPace)}
              <span className="ml-1 text-lg">/km</span>
            </div>
          </div>
          <div className="col-span-2">
            <div className="mb-1.5 flex justify-between text-sm font-semibold">
              <span>Semaine {week}/{TOTAL_WEEKS} · {summary.phase.name}</span>
              <span className="tabular">{progress} %</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThisWeek({ summary, today, className }: { summary: WeekSummary; today: string; className?: string }) {
  const pct = Math.min(100, (summary.doneKm / summary.plannedKm) * 100);
  const toDatePct = Math.min(100, (summary.plannedToDateKm / summary.plannedKm) * 100);

  return (
    <Card className={className}>
      <CardTitle aside={<WeekStatusPill status={summary.status} />}>Cette semaine</CardTitle>

      <div className="flex items-end gap-2">
        <span className="font-display text-6xl leading-none font-bold tabular">{formatKm(summary.doneKm)}</span>
        <span className="pb-1 font-display text-2xl font-semibold text-ink-3 tabular">/ {formatKm(summary.plannedKm)} km</span>
      </div>

      {/* Barre : réalisé (corail) + repère « prévu à date » */}
      <div className="relative mt-4 h-3 rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        {summary.plannedToDateKm > 0 && (
          <div className="absolute -top-1 -bottom-1 w-0.5 rounded bg-ink" style={{ left: `${toDatePct}%` }} title="Prévu à date" />
        )}
      </div>
      <p className="mt-2 text-sm text-ink-2">
        Prévu à date : <span className="font-semibold text-ink tabular">{formatKm(summary.plannedToDateKm)} km</span>
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5">
        <Stat label="séances faites" value={summary.doneCount} />
        <Stat label="séances restantes" value={summary.remainingCount} />
      </div>

      {/* Les jours de la semaine */}
      <ol className="mt-5 grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }, (_, d) => {
          const date = addDays(summary.start, d);
          const s = summary.sessions.find((x) => x.date === date);
          return <DayDot key={date} date={date} session={s} isToday={date === today} />;
        })}
      </ol>
    </Card>
  );
}

function DayDot({ date, session, isToday }: { date: string; session?: Session; isToday: boolean }) {
  const letter = formatDayShort(date).slice(0, 1).toUpperCase();
  let style = "bg-surface-2 text-ink-3";
  let mark = "";
  let label = "repos";
  if (session?.status === "done") [style, mark, label] = ["bg-accent text-white", "✓", "faite"];
  else if (session?.status === "skipped") [style, mark, label] = ["bg-warn-soft text-warn", "✕", "manquée"];
  else if (session) [style, mark, label] = ["border-2 border-dashed border-planned-edge text-ink-2", "•", "prévue"];

  return (
    <li className="flex flex-col items-center gap-1" aria-label={`${formatDayLong(date)} : ${session ? `${session.title}, ${label}` : "repos"}`}>
      <span className={`text-[11px] font-bold ${isToday ? "text-accent-ink" : "text-ink-3"}`}>{letter}</span>
      <span className={`grid size-9 place-items-center rounded-full text-sm font-bold ${style} ${isToday ? "ring-2 ring-accent ring-offset-2" : ""}`}>
        {mark}
      </span>
    </li>
  );
}

function NextSession({ session, today, className }: { session?: Session; today: string; className?: string }) {
  if (!session) {
    return (
      <Card className={className}>
        <CardTitle>Séance du jour</CardTitle>
        <p className="text-ink-2">Plan terminé. Bravo !</p>
      </Card>
    );
  }
  const isToday = session.date === today;

  return (
    <Card className={className}>
      <CardTitle aside={<TypeBadge type={session.type} />}>{isToday ? "Séance du jour" : "Prochaine séance"}</CardTitle>
      {!isToday && <p className="-mt-2 mb-3 text-sm font-semibold text-accent-ink capitalize">{formatDayLong(session.date)}</p>}

      <h3 className="font-display text-3xl font-bold tracking-tight">{session.title}</h3>
      <p className="mt-2 text-ink-2">{session.details}</p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-surface-2 p-3.5">
          <div className="font-display text-3xl leading-none font-bold tabular">
            {formatKm(session.distanceKm)}
            <span className="ml-0.5 text-base text-ink-3">km</span>
          </div>
          <div className="mt-1.5 text-xs text-ink-2">distance</div>
        </div>
        <div className="rounded-2xl bg-accent-soft p-3.5">
          <div className="font-display text-xl leading-none font-bold whitespace-nowrap text-accent-ink tabular sm:text-3xl">{formatPaceRange(session.targetPace)}</div>
          <div className="mt-1.5 text-xs text-ink-2">allure /km</div>
        </div>
        <div className="rounded-2xl bg-surface-2 p-3.5">
          <div className="font-display text-xl leading-none font-bold whitespace-nowrap tabular sm:text-3xl">
            {session.targetHr.min}–{session.targetHr.max}
          </div>
          <div className="mt-1.5 text-xs text-ink-2">FC (bpm)</div>
        </div>
      </div>

      <Link href="/plan" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-accent-ink hover:underline">
        Voir le plan de la semaine →
      </Link>
    </Card>
  );
}

// Point de travail de Roméo : ne pas courir l'endurance trop vite.
function EnduranceInsight({ sessions, today, className }: { sessions: Session[]; today: string; className?: string }) {
  const since = addDays(today, -14);
  const easy = sessions.filter((s) => s.status === "done" && (s.type === "ef" || s.type === "recup") && s.date >= since);
  const gap = easy.length
    ? Math.round(easy.reduce((acc, s) => acc + (s.actual!.avgPace - s.targetPace.min), 0) / easy.length)
    : 0;
  const hrOver = easy.filter((s) => s.actual!.avgHr > s.targetHr.max).length;
  const tooFast = gap < 0;

  return (
    <Card className={className}>
      <CardTitle>Focus endurance</CardTitle>
      <p className="text-sm text-ink-2">Footings des 14 derniers jours</p>
      <div className={`mt-3 font-display text-5xl leading-none font-bold tabular ${tooFast ? "text-accent-ink" : "text-good"}`}>
        {tooFast ? "−" : "+"}
        {Math.abs(gap)}
        <span className="ml-1 text-xl">s/km</span>
      </div>
      <p className="mt-2 text-sm font-semibold">
        {tooFast ? "plus vite que la zone EF" : "dans la zone EF"}
      </p>
      <div className="mt-4 rounded-2xl bg-surface-2 p-3.5 text-sm text-ink-2">
        <span className="font-bold text-ink tabular">{hrOver}/{easy.length}</span> footings avec une FC moyenne au-dessus de{" "}
        {easy[0]?.targetHr.max ?? 150} bpm.{" "}
        {tooFast && "Ralentis : l'endurance se construit à allure facile."}
      </div>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 md:grid-cols-6 md:gap-5">
      <div className="h-64 rounded-3xl bg-accent-soft md:col-span-6" />
      <div className="h-80 rounded-3xl bg-surface-2 md:col-span-3" />
      <div className="h-80 rounded-3xl bg-surface-2 md:col-span-3" />
    </div>
  );
}
