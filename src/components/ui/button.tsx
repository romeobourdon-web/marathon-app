import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const BASE =
  "focus-ring inline-flex h-(--control-height) min-w-(--touch-min) items-center justify-center gap-2 rounded-pill px-6 text-button transition-colors duration-(--motion-fast) ease-out motion-reduce:transition-none";

const VARIANTS: Record<ButtonVariant, string> = {
  // Un seul bouton primary par écran (DESIGN.md §3).
  primary: "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-hover",
  secondary: "border-(length:--border-hairline) border-line-strong text-text hover:bg-surface-raised",
  ghost: "text-text hover:bg-surface-raised",
};

const DISABLED = "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-track disabled:text-text-muted";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; children: ReactNode };

/** Action : pilule de 52 px, primary / secondary / ghost, état désactivé (DESIGN.md §4). */
export function Button({ variant = "primary", className = "", type = "button", children, ...rest }: ButtonProps) {
  return (
    <button type={type} className={`${BASE} ${VARIANTS[variant]} ${DISABLED} ${className}`} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = { href: string; variant?: ButtonVariant; children: ReactNode; className?: string };

/** Même apparence que Button, pour une navigation (vrai lien <a>). */
export function ButtonLink({ href, variant = "primary", children, className = "" }: ButtonLinkProps) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
