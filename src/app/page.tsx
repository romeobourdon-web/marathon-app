import { Suspense } from "react";
import { connection } from "next/server";
import { AppNav } from "@/components/ui/app-nav";
import { Card } from "@/components/ui/card";
import { Chip, DemoChip } from "@/components/ui/chip";
import { SESSION_TYPE_TONE } from "@/components/ui/session-type";
import { ScoreCard } from "@/components/ui/score-card";
import { SessionCard } from "@/components/ui/session-card";
import { Stat } from "@/components/ui/stat";
import { StatusBand } from "@/components/ui/status-band";
import { TrendChart } from "@/components/ui/trend-chart";
import { WeekChart } from "@/components/ui/week-chart";
import { WEEK_STATUS_CHIP } from "@/components/ui/week-status";
import { getActivities, getFormDemo, getLatestCheckin, getPlanStart, getRace, getSessions, getWellness } from "@/db/repository";
import { barHeightsPct, niceScaleMax } from "@/engine/chart";
import { easyRunFocus } from "@/engine/endurance";
import { cappedPct, planProgressPct } from "@/engine/progress";
import { latestWellness } from "@/engine/wellness";
import { addDays, splitWeeksDays, todayInParis } from "@/lib/dates";
import {
  formatClock,
  formatDate,
  formatDayInitial,
  formatDistance,
  formatDistanceParts,
  formatDurationApprox,
  formatOffPlanNote,
  formatPaceRangeValue,
  formatPaceValue,
  formatRelativeDay,
  formatSignedDelta,
  formatWeeksDays,
} from "@/lib/format";
import { currentWeek, daysToRace } from "@/planner/calendar";
import { TOTAL_WEEKS, TYPE_LABELS } from "@/planner/plan";
import { volumeTrend, weekSummary } from "@/planner/summary";
import { dayFocus, offPlanActivities, weekDays } from "@/planner/today";

const NBSP = " ";
/** Pas de la grille du graphique de volume (km). */
const VOLUME_GRID_STEP_KM = 20;



const DAY_WORD = { done: "faite", skipped: "non réalisée", planned: "prévue", rest: "repos" } as const;

export default function TodayPage() {
  return (
    <Suspense fallback={<TodaySkeleton />}>
      <Today />
    </Suspense>
  );
}

