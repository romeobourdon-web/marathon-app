import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "./card";
import { Chip, type ChipVariant } from "./chip";
import { Icon } from "./icons";
import { Stat } from "./stat";
import type { Tone } from "./tone";

/** Distance déjà formatée, valeur et unité séparées (lib/format : formatDistanceParts). */
type Distance = { value: string; unit: string };

/** Une colonne prévu / réalisé (Stat compare) : valeurs déjà formatées, écart signé déjà calculé. */
export type SessionMetric = { label: string; actual: string; unit?: string; planned: string; delta?: string };

type Common = {
  /** En-tête de carte : « Séance du jour », « Prochaine séance », « mar. 17 nov. »… */
  label: string;
  title: string;
  badge?: ReactNode;
  detailHref?: string;
  /** Libellé du lien de détail (par défaut « Détail de la séance »). */
  detailLabel?: string;
  /** Type de séance en Chip (v2.1) : quality = fractionné, seuil, allure, course ; long = sortie longue. */
  type?: { label: string; tone: Extract<ChipVariant, "neutral" | "quality" | "long"> };
  /** Ligne d'accent sous l'en-tête (« Demain · dimanche 15 nov. »). */
  when?: string;
};

export type SessionCardProps = Common &
  (
    | {
        variant: "planned";
        distance: Distance;
        /** Consignes courtes (v1) : affichées en Chip si `details` est absent. */
        instructions: string[];
        /** Consigne en texte courant (v2.1). */
        details?: string;
        /** Tuile allure (accent-soft) et tuile FC, déjà formatées. */
        pace?: string;
        hr?: string;
        /** Pied de carte (ex. Chip « Aujourd'hui : repos »). */
        footer?: ReactNode;
      }
    | {
        variant: "done";
        planned: Distance;
        done: Distance;
        /** Écart déjà calculé et formaté par engine/ + lib/format (« −0,6 »), avec son verdict. */
        delta: { value: string; unit: string; word: string; tone: Tone };
        instructions: string[];
        /** Colonnes allure et FC en plus de la distance (v2.1). */
        metrics?: SessionMetric[];
      }
    | { variant: "skipped" }
    | { variant: "rest"; note?: string }
  );

/** Séance du jour ou d'un jour : prévue, réalisée (prévu · réalisé · écart), non réalisée ou repos (DESIGN.md §5). */
export function SessionCard(props: SessionCardProps) {
  const { label, title, badge, detailHref, detailLabel = "Détail de la séance", type, when } = props;
  const headBadge = badge ?? (type ? <Chip tone={type.tone}>{type.label}</Chip> : undefined);

  return (
    <Card label={label} badge={headBadge}>
      <div className="flex flex-col gap-4">
        {when && <p className="-mt-2 text-label text-accent-ink">{when}</p>}
        <h3 className="font-display text-title text-text">{title}</h3>

        {props.variant === "rest" && props.note && <p className="text-body text-text-muted">{props.note}</p>}

        {props.variant === "skipped" && (
          <div>
            <Chip tone="warn" glyph="✕">
              Non réalisée
            </Chip>
          </div>
        )}

        {props.variant === "planned" && (
          <>
            {props.details ? (
              <p className="-mt-2 text-body text-text-muted">{props.details}</p>
            ) : (
              props.instructions.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Consignes">
                  {props.instructions.map((i) => (
                    <li key={i}>
                      <Chip>{i}</Chip>
                    </li>
                  ))}
                </ul>
              )
            )}
            <dl className="grid grid-cols-3 gap-2.5">
              <Stat variant="tile" label="distance" value={props.distance.value} unit={props.distance.unit} />
              {props.pace && <Stat variant="tile" accent compact label="allure /km" value={props.pace} />}
              {props.hr && <Stat variant="tile" compact label="FC (bpm)" value={props.hr} />}
            </dl>
            {props.footer && <div className="flex flex-wrap items-center justify-between gap-3">{props.footer}</div>}
          </>
        )}

        {props.variant === "done" && (
          <dl className="grid grid-cols-3 gap-3 border-t-(length:--border-hairline) border-line pt-4 lg:gap-4">
            <Stat
              variant="compare"
              label="Distance"
              value={props.done.value}
              unit={props.done.unit}
              planned={`${props.planned.value} ${props.planned.unit}`}
              delta={`${props.delta.value} ${props.delta.unit}`}
              verdict={{ word: props.delta.word, tone: props.delta.tone }}
            />
            {(props.metrics ?? []).map((m) => (
              <Stat key={m.label} variant="compare" label={m.label} value={m.actual} unit={m.unit} planned={m.planned} delta={m.delta} />
            ))}
          </dl>
        )}

        {detailHref && (
          <Link
            href={detailHref}
            className="focus-ring -mx-2 inline-flex min-h-(--touch-min) items-center gap-1 self-start rounded-sm px-2 text-label text-accent-ink"
          >
            {detailLabel}
            <Icon name="chevron" className="size-4" />
          </Link>
        )}
      </div>
    </Card>
  );
}
