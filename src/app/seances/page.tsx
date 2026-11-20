import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AppNav } from "@/components/ui/app-nav";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SESSION_TYPE_TONE } from "@/components/ui/session-type";
import { getActivities, getPlanStart, getSessions } from "@/db/repository";
import type { ActivityRecord } from "@/db/types";
import { addDays, todayInParis } from "@/lib/dates";
import { formatClock, formatDate, formatDateRange, formatDistance, formatPacePerKm, formatSport } from "@/lib/format";
import { sessionFeed, type FeedFilter, type FeedItem } from "@/planner/feed";
import { TYPE_LABELS, weekStart } from "@/planner/plan";
import { SessionCompare } from "./session-compare";

const FILTERS: { key: FeedFilter; param?: string; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "run", param: "course", label: "Course" },
  { key: "offplan", param: "hors-plan", label: "Hors plan" },
  { key: "skipped", param: "non-realisees", label: "Non réalisées" },
];


export default function SessionsPage({ searchParams }: PageProps<"/seances">) {
  return (
    <>
      <AppNav current="/seances" />
      <main className="mx-auto w-full max-w-content px-page-x pt-6 pb-28 lg:pt-8 lg:pb-12">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-surface-raised" />}>
          <Sessions searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function Sessions({ searchParams }: { searchParams: PageProps<"/seances">["searchParams"] }) {
  await connection();
  const param = (await searchParams).filtre;
  const filter = FILTERS.find((f) => f.param === param)?.key ?? "all";
  const today = todayInParis();
  const [planStart, sessions, activities] = await Promise.all([getPlanStart(), getSessions(today), getActivities()]);
  const groups = sessionFeed(sessions, activities, planStart, today, filter);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-title-lg text-text">Séances</h1>
          <p className="text-body text-text-muted">Prévu vs réalisé, de la plus récente à la plus ancienne.</p>
        </div>
        <nav aria-label="Filtrer les séances" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <ButtonLink key={f.key} variant="toggle" current={f.key === filter} href={f.param ? `/seances?filtre=${f.param}` : "/seances"}>
              {f.label}
            </ButtonLink>
          ))}
        </nav>
      </header>

      {groups.length === 0 && <p className="text-body text-text-muted">Aucune séance pour ce filtre.</p>}

      {groups.map((g) => (
        <section key={g.week ?? "avant"} className="flex flex-col gap-3">
          <h2 className="eyebrow">
            {g.week === null
              ? "Avant le plan · hors plan"
              : `Semaine ${g.week} · ${formatDateRange(weekStart(planStart, g.week), addDays(weekStart(planStart, g.week), 6))}`}
          </h2>
          <ul className="flex flex-col gap-3">
            {g.items.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <FeedCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const head =
    item.kind === "done" || item.kind === "skipped"
      ? { title: item.session.title, chip: <Chip tone={SESSION_TYPE_TONE[item.session.type]}>{TYPE_LABELS[item.session.type]}</Chip> }
      : item.kind === "run"
        ? { title: "Course libre", chip: <Chip>Course</Chip> }
        : { title: formatSport(item.sport), chip: <Chip tone="off">Hors plan</Chip> };

  return (
    <Link
      href={`/seances/${item.id}`}
      className="focus-ring flex flex-col gap-3.5 rounded-lg border-(length:--border-hairline) border-line bg-surface p-4 shadow-card transition-colors hover:border-plan-edge lg:flex-row lg:items-center lg:gap-6"
    >
      <div className="min-w-0 lg:flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-caption font-semibold text-text-subtle">{formatDate(item.date)}</span>
          {head.chip}
        </p>
        <p className="mt-1 text-body font-semibold text-text">{head.title}</p>
      </div>

      <div className="lg:w-112 lg:shrink-0">
        {item.kind === "done" && item.session.actual && (
          <dl className="grid grid-cols-3 gap-3">
            <SessionCompare session={item.session} actual={item.session.actual} />
          </dl>
        )}
        {item.kind === "skipped" && (
          <Chip tone="warn" glyph="✕">
            Non réalisée
          </Chip>
        )}
        {item.kind === "run" && <ActivityLine activity={item.activity} note="comptée dans le volume, sans séance liée" />}
        {item.kind === "offplan" && <ActivityLine activity={item.activity} note="non comptée dans le plan" />}
      </div>
    </Link>
  );
}

function ActivityLine({ activity, note }: { activity: ActivityRecord; note: string }) {
  const parts = [
    formatDistance(activity.distanceKm * 1000),
    formatClock(activity.durationSec),
    activity.avgPace !== null ? formatPacePerKm(activity.avgPace) : null,
    activity.avgHr ? `FC ${activity.avgHr}` : null,
  ].filter(Boolean);
  return (
    <p className="text-body-sm text-text-muted">
      {parts.join(" · ")} — {note}
    </p>
  );
}
