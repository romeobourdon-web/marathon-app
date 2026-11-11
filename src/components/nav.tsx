"use client";

// "use client" : ce composant tourne dans le navigateur, car il a besoin
// de connaître la page actuelle (usePathname) pour surligner l'onglet actif.

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard", icon: "M3 12h4l3-8 4 16 3-8h4" },
  { href: "/plan", label: "Plan", icon: "M4 5h16M4 12h16M4 19h10" },
  { href: "/seances", label: "Séances", icon: "M5 20V10M12 20V4M19 20v-7" },
  { href: "/journal", label: "Journal", icon: "M6 3h10l3 3v15H6zM9 9h7M9 13h7M9 17h4" },
] as const;

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* En-tête (toutes tailles) + liens (desktop) */}
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-accent text-white">
              <Icon d="M3 12h4l3-8 4 16 3-8h4" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">Objectif 3h30</span>
          </Link>
          <nav className="hidden gap-1 md:flex" aria-label="Navigation principale">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive(l.href) ? "bg-ink text-white" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Barre d'onglets en bas (mobile) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Navigation principale"
      >
        <ul className="grid grid-cols-4">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                  isActive(l.href) ? "text-accent-ink" : "text-ink-3"
                }`}
              >
                <Icon d={l.icon} />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
