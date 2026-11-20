import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AppNav } from "@/components/ui/app-nav";
import { Chip } from "@/components/ui/chip";
import { ScaleInput } from "@/components/ui/scale-input";
import { SESSION_TYPE_TONE } from "@/components/ui/session-type";
import { Sheet } from "@/components/ui/sheet";
import { TextField } from "@/components/ui/text-field";
import { getActivityDetail, getJournal, getSessions } from "@/db/repository";
import { isWalk } from "@/engine/activity";
import { garminFeelTo5, garminRpeTo10 } from "@/engine/device-feel";
import { todayInParis } from "@/lib/dates";
import { parseReturnPath, parseUuid } from "@/lib/form";
import { formatDate, formatDistance, formatPacePerKm, formatSport } from "@/lib/format";
import { TYPE_LABELS } from "@/planner/plan";
import { saveJournalAction } from "../actions";
import { FEELING_WORDS } from "../fields";
import { JournalView } from "../journal-view";

/** Saisie après séance (D20) : ?activity=<id> (séance réalisée) ou ?session=<id> (séance non faite : raison de l'écart). */
export default function EntryPage({ searchParams }: PageProps<"/journal/saisie">) {
  return (
    <>
      <AppNav current="/journal" />
      <Suspense fallback={null}>
        <Form searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/journal/saisie">["searchParams"] }) {
  await connection();
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  const activityId = parseUuid(one(params.activity));
  const sessionId = parseUuid(one(params.session));
  const from = parseReturnPath(one(params.from), "/journal");
  if (!activityId && !sessionId) notFound();

  const sessions = await getSessions(todayInParis());
  const detail = activityId ? await getActivityDetail(activityId) : null;
  if (activityId && !detail) notFound();
  const session = sessionId ? sessions.find((s) => s.id === sessionId) : sessions.find((s) => s.activityIds?.includes(activityId!));
  if (sessionId && !session) notFound();

  const journal = detail ? detail.journal : await getJournal({ sessionId: sessionId! });
  // Pré-remplissage depuis la montre seulement tant qu'aucun journal n'existe (D20)
  const deviceFeel = !journal && detail ? garminFeelTo5(detail.deviceFeel) : null;
  const deviceRpe = !journal && detail ? garminRpeTo10(detail.deviceRpe) : null;

  const a = detail?.activity;
  const date = a?.date ?? session!.date;
  const title = session?.title ?? (a && (isWalk(a) ? "Marche" : formatSport(a.sport)));
  const numbers = a
    ? [formatDistance(a.distanceKm * 1000), a.avgPace !== null ? formatPacePerKm(a.avgPace) : null, a.avgHr ? `${a.avgHr} bpm` : null].filter(Boolean).join(" · ")
    : `prévu : ${formatDistance(session!.distanceKm * 1000, 0)}`;

  return (
    <Sheet
      title={detail ? "Après la séance" : "Séance non réalisée"}
      closeHref={from}
      action={saveJournalAction}
      submitLabel="Enregistrer"
      background={
        <main className="mx-auto w-full max-w-content px-page-x pt-8 pb-12">
          <JournalView />
        </main>
      }
    >
      {activityId && <input type="hidden" name="activity" value={activityId} />}
      {!activityId && sessionId && <input type="hidden" name="session" value={sessionId} />}
      <input type="hidden" name="from" value={from} />

      <div className="rounded-md bg-surface-raised p-4">
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-caption font-semibold text-text-subtle">{formatDate(date, "long")}</span>
          {session ? <Chip tone={SESSION_TYPE_TONE[session.type]}>{TYPE_LABELS[session.type]}</Chip> : <Chip tone="off">Hors plan</Chip>}
          {!detail && (
            <Chip tone="warn" glyph="✕">
              Non réalisée
            </Chip>
          )}
        </p>
        <p className="mt-1 text-body font-semibold text-text">{title}</p>
        <p className="text-body-sm text-text-muted tabular-nums">{numbers}</p>
      </div>

      {detail ? (
        <>
          {(deviceFeel !== null || deviceRpe !== null) && (
            <p className="text-caption text-text-subtle">
              Pré-rempli depuis ta montre :{deviceFeel !== null && ` ressenti ${deviceFeel}`}
              {deviceFeel !== null && deviceRpe !== null && ","}
              {deviceRpe !== null && ` RPE ${deviceRpe}`}. Modifie si besoin.
            </p>
          )}
          <ScaleInput legend="Ressenti" name="feeling" lowLabel="Épuisé" highLabel="Excellent" words={FEELING_WORDS} defaultValue={journal?.feeling ?? deviceFeel ?? undefined} />
          <ScaleInput legend="Effort perçu (RPE)" name="rpe" max={10} lowLabel="Très facile" highLabel="Maximal" defaultValue={journal?.rpe ?? deviceRpe ?? undefined} />
          <ScaleInput legend="Douleur (Achille)" name="pain" lowLabel="Aucune" highLabel="Forte" defaultValue={journal?.pain ?? undefined} />
          <TextField
            id="comment"
            name="comment"
            label="Commentaire"
            hint="Écris à chaud : ce qui a marché, ce qui a coincé."
            multiline
            maxLength={2000}
            defaultValue={journal?.comment ?? ""}
          />
        </>
      ) : (
        <>
          <ScaleInput legend="Douleur (Achille)" name="pain" lowLabel="Aucune" highLabel="Forte" defaultValue={journal?.pain ?? undefined} />
          <TextField
            id="comment"
            name="comment"
            label="Pourquoi la séance n'a pas eu lieu ?"
            hint="Fatigue, douleur, emploi du temps… : ça aide à lire les écarts."
            multiline
            maxLength={2000}
            defaultValue={journal?.comment ?? ""}
          />
        </>
      )}
    </Sheet>
  );
}
