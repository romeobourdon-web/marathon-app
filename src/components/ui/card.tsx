import type { ReactNode } from "react";

type CardProps = {
  /** En-tête de la carte, en capitales (style eyebrow). Une carte = une question. */
  label?: string;
  /** Élément à droite de l'en-tête : badge (Chip), unité… */
  badge?: ReactNode;
  /** Anneau accent : élément courant (semaine en cours, course cible). */
  highlight?: boolean;
  children: ReactNode;
  className?: string;
};

/** Conteneur de base : blanc, bordure line, rayon lg, ombre card ; padding 20 (téléphone) / 24 (PC) (DESIGN.md §5). */
export function Card({ label, badge, highlight = false, children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-lg border-(length:--border-hairline) border-line bg-surface p-card-pad shadow-card ${
        highlight ? "ring-(length:--border-focus) ring-accent" : ""
      } ${className}`}
    >
      {(label || badge) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {label && <h2 className="eyebrow">{label}</h2>}
          {badge}
        </header>
      )}
      {children}
    </section>
  );
}
