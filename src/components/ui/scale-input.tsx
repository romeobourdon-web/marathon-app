type ScaleInputProps = {
  legend: string;
  name: string;
  /** Libellés des extrêmes : le premier et le dernier niveau sont toujours nommés. */
  lowLabel: string;
  highLabel: string;
  defaultValue?: number;
  required?: boolean;
  /** Nombre de niveaux : 5 (ressenti, questionnaire) ou 10 (RPE). */
  max?: 5 | 10;
  /** Mot affiché sous la sélection, un par niveau (ex. Épuisé · Difficile · Correct · Bien · Excellent). */
  words?: string[];
};

// Mot sous la sélection : affiché quand le radio du même niveau est coché (CSS seul, sans JavaScript).
const WORD_VISIBLE: Record<number, string> = {
  1: "group-has-[input[value='1']:checked]:block",
  2: "group-has-[input[value='2']:checked]:block",
  3: "group-has-[input[value='3']:checked]:block",
  4: "group-has-[input[value='4']:checked]:block",
  5: "group-has-[input[value='5']:checked]:block",
  6: "group-has-[input[value='6']:checked]:block",
  7: "group-has-[input[value='7']:checked]:block",
  8: "group-has-[input[value='8']:checked]:block",
  9: "group-has-[input[value='9']:checked]:block",
  10: "group-has-[input[value='10']:checked]:block",
};

/**
 * Échelle nommée 1–5 (ou 1–10 pour le RPE), à la place des emoji (DESIGN.md §2.7, §5) :
 * fieldset + radios natifs, segments ≥ 44 px sur téléphone (40 px sur PC), sélection en accent-ink.
 */
export function ScaleInput({ legend, name, lowLabel, highLabel, defaultValue, required, max = 5, words }: ScaleInputProps) {
  const values = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <fieldset className="group flex flex-col gap-2">
      <legend className="mb-2 text-label text-text">{legend}</legend>
      <div className={`grid ${max === 10 ? "grid-cols-10 gap-1" : "grid-cols-5 gap-1.5"}`}>
        {values.map((v) => (
          <label
            key={v}
            className="flex min-h-(--touch-min) cursor-pointer items-center justify-center rounded-md bg-surface-raised font-display text-num-sm text-text-muted tabular-nums transition-colors duration-(--motion-fast) ease-out motion-reduce:transition-none hover:text-text has-checked:bg-accent-ink has-checked:text-on-accent has-focus-visible:outline-(length:--border-focus) has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring lg:min-h-10"
          >
            <input type="radio" name={name} value={v} defaultChecked={defaultValue === v} required={required} className="sr-only" />
            {v}
            {v === 1 && <span className="sr-only"> : {lowLabel}</span>}
            {v === max && <span className="sr-only"> : {highLabel}</span>}
            {words?.[v - 1] && v !== 1 && v !== max && <span className="sr-only"> : {words[v - 1]}</span>}
          </label>
        ))}
      </div>
      <div className="flex justify-between text-caption text-text-subtle" aria-hidden="true">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      {words && (
        <p className="text-body-sm font-semibold text-accent-ink" aria-hidden="true">
          {values.map((v) => (
            <span key={v} className={`hidden ${WORD_VISIBLE[v]}`}>
              {words[v - 1]}
            </span>
          ))}
        </p>
      )}
    </fieldset>
  );
}
