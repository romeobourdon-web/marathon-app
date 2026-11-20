import { TONE_GLYPH, TONE_TEXT, type Tone } from "./tone";

export type StatProps = {
  label: string;
  /** Valeur déjà formatée par lib/format. */
  value: string;
  unit?: string;
  /** Verdict en mots, avec glyphe : obligatoire dès qu'un ton d'état colore la mesure. */
  verdict?: { word: string; tone: Tone; glyph?: string };
  /**
   * default : valeur num-lg + unité + libellé dessous ;
   * tile : tuile (fond surface-raised, ou accent-soft si accent) ;
   * compare : prévu / réalisé (réalisé en grand, « visé … » dessous, écart signé en accent-ink) — v2.1.
   */
  variant?: "default" | "tile" | "compare";
  /** tile : fond accent-soft et valeur en accent-ink. */
  accent?: boolean;
  /** tile : valeur longue (fourchette d'allure) réduite à num-sm. */
  compact?: boolean;
  /** compare : valeur visée, déjà formatée (« 5'45–6'10 »). */
  planned?: string;
  /** compare : écart signé déjà formaté (« −14 s »), affiché en accent-ink. */
  delta?: string;
};

function Verdict({ verdict, className = "" }: { verdict: NonNullable<StatProps["verdict"]>; className?: string }) {
  const glyph = verdict.glyph ?? (verdict.tone === "neutral" ? undefined : TONE_GLYPH[verdict.tone]);
  return (
    <dd className={`text-caption font-semibold ${TONE_TEXT[verdict.tone]} ${className}`}>
      {glyph && <span aria-hidden="true">{glyph} </span>}
      {verdict.word}
    </dd>
  );
}

/**
 * Une mesure (DESIGN.md §5). À placer dans un <dl> : la mesure est un couple <dt>/<dd>.
 * Les valeurs arrivent déjà calculées (engine/, planner/) et formatées (lib/format).
 */
export function Stat({ label, value, unit, verdict, variant = "default", accent = false, compact = false, planned, delta }: StatProps) {
  if (variant === "compare") {
    return (
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-micro text-text-subtle uppercase">{label}</dt>
        <dd className={`font-display text-title-sm tabular-nums ${delta ? "text-accent-ink" : "text-text"}`}>
          {value}
          {unit && <span className="ml-0.5 text-body-sm font-semibold text-text-subtle">{unit}</span>}
        </dd>
        {planned && (
          <dd className="text-caption text-text-subtle tabular-nums">
            visé {planned}
            {delta && <span className="ml-1 font-semibold text-accent-ink">({delta})</span>}
          </dd>
        )}
        {verdict && <Verdict verdict={verdict} />}
      </div>
    );
  }

  if (variant === "tile") {
    return (
      <div className={`flex min-w-0 flex-col gap-1.5 rounded-md p-3.5 ${accent ? "bg-accent-soft" : "bg-surface-raised"}`}>
        <dt className="order-2 text-caption text-text-muted">{label}</dt>
        <dd
          className={`order-1 font-display whitespace-nowrap tabular-nums ${compact ? "text-num-sm" : "text-num-md"} ${
            accent ? "text-accent-ink" : "text-text"
          }`}
        >
          {value}
          {unit && <span className="ml-0.5 text-body font-semibold text-text-subtle">{unit}</span>}
        </dd>
        {verdict && <Verdict verdict={verdict} className="order-3" />}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col">
      <dt className="order-2 mt-1.5 text-body-sm text-text-muted">{label}</dt>
      <dd className="order-1 font-display text-num-lg text-text tabular-nums">
        {value}
        {unit && <span className="ml-1 text-title-sm text-text-subtle">{unit}</span>}
      </dd>
      {verdict && <Verdict verdict={verdict} className="order-3 mt-1" />}
    </div>
  );
}
