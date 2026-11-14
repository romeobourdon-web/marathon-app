import type { ReactNode } from "react";

type CardProps = {
  /** En-tête de la carte (style label, muted). Une carte = une question. */
  label?: string;
  /** Élément placé à droite de l'en-tête, par exemple un Chip « démo ». */
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Conteneur de base : surface, bordure line, rayon lg, padding space-5 (DESIGN.md §4). */
export function Card({ label, badge, children, className = "" }: CardProps) {
  return (
    <section className={`rounded-lg border-(length:--border-hairline) border-line bg-surface p-5 ${className}`}>
      {(label || badge) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {label && <h2 className="text-label text-text-muted">{label}</h2>}
          {badge}
        </header>
      )}
      {children}
    </section>
  );
}
