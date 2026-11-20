import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AppNav } from "@/components/ui/app-nav";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { SESSION_TYPE_TONE } from "@/components/ui/session-type";
import { Stat } from "@/components/ui/stat";
import { TrendChart } from "@/components/ui/trend-chart";
import { getActivityDetail, getPlanStart, getSessions, type ActivityDetail } from "@/db/repository";
import type { CompletedRun } from "@/db/types";
import { lineGeometry } from "@/engine/chart";
import { paceGap, rangeGap } from "@/engine/pace";
import { avgCadenceSpm, endHrDrift, kmSplits, type KmSplit } from "@/engine/splits";
import { todayInParis } from "@/lib/dates";
import {
  formatClock,
  formatDate,
  formatDistance,
  formatDistanceParts,
  formatFeeling,
  formatPaceRangeValue,
  formatPaceValue,
  formatSport,
} from "@/lib/format";
import { planWeekOf } from "@/planner/feed";
import { TYPE_LABELS } from "@/planner/plan";
import type { Range, Session } from "@/planner/types";
import { SessionCompare } from "../session-compare";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Tours affichés par colonne du tableau sur PC (km 1-10 / 11-20). */
const SPLITS_PER_COLUMN = 10;

export default function SessionDetailPage({ params }: PageProps<"/seances/[id]">) {
  return (
    <>
      <AppNav current="/seances" />
      <main className="mx-auto w-full max-w-content px-page-x pt-4 pb-28 lg:pt-6 lg:pb-12">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-surface-raised" />}>
          <Detail params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Detail({ params }: { params: PageProps<"/seances/[id]">["params"] }) {
  await connection();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const today = todayInParis();
  const [planStart, sessions] = await Promise.all([getPlanStart(), getSessions(today)]);

  // Une séance prévue (réalisée ou non), ou une activité (liée à une séance, course libre, hors plan)
  let session: Session | undefined = sessions.find((s) => s.id === id);
  let details: ActivityDetail[];
  if (session) {
    details = (await Promise.all((session.activityIds ?? []).map(getActivityDetail))).filter((d): d is ActivityDetail => d !== null);
  } else {
    const d = await getActivityDetail(id);
    if (!d) notFound();
    details = [d];
    session = sessions.find((s) => s.activityIds?.includes(id));
  }

  // Séries : celles de l'activité la plus longue (une séance peut être faite en plusieurs fois, D28)
  const main = [...details].sort((a, b) => b.activity.distanceKm - a.activity.distanceKm)[0];
  const actual: CompletedRun | undefined =
    session?.actual ??
    (main && {
      distanceKm: main.activity.distanceKm,
      durationSec: main.activity.durationSec,
      avgPace: main.activity.avgPace ?? 0,
      avgHr: main.activity.avgHr ?? 0,
    });
  const date = session?.date ?? main.activity.date;
  const week = planWeekOf(planStart, date);
  const title = session?.title ?? (main && formatSport(main.activity.sport));
  const splits = main?.stream ? kmSplits(main.stream) : [];
  const cadence = main?.stream ? avgCadenceSpm(main.stream.cadence) : null;
  const elevation = details.reduce((sum, d) => sum + (d.elevationGainM ?? 0), 0);
  const journal = details.find((d) => d.journal)?.journal ?? null;
  const pace = session && actual ? paceGap(actual.avgPace, session.targetPace) : 0;
  const hr = session && actual && actual.avgHr > 0 ? rangeGap(actual.avgHr, session.targetHr) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/seances" className="focus-ring -mx-2 inline-flex min-h-(--touch-min) items-center gap-1 rounded-sm px-2 text-label text-accent-ink">
          <Icon name="chevron" className="size-4 rotate-180" />
          Séances
        </Link>
        <p className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-caption text-text-subtle">
            {formatDate(date, "full")}
            {week !== null && ` · semaine ${week}`}
          </span>
          {session ? (
            <Chip tone={SESSION_TYPE_TONE[session.type]}>{TYPE_LABELS[session.type]}</Chip>
          ) : (
            <Chip tone="off">Hors séance</Chip>
          )}
        </p>
        <h1 className="mt-1 font-display text-title-lg text-text">{title}</h1>
        {session?.details && <p className="mt-1 text-body text-text-muted">Prévu : {session.details}</p>}
      </div>

      {/* Téléphone : une colonne, dans l'ordre de DESIGN.md. PC : 8 colonnes (analyse) + 4 colonnes (synthèse). */}
      <div className="flex flex-col gap-grid-gap lg:grid lg:grid-cols-12 lg:items-start">
        <div className="contents lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:flex lg:flex-col lg:gap-grid-gap">
          <div className="order-1 lg:order-none">
            {session?.status === "skipped" || !actual ? (
              <Card label="Prévu / réalisé" badge={<Chip tone="warn" glyph="✕">Non réalisée</Chip>}>
                {session && (
                  <p className="text-body text-text-muted">
                    Prévu : {formatDistance(session.distanceKm * 1000, 0)} à {formatPaceRangeValue(session.targetPace)} /km, FC {session.targetHr.min}–
                    {session.targetHr.max}.
                  </p>
                )}
              </Card>
            ) : (
              <Card
                label={session ? "Prévu / réalisé" : "Réalisé"}
                badge={
                  session ? (
                    pace === 0 && hr === 0 ? (
                      <Chip tone="good" glyph="✓">
                        Conforme
                      </Chip>
                    ) : (
                      <Chip tone="warn">Hors zone</Chip>
                    )
                  ) : undefined
                }
              >
                <dl className="grid grid-cols-3 gap-3">
                  {session ? (
                    <SessionCompare session={session} actual={actual} />
                  ) : (
                    <>
                      <Stat variant="compare" label="Distance" {...formatDistanceParts(actual.distanceKm * 1000)} />
                      <Stat variant="compare" label="Allure /km" value={actual.avgPace > 0 ? formatPaceValue(actual.avgPace) : "—"} />
                      <Stat variant="compare" label="FC moy." value={actual.avgHr > 0 ? String(actual.avgHr) : "—"} />
                    </>
                  )}
                </dl>
                <dl className="mt-4 grid grid-cols-3 gap-3 border-t-(length:--border-hairline) border-line pt-4">
                  <Stat variant="compare" label="Durée" value={formatClock(actual.durationSec)} />
                  <Stat variant="compare" label="D+" value={elevation > 0 ? String(Math.round(elevation)) : "—"} unit={elevation > 0 ? "m" : undefined} />
                  <Stat variant="compare" label="Cadence" value={cadence === null ? "—" : String(cadence)} unit={cadence === null ? undefined : "pas/min"} />
                </dl>
              </Card>
            )}
          </div>

          {actual && (
            <div className="order-2 lg:order-none">
              <Card
                label="Mon ressenti"
                badge={
                  journal ? (
                    <Link href="/journal" className="focus-ring rounded-sm text-label text-accent-ink">
                      Modifier
                    </Link>
                  ) : undefined
                }
              >
                {journal ? <Feeling journal={journal} /> : <ButtonLink href="/journal" variant="secondary" block>Ajouter mon ressenti</ButtonLink>}
              </Card>
            </div>
          )}

          {splits.length > 0 && (
            <div className="order-6 lg:order-none">
              <Card label="Analyse du coach" badge={<Chip>phase 3</Chip>}>
                <p className="text-body text-text-muted">L&apos;analyse automatique de la séance arrive en phase 3.</p>
              </Card>
            </div>
          )}
        </div>

        {splits.length > 0 && (
          <div className="contents lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col lg:gap-grid-gap">
            <div className="order-3 lg:order-none">
              <PaceCard splits={splits} avgPace={actual?.avgPace ?? 0} zone={session?.targetPace} />
            </div>
            <div className="order-4 lg:order-none">
              <HrCard splits={splits} zone={session?.targetHr} />
            </div>
            <div className="order-5 lg:order-none">
              <SplitsCard splits={splits} hrMax={session?.targetHr.max} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Feeling({ journal }: { journal: NonNullable<ActivityDetail["journal"]> }) {
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-3">
        <Stat variant="compare" label="Ressenti" value={journal.feeling ? `${journal.feeling} ${formatFeeling(journal.feeling)}` : "—"} />
        <Stat variant="compare" label="RPE" value={journal.rpe ? `${journal.rpe}/10` : "—"} />
      </dl>
      {journal.rpe && (
        <div className="grid grid-cols-10 gap-1" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={`h-2 rounded-ctl ${i < journal.rpe! ? "bg-accent" : "bg-surface-raised"}`} />
          ))}
        </div>
      )}
      {journal.painNote && <p className="text-body-sm text-text-muted">Douleur : {journal.painNote}</p>}
      {journal.comment && <blockquote className="rounded-md bg-surface-raised p-3.5 text-body-sm text-text italic">{journal.comment}</blockquote>}
    </div>
  );
}

function ZoneChip({ inZone, warn }: { inZone: boolean; warn: string }) {
  return inZone ? (
    <Chip tone="good" glyph="✓">
      Dans la zone
    </Chip>
  ) : (
    <Chip tone="warn">{warn}</Chip>
  );
}

function ChartCard({ label, badge, children }: { label: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <Card label={label} badge={badge}>
      <div className="flex flex-col gap-4">{children}</div>
    </Card>
  );
}

function PaceCard({ splits, avgPace, zone }: { splits: KmSplit[]; avgPace: number; zone?: Range }) {
  const values = splits.map((s) => s.paceS);
  const refs = zone ? [zone.min, zone.min, zone.max] : [avgPace];
  const g = lineGeometry(values, refs, { invert: true });
  return (
    <ChartCard label="Allure" badge={zone ? <ZoneChip inZone={paceGap(avgPace, zone) === 0} warn="Hors zone" /> : undefined}>
      <dl>
        <Stat label="/km moy." value={avgPace > 0 ? formatPaceValue(avgPace) : "—"} />
      </dl>
      <TrendChart
        points={g.points}
        targetY={g.refY[0]}
        targetLabel={zone ? `Borne rapide ${formatPaceValue(zone.min)}` : `Moyenne ${formatPaceValue(avgPace)}`}
        zone={zone ? { fromY: g.refY[1], toY: g.refY[2], label: `Zone visée ${formatPaceRangeValue(zone)}` } : undefined}
        lastLabel={`km ${splits.length} · ${formatPaceValue(values[values.length - 1])} /km`}
        ariaLabel={`Allure km par km : ${values.map(formatPaceValue).join(", ")}${zone ? `. Zone visée ${formatPaceRangeValue(zone)}` : ""}.`}
      />
    </ChartCard>
  );
}

function HrCard({ splits, zone }: { splits: KmSplit[]; zone?: Range }) {
  const withHr = splits.filter((s): s is KmSplit & { avgHr: number } => s.avgHr !== null);
  if (withHr.length === 0) return null;
  const values = withHr.map((s) => s.avgHr);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const drift = zone ? endHrDrift(splits, zone.max) : false;
  const refs = zone ? [zone.max, zone.min, zone.max] : [avg];
  const g = lineGeometry(values, refs);
  return (
    <ChartCard
      label="Fréquence cardiaque"
      badge={
        drift ? (
          <Chip tone="warn">Dérive en fin</Chip>
        ) : zone ? (
          <ZoneChip inZone={values.every((v) => v <= zone.max)} warn="Au-dessus de la zone" />
        ) : undefined
      }
    >
      <dl>
        <Stat label="bpm, moyenne des km" value={String(avg)} />
      </dl>
      <TrendChart
        points={g.points}
        targetY={g.refY[0]}
        targetLabel={zone ? `Haut de zone ${zone.max}` : `Moyenne ${avg}`}
        zone={zone ? { fromY: g.refY[1], toY: g.refY[2], label: `Zone visée ${zone.min}–${zone.max}` } : undefined}
        lastLabel={`km ${withHr.length} · ${values[values.length - 1]} bpm`}
        ariaLabel={`FC km par km : ${values.join(", ")}${zone ? `. Zone visée ${zone.min} à ${zone.max}` : ""}${drift ? ". Dérive en fin de sortie" : ""}.`}
      />
    </ChartCard>
  );
}

function SplitsCard({ splits, hrMax }: { splits: KmSplit[]; hrMax?: number }) {
  const columns: KmSplit[][] = [];
  for (let i = 0; i < splits.length; i += SPLITS_PER_COLUMN) columns.push(splits.slice(i, i + SPLITS_PER_COLUMN));
  return (
    <Card label="Tours km par km">
      <div className="grid items-start gap-x-8 lg:grid-cols-2">
        {columns.map((col, c) => (
          <table key={c} className={`w-full ${c > 0 ? "max-lg:mt-0 max-lg:[&_thead]:hidden" : ""}`}>
            <thead>
              <tr className="text-micro text-text-subtle uppercase">
                <th scope="col" className="pb-2 text-left">
                  Km
                </th>
                <th scope="col" className="pb-2 text-right">
                  Allure
                </th>
                <th scope="col" className="pb-2 text-right">
                  FC
                </th>
              </tr>
            </thead>
            <tbody>
              {col.map((s) => {
                const over = hrMax !== undefined && s.avgHr !== null && s.avgHr > hrMax;
                return (
                  <tr key={s.km} className="border-t-(length:--border-hairline) border-line font-display text-title-sm tabular-nums">
                    <td className="py-2 text-left">
                      {s.km}
                      {s.distanceM < 1000 && <span className="ml-1 text-caption text-text-subtle">({formatDistance(s.distanceM, 1)})</span>}
                    </td>
                    <td className="py-2 text-right">{formatPaceValue(s.paceS)}</td>
                    <td className={`py-2 text-right ${over ? "text-accent-ink" : ""}`}>
                      {s.avgHr ?? "—"}
                      {over && <span className="sr-only"> (au-dessus de la zone)</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}
      </div>
      {hrMax !== undefined && <p className="mt-3 text-caption text-text-muted">FC en couleur : au-dessus de {hrMax}.</p>}
    </Card>
  );
}
