import type { ReactNode } from "react";
import { ButtonLink } from "./button";
import { Card } from "./card";
import { Stat, type StatProps } from "./stat";
import { TONE_STROKE, TONE_TEXT, type Tone } from "./tone";

type ScoreCardProps = {
  label: string;
  /** Score 0–100 calculé par engine/ ; null = pas de score (jauge masquée). */
  score: number | null;
  /** Statut tout fait : ton de la jauge + mot (jamais la couleur seule). */
  status?: { word: string; tone: Tone };
  /** Verdict en une phrase. */
  verdict: string;
  /** Les 4 mesures de la carte. */
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
      aria-label={`Score de forme : ${score} sur 100${status ? `, ${status.word}` : ""}`}
      className="relative grid size-(--ring-size) shrink-0 place-items-center"
    >
      <svg viewBox="0 0 124 124" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle cx="62" cy="62" r="56" fill="none" className="stroke-track stroke-(length:--stroke-ring)" />
        <circle
          cx="62"
          cy="62"
          r="56"
          fill="none"
          pathLength={100}
          strokeDasharray={`${score} 100`}
          strokeLinecap="round"
          className={`stroke-(length:--stroke-ring) ${TONE_STROKE[tone]}`}
        />
      </svg>
      <span className="font-mono text-num-xl text-text" aria-hidden="true">
        {score}
      </span>
    </div>
  );
}

/** État de forme : jauge 0–100, verdict en mots, 4 Stat, bouton questionnaire (DESIGN.md §4). */
export function ScoreCard({ label, score, status, verdict, stats, questionnaire, badge }: ScoreCardProps) {
  return (
    <Card label={label} badge={badge}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-5">
          {score !== null && <Gauge score={score} status={status} />}
          <div className="flex flex-col gap-1">
            {status && <p className={`text-title ${TONE_TEXT[status.tone]}`}>{status.word}</p>}
            <p className="text-body-sm text-text-muted">{verdict}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </dl>

        {questionnaire && (
          <ButtonLink href={questionnaire.href} variant="secondary" className="w-full">
            {questionnaire.label}
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}
