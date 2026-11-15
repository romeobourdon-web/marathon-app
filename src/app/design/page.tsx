import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { AppNav } from "@/components/ui/app-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip, DemoChip } from "@/components/ui/chip";
import { PhaseTimeline } from "@/components/ui/phase-timeline";
import { ScaleInput } from "@/components/ui/scale-input";
import { ScoreCard } from "@/components/ui/score-card";
import { SessionCard } from "@/components/ui/session-card";
import { Stat } from "@/components/ui/stat";
import { StatusBand } from "@/components/ui/status-band";
import { TextField } from "@/components/ui/text-field";
import { TrendChart } from "@/components/ui/trend-chart";
import { WeekChart } from "@/components/ui/week-chart";
import { getDesignPreview, getPlanStart, getRace } from "@/db/repository";
import { barHeightsPct, distanceGapM, lineGeometry } from "@/engine/chart";
import { paceGap } from "@/engine/pace";
import { cappedPct, planProgressPct } from "@/engine/progress";
import { addDays, splitWeeksDays, todayInParis } from "@/lib/dates";
import {
  formatClock,
  formatDate,
  formatDistance,
  formatDistanceParts,
  formatDurationApprox,
  formatPaceRangeValue,
  formatPaceValue,
  formatSignedDelta,
  formatWeeksDays,
} from "@/lib/format";
import { currentWeek, daysToRace, phaseProgress, planPositionPct } from "@/planner/calendar";
import { phaseForWeek, TOTAL_WEEKS } from "@/planner/plan";

export const metadata: Metadata = {
  title: "Design system — Target 42",
  description: "Aperçu des 13 composants du design system v2.1 « Corail » (DESIGN.md).",
};

const NBSP = " ";

function Section({ title, note, demo = false, children }: { title: string; note?: string; demo?: boolean; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-3 border-b-(length:--border-hairline) border-line pb-2">
        <div>
          <h2 className="font-display text-title-sm text-text">{title}</h2>
          {note && <p className="text-caption text-text-subtle">{note}</p>}
        </div>
        {demo && <DemoChip />}
      </header>
      {children}
    </section>
  );
}

function Variant({ name, children, className = "" }: { name: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <p className="eyebrow">{name}</p>
      {children}
    </div>
  );
}

export default function DesignPage() {
  return (
    <Suspense fallback={null}>
      <DesignContent />
    </Suspense>
  );
}

