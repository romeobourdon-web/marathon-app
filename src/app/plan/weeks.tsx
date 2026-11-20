import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { SESSION_TYPE_TONE } from "@/components/ui/session-type";
import { WEEK_STATUS_CHIP } from "@/components/ui/week-status";
import { formatDateRange, formatDistanceParts, formatSignedDelta, formatWeekday } from "@/lib/format";
import { TYPE_LABELS } from "@/planner/plan";
import type { PlanSessionRow, PlanWeek } from "@/planner/plan-view";

const km = (v: number, digits = 1) => formatDistanceParts(v * 1000, digits).value;

/** « 23,6 / 44 km » + Chip de statut ; semaine à venir : « 44 km » + « à venir ». */
function WeekTotals({ week }: { week: PlanWeek }) {
  const status = week.status ? WEEK_STATUS_CHIP[week.status] : null;
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <p className="font-display text-num-sm text-text tabular-nums">
        {week.doneKm === null ? (
          <>
            {km(week.plannedKm, 0)}
            <span className="ml-0.5 text-body-sm font-semibold text-text-subtle">km</span>
          </>
        ) : (
          <>
            {km(week.doneKm)}
            <span className="text-text-subtle"> / {km(week.plannedKm, 0)}</span>
            <span className="ml-0.5 text-body-sm font-semibold text-text-subtle">km</span>
          </>
        )}
      </p>
      {status ? <Chip tone={status.tone}>{status.word}</Chip> : <Chip>à venir</Chip>}
    </div>
  );
}

function WeekDates({ week }: { week: PlanWeek }) {
  return (
    <span className="text-caption text-text-subtle">
      {formatDateRange(week.start, week.end)}
      {week.light && " · allégée"}
    </span>
  );
}

const DOT = {
  done: { className: "bg-done text-on-accent", mark: "✓", word: "faite" },
  skipped: { className: "bg-warn-soft text-warn", mark: "✕", word: "non réalisée" },
  planned: { className: "border-(length:--border-plan) border-dashed border-plan-edge text-text-muted", mark: "•", word: "prévue" },
} as const;

function SessionLine({ row }: { row: PlanSessionRow }) {
  const s = row.session;
  const dot = DOT[row.dot];
  const gaps = [
    row.paceGap !== 0 ? `allure ${formatSignedDelta(row.paceGap)} s` : null,
    row.hrGap !== 0 ? `FC ${formatSignedDelta(row.hrGap)}` : null,
  ].filter(Boolean);
  const content = (
    <>
      <span className="w-8 shrink-0 text-caption font-semibold text-text-subtle">{formatWeekday(s.date)}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm font-semibold text-text">
          {s.title}
          <Chip tone={SESSION_TYPE_TONE[s.type]}>{TYPE_LABELS[s.type]}</Chip>
        </span>
        {gaps.length > 0 && <span className="mt-0.5 block text-caption font-semibold text-accent-ink">Δ {gaps.join(" · ")}</span>}
      </span>
      <span className="shrink-0 font-display text-title-sm text-text tabular-nums">
        {row.dot === "done" && s.actual ? (
          <>
            {km(s.actual.distanceKm)}
            <span className="text-text-subtle"> / {km(s.distanceKm, 0)}</span>
          </>
        ) : (
          <span className="text-text-subtle">{km(s.distanceKm, 0)}</span>
        )}
      </span>
      <span aria-hidden="true" className={`grid size-7 shrink-0 place-items-center rounded-pill text-body-sm font-bold ${dot.className}`}>
        {dot.mark}
      </span>
      <span className="sr-only">: {dot.word}</span>
    </>
  );
  const cls = "flex min-h-(--touch-min) items-center gap-3 py-2";
  return row.dot === "planned" ? (
    <div className={cls}>{content}</div>
  ) : (
    <Link href={`/seances/${s.id}`} className={`focus-ring -mx-2 rounded-md px-2 hover:bg-surface-raised ${cls}`}>
      {content}
    </Link>
  );
}

function SessionList({ week }: { week: PlanWeek }) {
  return (
    <ul className="divide-y divide-line">
      {week.sessions.map((r) => (
        <li key={r.session.id}>
          <SessionLine row={r} />
        </li>
      ))}
    </ul>
  );
}

/** Semaine dépliée : en-tête, totaux et une ligne par séance. La semaine en cours a l'anneau accent. */
export function WeekCard({ week, id }: { week: PlanWeek; id?: string }) {
  const current = week.state === "current";
  return (
    <div id={id} className="scroll-mt-20">
      <Card highlight={current}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="flex flex-wrap items-center gap-2 font-display text-title-sm text-text">
              Semaine {week.week}
              {current && <span className="rounded-pill bg-accent-ink px-2.5 py-0.5 font-sans text-caption font-bold text-on-accent">en cours</span>}
            </h3>
            <WeekDates week={week} />
          </div>
          <WeekTotals week={week} />
        </div>
        <SessionList week={week} />
      </Card>
    </div>
  );
}

/** Semaine repliée (une ligne) ; dépliée au tap (details natif, sans JavaScript). */
export function WeekRow({ week }: { week: PlanWeek }) {
  return (
    <details className="group rounded-lg border-(length:--border-hairline) border-line bg-surface shadow-card">
      <summary className="focus-ring flex min-h-(--touch-min) cursor-pointer list-none items-center gap-3 rounded-lg px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="w-9 shrink-0 font-display text-title-sm text-text">S{week.week}</span>
        <span className="min-w-0 flex-1">
          <WeekDates week={week} />
        </span>
        <WeekTotals week={week} />
      </summary>
      <div className="border-t-(length:--border-hairline) border-line px-4 pb-2">
        <SessionList week={week} />
      </div>
    </details>
  );
}
