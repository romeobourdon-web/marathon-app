import { Suspense } from "react";
import { connection } from "next/server";
import { AppNav } from "@/components/ui/app-nav";
import { Sheet } from "@/components/ui/sheet";
import { getCheckin } from "@/db/repository";
import { todayInParis } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { saveCheckinAction } from "../actions";
import { CheckinFields } from "../fields";
import { JournalView } from "../journal-view";

/** Questionnaire du matin : écran plein (téléphone), panneau latéral sur le Journal (PC). */
export default function MorningPage() {
  return (
    <>
      <AppNav current="/journal" />
      <Suspense fallback={null}>
        <Form />
      </Suspense>
    </>
  );
}

async function Form() {
  await connection();
  const today = todayInParis();
  const checkin = await getCheckin(today);
  return (
    <Sheet
      title="Questionnaire du matin"
      closeHref="/journal"
      action={saveCheckinAction}
      submitLabel={checkin ? "Enregistrer" : "Envoyer"}
      background={
        <main className="mx-auto w-full max-w-content px-page-x pt-8 pb-12">
          <JournalView />
        </main>
      }
    >
      <input type="hidden" name="from" value="/journal" />
      <p className="text-caption text-text-subtle">{formatDate(today, "long")} · une fois par jour, modifiable.</p>
      <CheckinFields checkin={checkin} />
    </Sheet>
  );
}
