import { Suspense } from "react";
import { connection } from "next/server";
import { AppNav } from "@/components/ui/app-nav";
import { Sheet } from "@/components/ui/sheet";
import { TextField } from "@/components/ui/text-field";
import { MANUAL_SPORTS } from "@/connectors/manual";
import { todayInParis } from "@/lib/dates";
import { formatSport } from "@/lib/format";
import { SessionsView } from "../sessions-view";
import { addManualRunAction } from "./actions";
import { Choice } from "./choice";

/** Ajouter une sortie faite sans montre (D18, D33) : écran plein (téléphone), panneau latéral (PC). */
export default function AddRunPage({ searchParams }: PageProps<"/seances/ajout">) {
  return (
    <>
      <AppNav current="/seances" />
      <Suspense fallback={null}>
        <Form searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/seances/ajout">["searchParams"] }) {
  await connection();
  const error = (await searchParams).erreur !== undefined;
  return (
    <Sheet
      title="Ajouter une sortie"
      closeHref="/seances"
      action={addManualRunAction}
      submitLabel="Enregistrer"
      background={
        <main className="mx-auto w-full max-w-content px-page-x pt-8 pb-12">
          <SessionsView />
        </main>
      }
    >
      <p className="text-body-sm text-text-muted">Une sortie faite sans montre. Elle compte dans le plan si c&apos;est une course.</p>
      {error && (
        <p role="alert" className="rounded-md bg-alert-soft p-3.5 text-body-sm font-semibold text-alert">
          Vérifie la date, l&apos;heure, la distance et la durée.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <TextField id="date" name="date" type="date" label="Date" defaultValue={todayInParis()} max={todayInParis()} required />
        <TextField id="time" name="time" type="time" label="Heure de départ" defaultValue="18:00" required />
      </div>
      <Choice legend="Sport" name="sport" defaultValue="running" options={MANUAL_SPORTS.map((s) => ({ value: s, label: formatSport(s) }))} />
      <div className="grid grid-cols-2 gap-3">
        <TextField id="distance" name="distance" label="Distance (km)" inputMode="decimal" placeholder="10,5" required />
        <TextField id="duration" name="duration" label="Durée" inputMode="numeric" placeholder="52:30" hint="min:s ou h:min:s" required />
      </div>
      <TextField id="hr" name="hr" label="FC moyenne (facultatif)" inputMode="numeric" placeholder="bpm" />
    </Sheet>
  );
}
