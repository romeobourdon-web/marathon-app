import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "toggle";

const BASE =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-pill text-button transition-colors duration-(--motion-fast) ease-out motion-reduce:transition-none";

const VARIANTS: Record<ButtonVariant, string> = {
  // Un seul bouton primary par écran (DESIGN.md §8). Texte blanc sur accent-ink (5,2:1), jamais sur accent.
  primary: "min-h-(--control-height) px-5 bg-accent-ink text-on-accent hover:bg-accent-hover active:bg-accent-hover",
  secondary: "min-h-(--control-height) px-5 border-(length:--border-hairline) border-line bg-surface text-text hover:bg-surface-raised",
  ghost: "min-h-(--touch-min) px-2 text-accent-ink hover:underline",
  // Filtres (v2.1) : état porté par aria-pressed ; actif = fond text.
  toggle:
    "min-h-(--touch-min) px-4 text-body-sm font-bold border-(length:--border-hairline) border-line bg-surface text-text-muted aria-pressed:border-text aria-pressed:bg-text aria-pressed:text-surface",
};

const DISABLED = "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-raised disabled:text-text-subtle";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** toggle : filtre actif (aria-pressed). */
  pressed?: boolean;
  /** Pleine largeur sur téléphone (formulaires), largeur du contenu sur PC. */
  block?: boolean;
  children: ReactNode;
};

/** Action : pilule, hauteur 48 ; primary / secondary / ghost / toggle (DESIGN.md §5). */
export function Button({ variant = "primary", pressed, block = false, className = "", type = "button", children, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={variant === "toggle" ? Boolean(pressed) : undefined}
      className={`${BASE} ${VARIANTS[variant]} ${DISABLED} ${block ? "w-full lg:w-auto" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = { href: string; variant?: Exclude<ButtonVariant, "toggle">; block?: boolean; children: ReactNode; className?: string };

/** Même apparence que Button, pour une navigation (vrai lien <a>). */
export function ButtonLink({ href, variant = "primary", block = false, children, className = "" }: ButtonLinkProps) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${block ? "w-full lg:w-auto" : ""} ${className}`}>
      {children}
    </Link>
  );
}
