import { AppNav } from "@/components/ui/app-nav";
import { Card } from "@/components/ui/card";

/** Échéances : écran à venir (phase 2) ; la destination existe déjà dans la navigation. */
export default function DeadlinesPage() {
  return (
    <>
      <AppNav current="/echeances" />
      <main className="mx-auto w-full max-w-content px-page-x pt-6 pb-28 lg:pt-8 lg:pb-12">
        <h1 className="mb-4 font-display text-title-lg text-text">Échéances</h1>
        <Card>
          <p className="text-body text-text-muted">Bientôt : les courses de préparation et les tests, sur la frise du plan.</p>
        </Card>
      </main>
    </>
  );
}
