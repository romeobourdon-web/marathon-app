import type { ReactNode } from "react";
import { TONE_GLYPH, type Tone } from "./tone";

/**
 * Variantes v2.1 (DESIGN.md §5) :
 *  - neutral : raised / muted ; quality : séances de qualité (fractionné, seuil, allure, course) ; long : sortie longue ;
 *  - good / info / warn / alert : états, toujours avec glyphe + mot ;
 *  - off : « Hors plan » (sorties d'avant le plan, autre sport, marche — D22, D28) ;
 *  - demo : valeur fictive « démo » ou « exemple » (D16).
 */
export type ChipVariant = Tone | "quality" | "long" | "off" | "demo";

const VARIANTS: Record<ChipVariant, string> = {
  neutral: "bg-surface-raised text-text-muted",
  quality: "bg-accent-soft text-accent-ink",
  long: "bg-text text-surface",
  good: "bg-good-soft text-good",
  info: "bg-info-soft text-info",
  warn: "bg-warn-soft text-warn",
  alert: "bg-alert-soft text-alert",
  off: "border-(length:--border-hairline) border-line-strong text-text-muted",
  demo: "border-(length:--border-hairline) border-dashed border-line-strong text-text-subtle",
};

type ChipProps = {
  children: ReactNode;
  /** Variante (nom v1 « tone » conservé). */
  tone?: ChipVariant;
  /** Glyphe d'état ; par défaut celui du ton (✓ ↑ !). Passer « ✕ » pour une séance non réalisée. */
  glyph?: string;
};

/** Badge pilule 12/700 (DESIGN.md §5). */
export function Chip({ children, tone = "neutral", glyph }: ChipProps) {
  const isState = tone === "good" || tone === "info" || tone === "warn" || tone === "alert";
  const mark = glyph ?? (isState ? TONE_GLYPH[tone] : undefined);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-eyebrow tracking-normal whitespace-nowrap normal-case ${VARIANTS[tone]}`}
    >
      {mark && (
        <span aria-hidden="true" className="grid size-4 place-items-center rounded-pill bg-current text-caption leading-none">
          <span className="text-surface">{mark}</span>
        </span>
      )}
      {children}
    </span>
  );
}

/** Marque d'une valeur fictive (D16) : tant qu'engine/ ne la calcule pas. */
export function DemoChip({ children = "démo" }: { children?: ReactNode }) {
  return <Chip tone="demo">{children}</Chip>;
}
