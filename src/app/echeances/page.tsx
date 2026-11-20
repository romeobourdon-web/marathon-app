import { Suspense } from "react";
import { connection } from "next/server";
import { AppNav } from "@/components/ui/app-nav";
import { EventsView } from "./events-view";

export default function DeadlinesPage() {
  return (
    <>
      <AppNav current="/echeances" />
      <main className="mx-auto w-full max-w-content px-page-x pt-6 pb-28 lg:pt-8 lg:pb-12">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-surface-raised" />}>
          <Content />
        </Suspense>
      </main>
    </>
  );
}

async function Content() {
  await connection();
  return <EventsView />;
}
