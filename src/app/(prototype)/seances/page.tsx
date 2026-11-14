import { Suspense } from "react";
import { connection } from "next/server";
import { getSessions } from "@/db/repository";
import { paceGap } from "@/engine/pace";
import type { Session } from "@/planner/types";
import { todayInParis } from "@/lib/dates";
import { formatDayShort, formatKm, formatPace, formatPaceRange } from "@/lib/format";
import { Card, PageHeader, TypeBadge } from "@/components/ui";

export default function SeancesPage() {
  return (
    <>
      <PageHeader title="Séances" subtitle="Prévu vs réalisé, de la plus récente à la plus ancienne." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}>
        <SessionList />
      </Suspense>
    </>
  );
}

async function SessionList() {
  await connection();
  const past = getSessions(todayInParis())
    .filter((s) => s.status === "done" || s.status === "skipped")
    .reverse();

  return (
    <div className="space-y-3">
      {past.map((s) => (
        <SessionRow key={s.id} session={s} />
      ))}
    </div>
  );
}

function SessionRow({ session: s }: { session: Session }) {
  return (
    <Card className="!p-4 sm:!p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-ink-3 capitalize">{formatDayShort(s.date)}</span>
            <TypeBadge type={s.type} />
          </div>
          <div className="mt-1 font-semibold">{s.title}</div>
        </div>

        {s.status === "skipped" ? (
          <span className="self-start rounded-full bg-warn-soft px-3 py-1 text-sm font-bold text-warn sm:self-center">✕ Non réalisée</span>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:w-[28rem]">
            <Compare label="Distance" planned={`${formatKm(s.distanceKm)} km`} actual={`${formatKm(s.actual!.distanceKm)} km`} />
            <Compare label="Allure /km" planned={formatPaceRange(s.targetPace)} actual={formatPace(s.actual!.avgPace)} gap={paceGap(s.actual!.avgPace, s.targetPace)} />
            <Compare
              label="FC moy."
              planned={`${s.targetHr.min}–${s.targetHr.max}`}
              actual={`${s.actual!.avgHr}`}
              warn={s.actual!.avgHr > s.targetHr.max}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

function Compare({ label, planned, actual, gap, warn }: { label: string; planned: string; actual: string; gap?: number; warn?: boolean }) {
  const off = (gap !== undefined && gap !== 0) || warn;
  return (
    <div>
      <div className="text-[11px] font-bold tracking-wide text-ink-3 uppercase">{label}</div>
      <div className={`font-display text-2xl leading-tight font-bold tabular ${off ? "text-accent-ink" : ""}`}>{actual}</div>
      <div className="text-xs text-ink-3 tabular">
        visé {planned}
        {gap !== undefined && gap !== 0 && (
          <span className="ml-1 font-semibold text-accent-ink">
            ({gap < 0 ? "−" : "+"}
            {Math.abs(gap)} s)
          </span>
        )}
      </div>
    </div>
  );
}
