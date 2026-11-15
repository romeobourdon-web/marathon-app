type StatusBandProps = {
  /** Date du jour, déjà formatée (« sam. 14 nov. ») : lue par les lecteurs d'écran. */
  date: string;
  /** Semaine du plan (« 8/30 ») ou « hors plan ». */
  week: string;
  /** Compte à rebours (« J-155 ») : le chiffre héros du bandeau. */
  countdown: string;
  /** Course et date (« Marathon du Lac d'Annecy · dim. 18 avril 2027 »). */
  race?: string;
  /** Reste en clair (« soit 22 semaines et 1 jour »). */
  remaining?: string;
  /** Tuiles Objectif / Allure cible, valeurs déjà formatées. */
  tiles?: { label: string; value: string; unit?: string }[];
  /** Barre « Semaine n/30 · phase · % » : pourcentage déjà calculé par engine/. */
  progress?: { phase: string; pct: number; pctLabel: string };
};

/**
 * Le bandeau corail (DESIGN.md §5) : seule signature visuelle, et seulement sur Aujourd'hui.
 * Téléphone : empilé (≤ 300 px de haut). PC : J-n à gauche, tuiles et barre à droite.
 */
export function StatusBand({ date, week, countdown, race, remaining, tiles = [], progress }: StatusBandProps) {
  return (
    <section
      aria-label={`Compte à rebours, aujourd'hui ${date}`}
      className="relative overflow-hidden rounded-lg bg-linear-135 from-hero-from to-hero-to p-6 text-on-hero shadow-hero lg:p-8"
    >
      {/* Courbe de profil décorative, blanc à 12 % */}
      <svg
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 w-full fill-on-hero stroke-on-hero opacity-12"
      >
        <path d="M0 160 C 80 120, 120 170, 200 130 S 330 60, 400 100 S 520 40, 600 70 L600 200 L0 200 Z" className="stroke-none" />
        <path d="M0 180 C 100 150, 160 190, 260 160 S 420 110, 600 130" className="fill-none stroke-(length:--stroke-chart)" />
      </svg>

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div>
          {race && <p className="text-label">{race}</p>}
          <p className="mt-1 font-display text-num-hero tabular-nums">{countdown}</p>
          {remaining && <p className="mt-2 text-label">{remaining}</p>}
        </div>

        {(tiles.length > 0 || progress) && (
          <div className="grid grid-cols-2 gap-3 lg:w-96">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-md bg-hero-tile px-4 py-3.5">
                <p className="text-label">{t.label}</p>
                <p className="font-display text-num-lg tabular-nums">
                  {t.value}
                  {t.unit && <span className="ml-1 text-body-sm font-semibold">{t.unit}</span>}
                </p>
              </div>
            ))}
            {progress && (
              <div className="col-span-2">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-label">
                  <span>
                    Semaine {week} · {progress.phase}
                  </span>
                  <span className="font-display tabular-nums">{progress.pctLabel}</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Avancement du plan"
                  aria-valuenow={progress.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 overflow-hidden rounded-pill bg-on-hero/25"
                >
                  <div className="h-full rounded-pill bg-on-hero" style={{ width: `${progress.pct}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
