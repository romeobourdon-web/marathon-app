import { Suspense } from "react";
import { connection } from "next/server";
import { AppNav } from "@/components/ui/app-nav";
import { Sheet } from "@/components/ui/sheet";
import { TextField } from "@/components/ui/text-field";
import { todayInParis } from "@/lib/dates";
import { Choice } from "../../seances/ajout/choice";
import { addEventAction } from "../actions";
import { EventsView } from "../events-view";

/** Ajouter une échéance (D33) : écran plein (téléphone), panneau latéral sur Échéances (PC). */
export default function AddEventPage({ searchParams }: PageProps<"/echeances/ajout">) {
  return (
    <>
      <AppNav current="/echeances" />
      <Suspense fallback={null}>
        <Form searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Form({ searchParams }: { searchParams: PageProps<"/echeances/ajout">["searchParams"] }) {
  await connection();
  const error = (await searchParams).erreur !== undefined;
  return (
    <Sheet
      title="Ajouter une échéance"
      closeHref="/echeances"
      action={addEventAction}
      submitLabel="Enregistrer"
      background={
        <main className="mx-auto w-full max-w-content px-page-x pt-8 pb-12">
          <EventsView />
        </main>
      }
    >
      {error && (
        <p role="alert" className="rounded-md bg-alert-soft p-3.5 text-body-sm font-semibold text-alert">
          Vérifie le nom, la date, la distance et l&apos;objectif de temps.
        </p>
      )}
      <TextField id="name" name="name" label="Nom" placeholder="10 km de Lille" maxLength={120} required />
      <Choice
        legend="Type"
        name="kind"
        defaultValue="test"
        options={[
          { value: "test", label: "Test" },
          { value: "race", label: "Course" },
        ]}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField id="date" name="date" type="date" label="Date" min={todayInParis()} required />
        <TextField id="distance" name="distance" label="Distance (km)" inputMode="decimal" placeholder="10" required />
      </div>
      <TextField id="target" name="target" label="Objectif de temps (facultatif)" inputMode="numeric" placeholder="45:00" hint="min:s ou h:min:s" />
    </Sheet>
  );
}
