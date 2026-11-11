// Mini-graphe du volume hebdomadaire : barre grise = prévu, barre corail = réalisé.
// Survol (ou tap sur mobile) d'une colonne → info-bulle avec les valeurs.

import type { VolumePoint } from "@/planner/summary";
import { formatKm } from "@/lib/format";

export function VolumeChart({ points }: { points: VolumePoint[] }) {
  const max = Math.ceil(Math.max(...points.map((p) => p.plannedKm), ...points.map((p) => p.doneKm ?? 0)) / 20) * 20;
  const gridLines = [max, max / 2];

  return (
    <figure>
      <div className="relative h-40 sm:h-48">
        {/* Grille discrète */}
        {gridLines.map((g) => (
          <div key={g} className="absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${(g / max) * 100}%` }}>
            <span className="absolute -top-2.5 right-0 bg-surface pl-1 text-[11px] text-ink-3 tabular">{g} km</span>
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 border-t border-planned-edge/60" />

        {/* Colonnes */}
        <div className="absolute inset-0 right-10 flex items-end gap-1.5 sm:gap-2.5">
          {points.map((p, i) => {
            const future = p.doneKm === null;
            const label = future
              ? `Semaine ${p.week} : ${formatKm(p.plannedKm)} km prévus`
              : `Semaine ${p.week} : ${formatKm(p.doneKm!)} km réalisés sur ${formatKm(p.plannedKm)} km prévus`;
            return (
              <div
                key={p.week}
                tabIndex={0}
                aria-label={label}
                className="group relative flex h-full flex-1 items-end justify-center outline-none"
              >
                {/* Prévu */}
                <div
                  className={`absolute bottom-0 w-full max-w-9 rounded-t-[4px] ${
                    future ? "border-2 border-b-0 border-dashed border-planned-edge/70" : "bg-planned/70"
                  }`}
                  style={{ height: `${(p.plannedKm / max) * 100}%` }}
                />
                {/* Réalisé */}
                {!future && (
                  <div
                    className={`animate-grow relative w-[62%] max-w-6 rounded-t-[4px] ${p.isCurrent ? "bg-accent" : "bg-accent/80"}`}
                    style={{ height: `${(p.doneKm! / max) * 100}%`, animationDelay: `${i * 50}ms` }}
                  />
                )}
                {/* Info-bulle */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg group-hover:block group-focus:block">
                  <div className="font-bold">Semaine {p.week}</div>
                  {!future && <div className="tabular">Réalisé : {formatKm(p.doneKm!)} km</div>}
                  <div className="tabular text-white/75">Prévu : {formatKm(p.plannedKm)} km</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Axe des semaines */}
      <div className="mt-2 mr-10 flex gap-1.5 sm:gap-2.5">
        {points.map((p) => (
          <div key={p.week} className={`flex-1 text-center text-[11px] tabular ${p.isCurrent ? "font-bold text-ink" : "text-ink-3"}`}>
            S{p.week}
          </div>
        ))}
      </div>

      <figcaption className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-accent" /> Réalisé
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-planned" /> Prévu
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border-2 border-dashed border-planned-edge" /> À venir
        </span>
      </figcaption>
    </figure>
  );
}
