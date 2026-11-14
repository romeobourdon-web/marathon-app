import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { BottomNav, type BottomNavItem } from "@/components/ui/bottom-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip, DemoChip } from "@/components/ui/chip";
import { ScaleInput } from "@/components/ui/scale-input";
import { ScoreCard } from "@/components/ui/score-card";
import { SessionCard } from "@/components/ui/session-card";
import { Stat } from "@/components/ui/stat";
import { StatusBand } from "@/components/ui/status-band";
import { TextField } from "@/components/ui/text-field";
import { TrendChart } from "@/components/ui/trend-chart";
import { WeekChart } from "@/components/ui/week-chart";
import { getDesignPreview, getPlanStart, getRace } from "@/db/repository";
import { distanceGapM, pairedBarHeightsPct, trendGeometry } from "@/engine/chart";
import {
  formatClock,
  formatDate,
  formatDistance,
  formatDistanceParts,
  formatDurationApprox,
  formatPacePerKm,
  formatSignedDelta,
} from "@/lib/format";
import { TOTAL_WEEKS } from "@/planner/plan";
import { currentWeek, daysToRace } from "@/planner/calendar";

export const metadata: Metadata = {
  title: "Design system — Target 42",
  description: "Aperçu des composants du design system v2 (DESIGN.md).",
};

const DAY_NAMES = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

const NAV_ITEMS: BottomNavItem[] = [
  { href: "#aujourdhui", label: "Aujourd'hui", icon: "today" },
  { href: "#calendrier", label: "Calendrier", icon: "calendar" },
  { href: "#journal", label: "Journal", icon: "journal" },
  { href: "#echeances", label: "Échéances", icon: "deadlines" },
];

function Section({ title, demo = false, children }: { title: string; demo?: boolean; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3 border-b-(length:--border-hairline) border-line pb-2">
        <h2 className="text-title text-text">{title}</h2>
        {demo && <DemoChip />}
      </header>
      {children}
    </section>
  );
}

