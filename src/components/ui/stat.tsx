import { TONE_TEXT, type Tone } from "./tone";

export type StatProps = {
  label: string;
  /** Valeur déjà formatée par lib/format. */
  value: string;
  unit?: string;
  /** Verdict en mots : obligatoire dès qu'un ton d'état colore la mesure. */
  verdict?: { word: string; tone: Tone };
};

/**
 * Une mesure (DESIGN.md §4). À placer dans un <dl> : la mesure est un couple <dt>/<dd>.
 * Valeur en num-md (17 px) : DESIGN.md indique 19 px, qui n'existe pas dans l'échelle de tokens.
 */
export function Stat({ label, value, unit, verdict }: StatProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-label text-text-muted">{label}</dt>
      <dd className="flex items-baseline gap-1">
        <span className="font-mono text-num-md text-text">{value}</span>
        {unit && <span className="text-caption text-text-muted">{unit}</span>}
      </dd>
      {verdict && <dd className={`text-caption ${TONE_TEXT[verdict.tone]}`}>{verdict.word}</dd>}
    </div>
  );
}
