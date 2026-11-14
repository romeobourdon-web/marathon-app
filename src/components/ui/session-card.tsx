import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "./card";
import { Chip } from "./chip";
import { Icon } from "./icons";
import { TONE_TEXT, type Tone } from "./tone";

/** Distance déjà formatée, valeur et unité séparées (lib/format : formatDistanceParts). */
type Distance = { value: string; unit: string };

type Common = {
  /** En-tête de carte : « Aujourd'hui », « Demain », « mar. 17 nov. »… */
  label: string;
  title: string;
  badge?: ReactNode;
  detailHref?: string;
};

export type SessionCardProps = Common &
  (
    | { variant: "planned"; distance: Distance; instructions: string[] }
    | {
        variant: "done";
        planned: Distance;
        done: Distance;
        /** Écart déjà calculé et formaté par engine/ + lib/format (« −0,6 »), avec son verdict. */
        delta: { value: string; unit: string; word: string; tone: Tone };
        instructions: string[];
      }
    | { variant: "rest"; note: string }
  );

function Hero({ distance }: { distance: Distance }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="font-mono text-num-hero text-text">{distance.value}</span>
      <span className="text-body text-text-muted">{distance.unit}</span>
    </p>
  );
}

/** Séance du jour ou d'un jour : prévue, réalisée (prévu · réalisé · écart) ou repos (DESIGN.md §4). */
export function SessionCard(props: SessionCardProps) {
  const { label, title, badge, detailHref } = props;
  return (
    <Card label={label} badge={badge}>
      <div className="flex flex-col gap-4">
        {props.variant === "planned" && <Hero distance={props.distance} />}
        {props.variant === "done" && <Hero distance={props.done} />}

        <h3 className="text-title text-text">{title}</h3>

        {props.variant === "rest" && <p className="text-body text-text-muted">{props.note}</p>}

        {props.variant === "done" && (
          <dl className="grid grid-cols-3 gap-3 border-t-(length:--border-hairline) border-line pt-4">
            <div className="flex flex-col gap-1">
              <dt className="text-caption text-text-muted">Prévu</dt>
              <dd className="font-mono text-num-sm text-text-muted">
                {props.planned.value} {props.planned.unit}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-caption text-text-muted">Réalisé</dt>
              <dd className="font-mono text-num-sm text-text">
                {props.done.value} {props.done.unit}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-caption text-text-muted">Écart</dt>
              <dd className={`font-mono text-num-sm ${TONE_TEXT[props.delta.tone]}`}>
                {props.delta.value} {props.delta.unit}
              </dd>
              <dd className={`text-caption ${TONE_TEXT[props.delta.tone]}`}>{props.delta.word}</dd>
            </div>
          </dl>
        )}

        {props.variant !== "rest" && props.instructions.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Consignes">
            {props.instructions.map((instruction) => (
              <li key={instruction}>
                <Chip>{instruction}</Chip>
              </li>
            ))}
          </ul>
        )}

        {detailHref && (
          <Link
            href={detailHref}
            className="focus-ring -mx-2 inline-flex min-h-(--touch-min) items-center gap-1 self-start rounded-sm px-2 text-body-sm text-accent"
          >
            Détail de la séance
            <Icon name="chevron" className="size-4" />
          </Link>
        )}
      </div>
    </Card>
  );
}
