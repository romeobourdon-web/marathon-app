import type { ReactNode } from "react";
import { TONE_TEXT, type Tone } from "./tone";

type ChipProps = {
  children: ReactNode;
  /** Seul le texte se colore ; la pilule reste en line. */
  tone?: Tone;
};

/** Consigne ou statut court : mono 13, pilule bordée line (DESIGN.md §4). */
export function Chip({ children, tone = "neutral" }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border-(length:--border-hairline) border-line px-3 py-1 font-mono text-num-sm ${TONE_TEXT[tone]}`}
    >
      {children}
    </span>
  );
}

/** Marque d'une valeur fictive (D16) : tant qu'engine/ ne la calcule pas. */
export function DemoChip() {
  return <Chip tone="warn">démo</Chip>;
}