// Dépend de la date du jour : recalculé à chaque visite (connection()).
async function Today() {
  await connection();
  const today = todayInParis();
  const [race, planStart, sessions, activities, wellness, checkin] = await Promise.all([
    getRace(),
    getPlanStart(),
    getSessions(today),
    getActivities(),
    getWellness(addDays(today, -2), today),
    getLatestCheckin(today),
  ]);

  // Bandeau
  const week = currentWeek(planStart, today);
  const days = daysToRace(today, race.date);
  const left = splitWeeksDays(days);
  const progress = planProgressPct(week, TOTAL_WEEKS);
  const summary = weekSummary(sessions, activities, planStart, week, today);

  // Séance du jour (règle « jour de repos » → prochaine séance)
  const focus = dayFocus(sessions, today);

  // Forme : score démo (D16), mesures réelles
  const form = getFormDemo();
  const w = latestWellness(wellness, today);
  const freshCheckin = checkin && checkin.date >= addDays(today, -2) ? checkin : null;

  // Cette semaine
  const days7 = weekDays(summary.start, summary.sessions, today);
  const offPlan = offPlanActivities(activities, planStart, summary.start, addDays(summary.start, 6));
  const weekStatus = WEEK_STATUS_CHIP[summary.status];

  // Focus endurance
  const easy = easyRunFocus(sessions, today);

  // Tendance du volume : tout le plan sur PC, 8 semaines sur téléphone
  const trend = volumeTrend(sessions, activities, planStart, today, TOTAL_WEEKS, TOTAL_WEEKS);
  const scaleKm = niceScaleMax(
    trend.flatMap((p) => [p.plannedKm, p.doneKm ?? 0]),
    VOLUME_GRID_STEP_KM,
  );
  const plannedPct = barHeightsPct(
    trend.map((p) => p.plannedKm),
    scaleKm,
  );
  const donePct = barHeightsPct(
    trend.map((p) => p.doneKm ?? 0),
    scaleKm,
  );
  const km = (v: number, digits = 1) => formatDistance(v * 1000, digits);

  return (
    <>
      <AppNav current="/" aside={formatDate(today)} />
      <main className="mx-auto w-full max-w-content px-page-x pt-6 pb-28 lg:pt-8 lg:pb-12">
        <h1 className="sr-only">Aujourd&apos;hui</h1>
        <div className="grid gap-grid-gap lg:grid-cols-6 [&>*]:min-w-0 lg:[&>div>section]:h-full">
          <div className="lg:col-span-6">
            <StatusBand
              date={formatDate(today)}
              week={`${week}/${TOTAL_WEEKS}`}
              countdown={`J-${days}`}
              race={`${race.name} · ${formatDate(race.date, "full")}`}
              remaining={`soit ${formatWeeksDays(left.weeks, left.days)}`}
              tiles={[
                { label: "Objectif", value: formatClock(race.targetTimeSec) },
                { label: "Allure cible", value: formatPaceValue(race.targetPace), unit: "/km" },
              ]}
              progress={{ phase: summary.phase.name, pct: progress, pctLabel: `${progress}${NBSP}%` }}
            />
          </div>

          <div className="lg:col-span-2">
            {focus.kind === "none" ? (
              <SessionCard variant="rest" label="Séance du jour" title="Plan terminé" note="Plus aucune séance prévue." />
            ) : (
              <SessionCard
                variant="planned"
                label={focus.kind === "today" ? "Séance du jour" : "Prochaine séance"}
                when={focus.kind === "next" ? formatRelativeDay(focus.session.date, today) : undefined}
                title={focus.session.title}
                type={{ label: TYPE_LABELS[focus.session.type], tone: SESSION_TYPE_TONE[focus.session.type] }}
                details={focus.session.details}
                instructions={[]}
                distance={formatDistanceParts(focus.session.distanceKm * 1000, 0)}
                pace={formatPaceRangeValue(focus.session.targetPace)}
                hr={`${focus.session.targetHr.min}–${focus.session.targetHr.max}`}
                footer={
                  focus.kind === "next" ? (
                    <Chip>Aujourd&apos;hui : repos</Chip>
                  ) : focus.session.status === "done" ? (
                    <Chip tone="good" glyph="✓">
                      Faite
                    </Chip>
                  ) : undefined
                }
                detailHref="/plan"
                detailLabel="Voir la semaine"
              />
            )}
          </div>

          <div className="lg:col-span-2">
            <ScoreCard
              label="Forme"
              score={form.score}
              status={form.status}
              verdict={form.verdict}
              badge={<DemoChip />}
              stats={[
                { label: "VFC", unit: "ms", value: w.hrvMs === null ? "—" : String(Math.round(w.hrvMs)) },
                { label: "FC repos", value: w.restingHr === null ? "—" : String(w.restingHr) },
                { label: "sommeil", value: w.sleepS === null ? "—" : formatDurationApprox(w.sleepS) },
                { label: "douleur", value: freshCheckin?.pain ? `${freshCheckin.pain}/5` : "—" },
              ]}
              questionnaire={{
                href: "/journal/matin",
                label: checkin?.date === today ? "Modifier le questionnaire du matin" : "Questionnaire du matin · 30 s",
              }}
            />
          </div>

          <div className="lg:col-span-2">
            <Card
              label="Cette semaine"
              badge={
                <Chip tone={weekStatus.tone}>
                  {weekStatus.word}
                </Chip>
              }
            >
              <WeekChart
                ariaLabel={`Semaine ${week} : ${km(summary.doneKm)} réalisés sur ${km(summary.plannedKm, 0)} prévus`}
                done={formatDistanceParts(summary.doneKm * 1000).value}
                planned={formatDistanceParts(summary.plannedKm * 1000, 0).value}
                progress={{
                  donePct: summary.plannedKm > 0 ? cappedPct(summary.doneKm, summary.plannedKm) : 0,
                  toDatePct: summary.plannedKm > 0 ? cappedPct(summary.plannedToDateKm, summary.plannedKm) : 0,
                  toDateLabel: `Prévu à date : ${km(summary.plannedToDateKm, 0)}`,
                }}
                stats={[
                  { label: summary.doneCount > 1 ? "séances faites" : "séance faite", value: String(summary.doneCount) },
                  { label: summary.remainingCount > 1 ? "séances restantes" : "séance restante", value: String(summary.remainingCount) },
                ]}
                days={days7.map((d) => ({
                  label: formatDayInitial(d.date),
                  plannedPct: 0,
                  donePct: 0,
                  status: d.status,
                  isToday: d.isToday,
                  ariaLabel: `${formatDate(d.date)} : ${d.session ? `${d.session.title}, ${DAY_WORD[d.status]}` : "repos"}${d.isToday ? ", aujourd'hui" : ""}`,
                }))}
                note={formatOffPlanNote(offPlan)}
              />
            </Card>
          </div>

          <div className="lg:order-last lg:col-span-2">
            <Card label="Focus endurance">
              <p className="text-body-sm text-text-muted">Footings des 14 derniers jours</p>
              {easy.count === 0 ? (
                <p className="mt-2.5 text-body text-text-muted">Aucun footing réalisé sur la période.</p>
              ) : (
                <>
                  <dl className="mt-2.5">
                    <Stat
                      label={easy.tooFast ? "plus vite que la zone EF" : "dans la zone EF ou plus lent"}
                      value={formatSignedDelta(easy.paceGap)}
                      unit="s/km"
                      verdict={easy.tooFast ? { word: "Trop vite", tone: "warn" } : { word: "Bien", tone: "good" }}
                    />
                  </dl>
                  <p className="mt-3.5 rounded-md bg-surface-raised p-3.5 text-body-sm text-text-muted">
                    <span className="font-display text-text tabular-nums">
                      {easy.hrOverCount}/{easy.count}
                    </span>{" "}
                    footing{easy.count > 1 ? "s" : ""} avec une FC moyenne au-dessus de {easy.hrZoneMax}
                    {NBSP}bpm.
                    {easy.tooFast && " Ralentis : l'endurance se construit à allure facile."}
                  </p>
                </>
              )}
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card label="Tendance du volume" badge={<span className="text-caption text-text-subtle">km / semaine</span>}>
              <TrendChart
                variant="bars"
                ariaLabel="Volume hebdomadaire, prévu et réalisé"
                grid={[
                  { pct: 100, label: km(scaleKm, 0) },
                  { pct: 50, label: km(scaleKm / 2, 0) },
                ]}
                bars={trend.map((p, i) => ({
                  label: `S${p.week}`,
                  plannedPct: plannedPct[i],
                  donePct: p.doneKm === null ? null : donePct[i],
                  isCurrent: p.isCurrent,
                  hiddenOnPhone: !p.inPhoneWindow,
                  ariaLabel:
                    p.doneKm === null
                      ? `Semaine ${p.week} : ${km(p.plannedKm, 0)} prévus, à venir`
                      : `Semaine ${p.week} : ${km(p.doneKm)} réalisés sur ${km(p.plannedKm, 0)} prévus`,
                  tooltip: {
                    title: `Semaine ${p.week}`,
                    lines: p.doneKm === null ? [`Prévu : ${km(p.plannedKm, 0)}`] : [`Réalisé : ${km(p.doneKm)}`, `Prévu : ${km(p.plannedKm, 0)}`],
                  },
                }))}
              />
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

function TodaySkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-content animate-pulse gap-grid-gap px-page-x pt-20 lg:grid-cols-6">
      <div className="h-72 rounded-lg bg-accent-soft lg:col-span-6" />
      <div className="h-96 rounded-lg bg-surface-raised lg:col-span-2" />
      <div className="h-96 rounded-lg bg-surface-raised lg:col-span-2" />
      <div className="h-96 rounded-lg bg-surface-raised lg:col-span-2" />
    </div>
  );
}
