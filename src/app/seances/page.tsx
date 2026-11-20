import { Suspense } from "react";
import { connection } from "next/server";
import { AppNav } from "@/components/ui/app-nav";
import { SessionsView } from "./sessions-view";

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
  return <SessionsView filterParam={Array.isArray(param) ? param[0] : param} />;
}
