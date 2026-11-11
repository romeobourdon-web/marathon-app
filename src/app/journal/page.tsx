import { Suspense } from "react";
import { connection } from "next/server";
import { getSessions, type JournalEntry } from "@/data";
import { todayInParis } from "@/lib/dates";
import { formatDayLong, formatKm, formatPace } from "@/lib/format";
import { Card, PageHeader, TypeBadge } from "@/components/ui";

const FEELINGS: Record<JournalEntry["feeling"], { emoji: string; label: string }> = {
  1: { emoji: "😫", label: "Épuisé" },
  2: { emoji: "😓", label: "Difficile" },
  3: { emoji: "😐", label: "Correct" },
  4: { emoji: "🙂", label: "Bien" },
  5: { emoji: "🤩", label: "Excellent" },
};

export default function JournalPage() {
  return (
    <>
      <PageHeader title="Journal" subtitle="Ressenti, effort perçu (RPE) et notes après chaque séance." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-2" />}>
        <Entries />
      </Suspense>
    </>
  );
}

async function Entries() {
  await connection();
  const entries = getSessions(todayInParis())
    .filter((s) => s.journal)
    .reverse();

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {entries.map((s) => {
        const j = s.journal!;
        const f = FEELINGS[j.feeling];
        return (
          <Card key={s.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-ink-3 capitalize">{formatDayLong(s.date)}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{s.title}</span>
                  <TypeBadge type={s.type} />
                </div>
                <div className="mt-1 text-xs text-ink-2 tabular">
                  {formatKm(s.actual!.distanceKm)} km · {formatPace(s.actual!.avgPace)} /km · {s.actual!.avgHr} bpm
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl" aria-hidden>{f.emoji}</div>
                <div className="text-xs font-semibold text-ink-2">{f.label}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-bold tracking-wide text-ink-3 uppercase">RPE</span>
                <span className="font-display text-lg leading-none font-bold tabular">{j.rpe}/10</span>
              </div>
              <div className="flex gap-1" aria-hidden>
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className={`h-2 flex-1 rounded-full ${i < j.rpe ? "bg-accent" : "bg-surface-2"}`} />
                ))}
              </div>
            </div>

            <p className="mt-4 rounded-2xl bg-surface-2 p-3.5 text-sm text-ink-2 italic">« {j.note} »</p>
          </Card>
        );
      })}
    </div>
  );
}