async function DesignContent() {
  await connection();
  const demo = getDesignPreview();
  const race = await getRace();
  const planStart = await getPlanStart();
  const today = todayInParis();

  // Bandeau : vraies valeurs (planner/, engine/), pas de démo.
  const week = currentWeek(planStart, today);
  const days = daysToRace(today, race.date);
  const left = splitWeeksDays(days);
  const progress = planProgressPct(week, TOTAL_WEEKS);

  // Séances
  const planned = demo.plannedSession;
  const done = demo.doneSession;
  const gapM = distanceGapM(done.plannedM, done.doneM);
  const paceDelta = paceGap(done.pace.actual, done.pace);

  // Semaine
  const w = demo.week;
  const weekDays = w.labels.map((label, i) => ({
    label,
    plannedPct: 0,
    donePct: 0,
    status: w.status[i],
    isToday: i === w.todayIndex,
  }));

  // Volume hebdo : hauteurs sur l'échelle de 60 km (engine/chart)
  const v = demo.volume;
  const plannedPct = barHeightsPct(v.plannedM, v.scaleM);
  const donePct = barHeightsPct(v.doneM.map((d) => d ?? 0), v.scaleM);
  const bars = v.plannedM.map((p, i) => {
    const d = v.doneM[i];
    const ariaLabel =
      d === null
        ? `Semaine ${i + 1} : ${formatDistance(p, 0)} prévus, à venir`
        : `Semaine ${i + 1} : ${formatDistance(d)} réalisés sur ${formatDistance(p, 0)} prévus`;
    return {
      label: `S${i + 1}`,
      plannedPct: plannedPct[i],
      donePct: d === null ? null : donePct[i],
      isCurrent: i === v.currentIndex,
      ariaLabel,
      tooltip: {
        title: `Semaine ${i + 1}`,
        lines: d === null ? [`Prévu : ${formatDistance(p, 0)}`] : [`Réalisé : ${formatDistance(d)}`, `Prévu : ${formatDistance(p, 0)}`],
      },
    };
  });

  // Allure des footings, axe inversé (plus rapide = plus haut), avec la zone EF visée
  const ep = demo.easyPace;
  const line = lineGeometry(ep.valuesS, [ep.targetS, ep.zone.min, ep.zone.max], { invert: true });

  // Frise des phases : vraie semaine du plan ; échéance « exemple » fictive
  const phases = phaseProgress(week);
  const events = [
    { label: "Aujourd'hui", pct: planPositionPct(planStart, today), kind: "today" as const },
    { label: demo.testEvent.label, pct: planPositionPct(planStart, demo.testEvent.date), kind: "event" as const },
    { label: race.name, pct: planPositionPct(planStart, race.date), kind: "target" as const },
  ];

  const f = demo.form;
  const ressenti = ["Épuisé", "Difficile", "Correct", "Bien", "Excellent"];

  return (
    <>
      <AppNav current="/" aside={formatDate(today)} />
      <main className="mx-auto flex w-full max-w-content flex-col gap-12 px-page-x pt-8 pb-28 lg:pb-12">
        <header className="flex flex-col gap-1">
          <p className="eyebrow">Target 42 · design system v2.1 « Corail »</p>
          <h1 className="font-display text-title-lg text-text">Composants</h1>
          <p className="text-body text-text-muted">
            Les 13 composants de DESIGN.md §5 et leurs variantes. Les valeurs marquées « démo » sont fictives (D16) ; le bandeau et la
            frise utilisent les vraies dates du plan.
          </p>
        </header>

        <Section title="Navigation (AppNav)" note="Téléphone : en-tête + barre d'onglets en bas. PC : pilules dans l'en-tête.">
          <p className="text-body-sm text-text-muted">
            Aperçu en haut (en-tête) et en bas (barre d&apos;onglets) de cette page. Les 5 destinations : Aujourd&apos;hui · Plan ·
            Séances · Journal · Échéances.
          </p>
        </Section>

        <Section title="StatusBand" note="Le bandeau corail, seulement sur Aujourd'hui.">
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
            progress={{ phase: phaseForWeek(week).name, pct: progress, pctLabel: `${progress}${NBSP}%` }}
          />
        </Section>

        <Section title="Card">
          <div className="grid gap-grid-gap lg:grid-cols-2">
            <Card label="En-tête de carte" badge={<Chip>badge</Chip>}>
              <p className="text-body text-text">Une carte = une question, un seul chiffre héros.</p>
            </Card>
            <Card label="Élément courant" highlight>
              <p className="text-body text-text">Anneau accent : semaine en cours, course cible.</p>
            </Card>
          </div>
        </Section>

        <Section title="Chip">
          <div className="flex flex-wrap gap-2">
            <Chip>Endurance</Chip>
            <Chip tone="quality">Fractionné</Chip>
            <Chip tone="long">Sortie longue</Chip>
            <Chip tone="good">Dans les clous</Chip>
            <Chip tone="info">En avance</Chip>
            <Chip tone="warn">En retard</Chip>
            <Chip tone="warn" glyph="✕">
              Non réalisée
            </Chip>
            <Chip tone="alert">Douleur 3/5</Chip>
            <Chip tone="off">Hors plan</Chip>
            <DemoChip />
            <DemoChip>exemple</DemoChip>
          </div>
        </Section>

        <Section title="Stat" demo>
          <div className="grid gap-grid-gap lg:grid-cols-2">
            <Variant name="Défaut">
              <dl className="grid grid-cols-2 gap-4">
                <Stat label="séances faites" value={String(w.doneCount)} />
                <Stat label="FC repos" value={String(f.restingHr)} unit="bpm" verdict={{ word: "stable", tone: "good" }} />
              </dl>
            </Variant>
            <Variant name="Tuile (tile)">
              <dl className="grid grid-cols-3 gap-2.5">
                <Stat variant="tile" label="distance" {...formatDistanceParts(planned.distanceM)} />
                <Stat variant="tile" accent compact label="allure /km" value={formatPaceRangeValue(planned.pace)} />
                <Stat variant="tile" compact label="FC (bpm)" value={`${planned.hr.min}–${planned.hr.max}`} />
              </dl>
            </Variant>
            <Variant name="Prévu / réalisé (compare)" className="lg:col-span-2">
              <dl className="grid grid-cols-3 gap-3">
                <Stat
                  variant="compare"
                  label="Distance"
                  value={formatDistanceParts(done.doneM).value}
                  unit="km"
                  planned={formatDistance(done.plannedM)}
                  delta={`${formatSignedDelta(gapM / 1000, 1)}${NBSP}km`}
                />
                <Stat
                  variant="compare"
                  label="Allure /km"
                  value={formatPaceValue(done.pace.actual)}
                  planned={formatPaceRangeValue(done.pace)}
                  delta={paceDelta ? `${formatSignedDelta(paceDelta)}${NBSP}s` : undefined}
                />
                <Stat variant="compare" label="FC moy." value={String(done.hr.actual)} planned={`${done.hr.min}–${done.hr.max}`} />
              </dl>
            </Variant>
          </div>
        </Section>

        <Section title="SessionCard" demo>
          <div className="grid gap-grid-gap lg:grid-cols-2">
            <Variant name="Prévue">
              <SessionCard
                variant="planned"
                label="Séance du jour"
                type={{ label: "Endurance", tone: "neutral" }}
                title={planned.title}
                details={planned.details}
                instructions={[]}
                distance={formatDistanceParts(planned.distanceM)}
                pace={formatPaceRangeValue(planned.pace)}
                hr={`${planned.hr.min}–${planned.hr.max}`}
                detailHref="#seance"
                detailLabel="Voir la semaine"
              />
            </Variant>
            <Variant name="Jour de repos : prochaine séance">
              <SessionCard
                variant="planned"
                label="Prochaine séance"
                when={`Demain · ${formatDate(addDays(today, 1))}`}
                type={{ label: "Sortie longue", tone: "long" }}
                title="Sortie longue"
                details="Endurance, FC sous 144. Boire toutes les 20'."
                instructions={[]}
                distance={formatDistanceParts(done.plannedM)}
                pace={formatPaceRangeValue(done.pace)}
                hr={`${done.hr.min}–${done.hr.max}`}
                footer={<Chip>Aujourd&apos;hui : repos</Chip>}
              />
            </Variant>
            <Variant name="Réalisée (prévu · réalisé · écart)">
              <SessionCard
                variant="done"
                label={formatDate(addDays(today, -1))}
                type={{ label: "Sortie longue", tone: "long" }}
                title={done.title}
                planned={formatDistanceParts(done.plannedM)}
                done={formatDistanceParts(done.doneM)}
                delta={{ value: formatSignedDelta(gapM / 1000, 1), unit: "km", ...done.gapVerdict }}
                instructions={[]}
                metrics={[
                  {
                    label: "Allure /km",
                    actual: formatPaceValue(done.pace.actual),
                    planned: formatPaceRangeValue(done.pace),
                    delta: paceDelta ? `${formatSignedDelta(paceDelta)}${NBSP}s` : undefined,
                  },
                  { label: "FC moy.", actual: String(done.hr.actual), planned: `${done.hr.min}–${done.hr.max}` },
                ]}
              />
            </Variant>
            <Variant name="Non réalisée · repos">
              <div className="flex flex-col gap-grid-gap">
                <SessionCard
                  variant="skipped"
                  label={formatDate(addDays(today, -3))}
                  type={{ label: "Seuil", tone: "quality" }}
                  title={demo.skippedSession.title}
                />
                <SessionCard variant="rest" label="Demain" title={demo.restDay.title} note={demo.restDay.note} />
              </div>
            </Variant>
          </div>
        </Section>

        <Section title="ScoreCard" demo>
          <div className="grid gap-grid-gap lg:grid-cols-2">
            <ScoreCard
              label="Forme"
              score={f.score}
              status={f.status}
              verdict={f.verdict}
              stats={[
                { label: "VFC", unit: "ms", value: String(f.hrvMs) },
                { label: "FC repos", value: String(f.restingHr) },
                { label: "sommeil", value: formatDurationApprox(f.sleepS) },
                { label: "douleur", value: `${f.pain}/5` },
              ]}
              questionnaire={{ href: "#questionnaire", label: "Questionnaire du matin · 30 s" }}
              badge={<DemoChip />}
            />
            <ScoreCard
              label="Forme"
              score={null}
              verdict="Remplis le questionnaire du matin pour obtenir ta forme."
              stats={[
                { label: "VFC", value: "—" },
                { label: "FC repos", value: String(f.restingHr) },
                { label: "sommeil", value: "—" },
                { label: "douleur", value: "—" },
              ]}
              badge={<DemoChip />}
            />
          </div>
        </Section>

        <Section title="WeekChart" demo>
          <Card label="Cette semaine" badge={<Chip tone="warn">En retard</Chip>}>
            <WeekChart
              days={weekDays}
              ariaLabel={`Semaine : ${formatDistance(w.doneM)} réalisés sur ${formatDistance(w.plannedM, 0)} prévus`}
              done={formatDistanceParts(w.doneM).value}
              planned={formatDistanceParts(w.plannedM, 0).value}
              progress={{
                donePct: cappedPct(w.doneM, w.plannedM),
                toDatePct: cappedPct(w.plannedToDateM, w.plannedM),
                toDateLabel: `Prévu à date : ${formatDistance(w.plannedToDateM, 0)}`,
              }}
              stats={[
                { label: "séances faites", value: String(w.doneCount) },
                { label: "séances restantes", value: String(w.remainingCount) },
              ]}
              note={w.offPlanNote}
            />
          </Card>
        </Section>

        <Section title="TrendChart" demo>
          <div className="grid gap-grid-gap lg:grid-cols-2">
            <Card label="Tendance du volume" badge={<span className="text-caption text-text-subtle">km / semaine</span>}>
              <TrendChart
                variant="bars"
                bars={bars}
                grid={[
                  { pct: 100, label: formatDistance(v.scaleM, 0) },
                  { pct: 50, label: formatDistance(v.scaleM / 2, 0) },
                ]}
                ariaLabel="Volume hebdomadaire, prévu et réalisé"
              />
            </Card>
            <Card label="Allure des footings" badge={<span className="text-caption text-text-subtle">min / km</span>}>
              <TrendChart
                points={line.points}
                targetY={line.refY[0]}
                targetLabel={`Borne rapide EF ${formatPaceValue(ep.targetS)}`}
                zone={{ fromY: line.refY[1], toY: line.refY[2], label: `Zone EF ${formatPaceRangeValue(ep.zone)}` }}
                lastLabel={`${formatPaceValue(ep.valuesS[ep.valuesS.length - 1])} /km`}
                ariaLabel={`Allure moyenne des footings, semaine après semaine : ${ep.valuesS.map(formatPaceValue).join(", ")}. Zone visée ${formatPaceRangeValue(ep.zone)}.`}
              />
            </Card>
          </div>
        </Section>

        <Section title="PhaseTimeline" note="Vraies phases du plan ; l'échéance de test est un exemple.">
          <div className="grid gap-grid-gap lg:grid-cols-2">
            <Card label="Phases">
              <PhaseTimeline phases={phases} ariaLabel={`Plan en 4 phases, semaine ${week} sur ${TOTAL_WEEKS}`} />
            </Card>
            <Card label="Avec échéances" badge={<DemoChip>exemple</DemoChip>}>
              <PhaseTimeline phases={phases} events={events} ariaLabel="Phases du plan et échéances" />
            </Card>
          </div>
        </Section>

        <Section title="Button">
          <div className="grid gap-grid-gap lg:grid-cols-2">
            <Variant name="Primary (un seul par écran) · secondary · ghost · désactivé">
              <div className="flex flex-wrap items-center gap-3">
                <Button block>Enregistrer</Button>
                <ButtonLink href="#journal" variant="secondary">
                  Ajouter une échéance
                </ButtonLink>
                <Button variant="ghost">Plus tard</Button>
                <Button variant="secondary" disabled>
                  Désactivé
                </Button>
              </div>
            </Variant>
            <Variant name="Toggle (filtres, aria-pressed)">
              <div className="flex flex-wrap gap-2">
                <Button variant="toggle" pressed>
                  Toutes
                </Button>
                <Button variant="toggle">Endurance</Button>
                <Button variant="toggle">Qualité</Button>
                <Button variant="toggle">Sortie longue</Button>
              </div>
            </Variant>
          </div>
        </Section>

        <Section title="TextField">
          <div className="grid gap-grid-gap lg:grid-cols-2">
            <TextField id="tf-email" label="E-mail" type="email" autoComplete="email" placeholder="nom@exemple.fr" />
            <TextField id="tf-note" label="Commentaire" hint="Visible dans le journal." />
            <TextField id="tf-rpe" label="RPE" inputMode="numeric" defaultValue="12" error="Entre 1 et 10." />
            <TextField id="tf-disabled" label="Désactivé" disabled defaultValue="—" />
          </div>
        </Section>

        <Section title="ScaleInput">
          <div className="grid gap-grid-gap lg:grid-cols-2">
            <ScaleInput legend="Ressenti" name="feeling" lowLabel="Épuisé" highLabel="Excellent" words={ressenti} defaultValue={4} />
            <ScaleInput legend="Effort perçu (RPE)" name="rpe" lowLabel="Très facile" highLabel="Maximal" max={10} defaultValue={6} />
          </div>
        </Section>
      </main>
    </>
  );
}
