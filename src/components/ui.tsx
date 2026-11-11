// Briques visuelles partagées par toutes les pages.

import type { ReactNode } from "react";
import type { WeekStatus } from "@/engine/week-status";
import { TYPE_LABELS } from "@/planner/plan";
import type { SessionType } from "@/planner/types";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(28,25,23,0.04)] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function CardTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-xs font-bold tracking-[0.12em] text-ink-3 uppercase">{children}</h2>
      {aside}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-1 text-ink-2">{subtitle}</p>}
    </header>
  );
}

const QUALITY: SessionType[] = ["fractionne", "seuil", "allure", "course"];

export function TypeBadge({ type }: { type: SessionType }) {
  const style = QUALITY.includes(type)
    ? "bg-accent-soft text-accent-ink"
    : type === "sortie-longue"
      ? "bg-ink text-white"
      : "bg-surface-2 text-ink-2";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${style}`}>
      {TYPE_LABELS[type]}
    </span>
  );
}

const STATUS = {
  avance: { label: "En avance", icon: "↑", style: "bg-info-soft text-info" },
  ok: { label: "Dans les clous", icon: "✓", style: "bg-good-soft text-good" },
  retard: { label: "En retard", icon: "!", style: "bg-warn-soft text-warn" },
} as const;

export function WeekStatusPill({ status }: { status: WeekStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${s.style}`}>
      <span aria-hidden className="grid size-4 place-items-center rounded-full bg-current/15 text-[11px] leading-none">
        {s.icon}
      </span>
      {s.label}
    </span>
  );
}

/** Une grande valeur chiffrée avec son unité et son libellé. */
export function Stat({ label, value, unit, className = "" }: { label: string; value: ReactNode; unit?: string; className?: string }) {
  return (
    <div className={className}>
      <div className="font-display text-3xl leading-none font-bold tabular sm:text-4xl">
        {value}
        {unit && <span className="ml-1 text-lg font-semibold text-ink-3">{unit}</span>}
      </div>
      <div className="mt-1.5 text-sm text-ink-2">{label}</div>
    </div>
  );
}
