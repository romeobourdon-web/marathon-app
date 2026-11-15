import type { ReactNode } from "react";
import { ButtonLink } from "./button";
import { Card } from "./card";
import { Chip } from "./chip";
import { type StatProps } from "./stat";
import { TONE_GLYPH, TONE_STROKE, TONE_TEXT, type Tone } from "./tone";

type ScoreCardProps = {
  label: string;
  /** Score 0–100 calculé par engine/ ; null = pas de score (jauge masquée). */
  score: number | null;
  /** Statut tout fait : ton de la jauge + mot (jamais la couleur seule). */
  status?: { word: string; tone: Tone };
  /** Verdict en une phrase. */
  verdict: string;
  /** Les 4 mesures de la carte (valeur + libellé). */
  stats: StatProps[];
  /** Lien vers le questionnaire du matin, tant qu'il n'est pas rempli. */
  questionnaire?: { href: string; label: string };
  badge?: ReactNode;
};

/** Jauge circulaire : pathLength=100 permet de passer le score tel quel, sans calcul dans l'UI. */
function Gauge({ score, status }: { score: number; status?: { word: string; tone: Tone } }) {
  const tone = status?.tone ?? "neutral";
  return (
    <div
      role="img"
      aria-label={`Forme : ${score} sur 100${status ? `, ${status.word}` : ""}`}
      className="relative grid size-(--ring-size) shrink-0 place-items-center"
    >
      <svg viewBox="0 0 124 124" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle cx="62" cy="62" r="54" fill="none" className="stroke-track stroke-(length:--stroke-ring)" />
        <circle
          cx="62"
          cy="62"
          r="54"
          fill="none"
          pathLength={100}
          strokeDasharray={`${score} 100`}
          strokeLinecap="round"
          className={`stroke-(length:--stroke-ring) ${TONE_STROKE[tone]}`}
        />
      </svg>
      <span className="flex flex-col items-center" aria-hidden="true">
        <span className="font-display text-num-xl text-text tabular-nums">{score}</span>
        <span className="text-caption text-text-subtle">forme</span>
      </span>
    </div>
  );
}

/** Forme (démo D16) : jauge 0–100, verdict avec glyphe, 4 mesures, bouton questionnaire (DESIGN.md §5). */
export function ScoreCard({ label, score, status, verdict, stats, questionnaire, badge }: ScoreCardProps) {
  return (
    <Card label={label} badge={badge}>
      <div className="flex flex-col">
        <div className="flex items-center gap-4.5">
          {score !== null && <Gauge score={score} status={status} />}
          <div className="flex flex-col items-start gap-1.5">
            {status && <Chip tone={status.tone === "neutral" ? "neutral" : status.tone}>{status.word}</Chip>}
            <p className="text-body-sm text-text-muted">{verdict}</p>
          </div>
        </div>

        <dl className="mt-4.5 grid grid-cols-4 gap-2 border-t-(length:--border-hairline) border-line pt-4">
          {stats.map((s) => (
            <div key={s.label} className="flex min-w-0 flex-col">
              <dt className="order-2 text-caption text-text-subtle">
                {s.label}
                {s.unit && ` · ${s.unit}`}
              </dt>
              <dd className="order-1 font-display text-num-sm text-text tabular-nums">{s.value}</dd>
              {s.verdict && (
                <dd className={`order-3 text-caption font-semibold ${TONE_TEXT[s.verdict.tone]}`}>
                  {s.verdict.tone !== "neutral" && <span aria-hidden="true">{s.verdict.glyph ?? TONE_GLYPH[s.verdict.tone]} </span>}
                  {s.verdict.word}
                </dd>
              )}
            </div>
          ))}
        </dl>

        {questionnaire && (
          <ButtonLink href={questionnaire.href} variant="primary" className="mt-4.5 w-full">
            {questionnaire.label}
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}
