/**
 * Choix unique en pilules (aspect des filtres « Button toggle », D33 : composants existants) :
 * fieldset + radios natifs, sélection en fond text.
 */
export function Choice({ legend, name, options, defaultValue }: { legend: string; name: string; options: { value: string; label: string }[]; defaultValue: string }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-label text-text">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="inline-flex min-h-(--touch-min) cursor-pointer items-center rounded-pill border-(length:--border-hairline) border-line bg-surface px-4 text-body-sm font-bold text-text-muted has-checked:border-text has-checked:bg-text has-checked:text-surface has-focus-visible:outline-(length:--border-focus) has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring"
          >
            <input type="radio" name={name} value={o.value} defaultChecked={o.value === defaultValue} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
