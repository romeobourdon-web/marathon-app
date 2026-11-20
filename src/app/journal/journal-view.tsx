import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { SESSION_TYPE_TONE } from "@/components/ui/session-type";
import { getCheckin, getRecentJournal, type Checkin, type RecentJournalEntry } from "@/db/repository";
import { isWalk } from "@/engine/activity";
import { todayInParis } from "@/lib/dates";
import { formatDate, formatDistance, formatFeeling, formatPacePerKm, formatSport } from "@/lib/format";
import { TYPE_LABELS } from "@/planner/plan";
import type { SessionType } from "@/planner/types";
import { saveCheckinAction } from "./actions";
import { CheckinFields } from "./fields";

/** Contenu de /journal ; aussi affiché derrière le panneau de saisie sur PC. */
export async function JournalView() {
  const today = todayInParis();
  const [checkin, entries] = await Promise.all([getCheckin(today), getRecentJournal()]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div>
          <h1 className="font-display text-title-lg text-text">Journal</h1>
          <p className="text-body text-text-muted">Ressenti, effort perçu (RPE) et notes après chaque séance.</p>
        </div>
        <ButtonLink href="/journal/matin" variant="secondary" className="max-lg:hidden">
          {checkin ? "Modifier le questionnaire du matin" : "Questionnaire du matin"}
        </ButtonLink>
      </header>

      <div className="lg:hidden">
        <Card label="Questionnaire du matin" badge={<span className="text-caption text-text-subtle">{formatDate(today)}</span>}>
          {checkin ? (
            <CheckinSummary checkin={checkin} />
          ) : (
            <form action={saveCheckinAction} className="flex flex-col gap-6">
              <input type="hidden" name="from" value="/journal" />
              <CheckinFields checkin={null} />
              <Button type="submit" className="w-full">
                Envoyer
              </Button>
            </form>
          )}
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="eyebrow">Entrées récentes</h2>
        {entries.length === 0 ? (
          <p className="text-body text-text-muted">Aucune entrée pour l&apos;instant : ajoute ton ressenti depuis le détail d&apos;une séance.</p>
        ) : (
          <ul className="grid gap-grid-gap lg:grid-cols-2">
            {entries.map((e) => (
              <li key={e.id}>
                <EntryCard entry={e} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CheckinSummary({ checkin }: { checkin: Checkin }) {
  const items = [
    { label: "Fatigue", value: checkin.fatigue },
    { label: "Sommeil", value: checkin.sleepQuality },
    { label: "Douleur", value: checkin.pain },
    { label: "Motivation", value: checkin.motivation },
  ];
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-4 gap-2">
        {items.map((i) => (
          <div key={i.label} className="flex flex-col">
            <dt className="order-2 text-caption text-text-subtle">{i.label}</dt>
            <dd className="order-1 font-display text-num-sm text-text tabular-nums">{i.value ? `${i.value}/5` : "—"}</dd>
          </div>
        ))}
      </dl>
      {checkin.note && <p className="text-body-sm text-text-muted italic">{checkin.note}</p>}
      <Link href="/journal/matin" className="focus-ring -mx-2 inline-flex min-h-(--touch-min) items-center self-start rounded-sm px-2 text-label text-accent-ink">
        Modifier
      </Link>
    </div>
  );
}

function EntryCard({ entry }: { entry: RecentJournalEntry }) {
  const { activity, session, answers } = entry;
  const date = activity?.date ?? session?.date ?? "";
  const href = `/seances/${activity?.session?.id ?? activity?.id ?? session?.id}`;
  const type = (activity?.session?.type ?? session?.type) as SessionType | undefined;
  const title = activity?.session?.title ?? session?.title ?? (activity ? (isWalk(activity) ? "Marche" : formatSport(activity.sport)) : "");
  const chip = session ? (
    <Chip tone="warn" glyph="✕">
      Non réalisée
    </Chip>
  ) : type ? (
    <Chip tone={SESSION_TYPE_TONE[type]}>{TYPE_LABELS[type]}</Chip>
  ) : (
    <Chip tone="off">Hors plan</Chip>
  );
  const numbers = activity
    ? [formatDistance(activity.distanceKm * 1000), activity.avgPace !== null ? formatPacePerKm(activity.avgPace) : null, activity.avgHr ? `${activity.avgHr} bpm` : null]
        .filter(Boolean)
        .join(" · ")
    : `prévu : ${formatDistance((session?.distanceKm ?? 0) * 1000, 0)}`;

  return (
    <Link href={href} className="focus-ring flex h-full flex-col gap-4 rounded-lg border-(length:--border-hairline) border-line bg-surface p-card-pad shadow-card hover:border-plan-edge">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-caption font-semibold text-text-subtle">{formatDate(date, "long")}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-body font-semibold text-text">
            {title} {chip}
          </p>
          <p className="mt-1 text-body-sm text-text-muted tabular-nums">{numbers}</p>
        </div>
        {answers.feeling && (
          <p className="flex shrink-0 flex-col items-end">
            <span className="font-display text-num-md text-text tabular-nums">{answers.feeling}</span>
            <span className="text-label text-accent-ink">{formatFeeling(answers.feeling)}</span>
          </p>
        )}
      </div>
      {answers.rpe && (
        <div className="flex flex-col gap-1.5">
          <p className="flex items-baseline gap-2">
            <span className="text-micro text-text-subtle uppercase">RPE</span>
            <span className="font-display text-num-sm text-text tabular-nums">{answers.rpe}/10</span>
            {answers.pain && <span className="ml-auto text-caption text-text-muted">Douleur (Achille) {answers.pain}/5</span>}
          </p>
          <div className="grid grid-cols-10 gap-1" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={`h-2 rounded-ctl ${i < answers.rpe! ? "bg-accent" : "bg-surface-raised"}`} />
            ))}
          </div>
        </div>
      )}
      {answers.comment && <blockquote className="rounded-md bg-surface-raised p-3.5 text-body-sm text-text italic">{answers.comment}</blockquote>}
    </Link>
  );
}
