type StatusBandProps = {
  /** Date du jour, déjà formatée (« sam. 14 nov. »). */
  date: string;
  /** Semaine du plan (« 9 / 30 ») ou mention « hors plan ». */
  week: string;
  /** Compte à rebours (« J-140 ») : seule valeur en accent. */
  countdown: string;
};

/** Bandeau Date · Semaine · J-n : 3 colonnes séparées de filets (DESIGN.md §4). */
export function StatusBand({ date, week, countdown }: StatusBandProps) {
  const items = [
    { label: "Date", value: date, accent: false },
    { label: "Semaine", value: week, accent: false },
    { label: "Course", value: countdown, accent: true },
  ];
  return (
    <dl className="grid grid-cols-3 divide-x-(length:--border-hairline) divide-line border-y-(length:--border-hairline) border-line py-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1 px-3 first:pl-0 last:pr-0">
          <dt className="text-caption text-text-muted">{item.label}</dt>
          <dd className={`font-mono text-num-md ${item.accent ? "text-accent" : "text-text"}`}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