function Variant({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption text-text-muted">{name}</p>
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
  const demo = getDesignPreview();
  const race = await getRace();
  const today = demo.today;

  // Bandeau : semaine et compte à rebours calculés par planner/ (date du jour fictive).
  const week = currentWeek(await getPlanStart(), today);
  const countdown = daysToRace(today, race.date);

  // Séances
  const planned = demo.plannedSession;
  const done = demo.doneSession;
  const gapM = distanceGapM(done.plannedM, done.doneM);

  // Semaine : barres sur une échelle commune (engine/), aria-label qui lit les valeurs.
  const bars = pairedBarHeightsPct(demo.week.plannedM, demo.week.doneM);
  const weekDays = demo.week.labels.map((label, i) => ({
    label,
    plannedPct: bars.planned[i],
    donePct: bars.done[i],
    isToday: i === demo.week.todayIndex,
    flagged: demo.week.flagged[i],
  }));
  const weekAria = `Semaine : ${demo.week.labels
    .map((_, i) => {
      const flag = demo.week.flagged[i] ? ", écart signalé" : "";
      return `${DAY_NAMES[i]} prévu ${formatDistance(demo.week.plannedM[i])}, réalisé ${formatDistance(demo.week.doneM[i])}${flag}`;
    })
    .join(" ; ")}.`;

  // Temps prédit
  const predicted = demo.predictedTime;
  const trend = trendGeometry(predicted.valuesS, predicted.targetS);
  const lastPredicted = formatClock(predicted.valuesS[predicted.valuesS.length - 1]);
  const trendAria = `Temps prédit au marathon, semaine après semaine : ${predicted.valuesS.map(formatClock).join(", ")}. Objectif ${formatClock(predicted.targetS)}.`;

  const f = demo.form;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-12 px-5 pt-8 pb-12">
      <header className="flex flex-col gap-2">
        <p className="text-label text-text-muted">Target 42 · design system v2</p>
        <h1 className="text-title-lg text-text">Composants</h1>
        <p className="text-body-sm text-text-muted">
          Aperçu de DESIGN.md §4. Les valeurs marquées « démo » sont fictives (D16).
        </p>
      </header>

      <Section title="StatusBand" demo>
        <StatusBand
          date={formatDate(today)}
          week={week >= 1 ? `${week} / ${TOTAL_WEEKS}` : "hors plan"}
          countdown={`J-${countdown}`}
        />
      </Section>

      <Section title="Card">
        <Card label="Libellé de carte">
          <p className="text-body text-text">Une carte = une question, un seul chiffre héros.</p>
        </Card>
      </Section>

      <Section title="SessionCard" demo>
        <Variant name="Prévue">
          <SessionCard
            variant="planned"
            label="Aujourd'hui"
            title={planned.title}
            distance={formatDistanceParts(planned.distanceM)}
            instructions={[
              `${formatPacePerKm(planned.pace.min)}–${formatPacePerKm(planned.pace.max)}`,
              `FC < ${planned.hrMax}`,
            ]}
            detailHref="#seance"
            badge={<DemoChip />}
          />
        </Variant>
        <Variant name="Réalisée (prévu · réalisé · écart)">
          <SessionCard
            variant="done"
            label="Hier"
            title={done.title}
            planned={formatDistanceParts(done.plannedM)}
            done={formatDistanceParts(done.doneM)}
            delta={{ value: formatSignedDelta(gapM / 1000, 1), unit: "km", ...done.gapVerdict }}
            instructions={[`${formatPacePerKm(done.pace.min)}–${formatPacePerKm(done.pace.max)}`]}
            detailHref="#seance"
            badge={<DemoChip />}
          />
        </Variant>
        <Variant name="Repos">
          <SessionCard variant="rest" label="Demain" title={demo.restDay.title} note={demo.restDay.note} />
        </Variant>
      </Section>

      <Section title="ScoreCard" demo>
        <Variant name="Avec score">
          <ScoreCard
            label="État de forme"
            score={f.score}
            status={f.status}
            verdict={f.verdict}
            stats={[
              { label: "FC repos", value: String(f.restingHr), unit: "bpm", verdict: f.restingHrVerdict },
              { label: "VFC", value: String(f.hrvMs), unit: "ms", verdict: f.hrvVerdict },
              { label: "Sommeil", value: formatDurationApprox(f.sleepS) },
              { label: "Fatigue", value: String(f.fatigue), unit: "/ 5" },
            ]}
            badge={<DemoChip />}
          />
        </Variant>
        <Variant name="Sans score (jauge masquée), questionnaire à remplir">
          <ScoreCard
            label="État de forme"
            score={null}
            verdict="Remplis le questionnaire du matin pour obtenir ton état de forme."
            stats={[
              { label: "FC repos", value: String(f.restingHr), unit: "bpm" },
              { label: "VFC", value: "—" },
              { label: "Sommeil", value: "—" },
              { label: "Fatigue", value: "—" },
            ]}
            questionnaire={{ href: "#questionnaire", label: "Questionnaire du matin" }}
            badge={<DemoChip />}
          />
        </Variant>
      </Section>

      <Section title="Stat" demo>
        <dl className="grid grid-cols-2 gap-4">
          <Stat label="Sans verdict" value={formatClock(predicted.targetS)} />
          <Stat label="Favorable" value={String(f.restingHr)} unit="bpm" verdict={{ word: "stable", tone: "good" }} />
          <Stat label="Vigilance" value={String(f.hrvMs)} unit="ms" verdict={{ word: "sous la normale", tone: "warn" }} />
          <Stat label="Alerte" value="3" unit="/ 5" verdict={{ word: "douleur signalée", tone: "alert" }} />
        </dl>
      </Section>

      <Section title="Chip">
        <div className="flex flex-wrap gap-2">
          <Chip>neutre</Chip>
          <Chip tone="good">en avance</Chip>
          <Chip tone="warn">écart</Chip>
          <Chip tone="alert">manquée</Chip>
          <DemoChip />
        </div>
      </Section>

      <Section title="WeekChart" demo>
        <Card label="Cette semaine" badge={<DemoChip />}>
          <WeekChart days={weekDays} ariaLabel={weekAria} />
        </Card>
      </Section>

      <Section title="TrendChart" demo>
        <Card label="Temps prédit au marathon" badge={<DemoChip />}>
          <TrendChart
            points={trend.points}
            targetY={trend.targetY}
            targetLabel={`Objectif ${formatClock(predicted.targetS)}`}
            lastLabel={lastPredicted}
            ariaLabel={trendAria}
          />
        </Card>
      </Section>

      <Section title="Button">
        <Variant name="Primary (un seul par écran)">
          <Button>Enregistrer</Button>
        </Variant>
        <Variant name="Secondary">
          <ButtonLink href="#journal" variant="secondary">
            Ouvrir le journal
          </ButtonLink>
        </Variant>
        <Variant name="Ghost">
          <Button variant="ghost">Plus tard</Button>
        </Variant>
        <Variant name="Désactivé">
          <Button disabled>Enregistrer</Button>
        </Variant>
      </Section>

      <Section title="TextField">
        <TextField id="tf-email" label="Email" type="email" autoComplete="email" placeholder="nom@exemple.fr" />
        <TextField id="tf-note" label="Note de séance" hint="Visible dans le journal." />
        <TextField id="tf-rpe" label="RPE" inputMode="numeric" defaultValue="12" error="Entre 1 et 10." />
        <TextField id="tf-disabled" label="Désactivé" disabled defaultValue="—" />
      </Section>

      <Section title="ScaleInput">
        <ScaleInput legend="Fatigue" name="fatigue" lowLabel="Très reposé" highLabel="Épuisé" />
        <ScaleInput legend="Qualité du sommeil" name="sleep" lowLabel="Très mauvaise" highLabel="Excellente" defaultValue={4} />
      </Section>

      <Section title="BottomNav">
        <p className="text-body-sm text-text-muted">Pilule flottante : l&apos;écran la fixe en bas de page.</p>
        <BottomNav items={NAV_ITEMS} current="#aujourdhui" />
      </Section>
    </main>
  );
}
