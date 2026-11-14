const VALUES = [1, 2, 3, 4, 5] as const;

type ScaleInputProps = {
  legend: string;
  name: string;
  /** Libellés des extrêmes : 1 et 5 sont toujours nommés. */
  lowLabel: string;
  highLabel: string;
  defaultValue?: 1 | 2 | 3 | 4 | 5;
  required?: boolean;
};

/**
 * Échelle 1–5 du questionnaire (DESIGN.md §4) : fieldset + radios natifs,
 * 5 segments d'au moins 44 px, sélection en accent. Fonctionne sans JavaScript.
 */
export function ScaleInput({ legend, name, lowLabel, highLabel, defaultValue, required }: ScaleInputProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-label text-text-muted">{legend}</legend>
      <div className="grid grid-cols-5 gap-1 rounded-md bg-surface-raised p-1">
        {VALUES.map((v) => (
          <label
            key={v}
            className="flex min-h-(--touch-min) cursor-pointer items-center justify-center rounded-sm font-mono text-num-md text-text transition-colors duration-(--motion-fast) ease-out motion-reduce:transition-none hover:bg-track has-checked:bg-accent has-checked:text-on-accent has-focus-visible:outline-(length:--border-focus) has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring"
          >
            <input type="radio" name={name} value={v} defaultChecked={defaultValue === v} required={required} className="sr-only" />
            {v}
            {v === 1 && <span className="sr-only"> : {lowLabel}</span>}
            {v === 5 && <span className="sr-only"> : {highLabel}</span>}
          </label>
        ))}
      </div>
      <div className="flex justify-between text-caption text-text-muted" aria-hidden="true">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </fieldset>
  );
}
