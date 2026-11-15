import Link from "next/link";
import { BottomNav, type BottomNavItem } from "./bottom-nav";
import { Icon } from "./icons";

/** Les 5 destinations, dans le même ordre partout (DESIGN.md §3). */
export const NAV_ITEMS: BottomNavItem[] = [
  { href: "/", label: "Aujourd'hui", icon: "today" },
  { href: "/plan", label: "Plan", icon: "plan" },
  { href: "/seances", label: "Séances", icon: "sessions" },
  { href: "/journal", label: "Journal", icon: "journal" },
  { href: "/echeances", label: "Échéances", icon: "deadlines" },
];

type AppNavProps = {
  /** href de la destination active (fourni par l'écran). */
  current: string;
  items?: BottomNavItem[];
  /** Élément à droite de l'en-tête sur téléphone (ex. date du jour). */
  aside?: string;
  /** fixed (défaut) : en-tête collant et barre fixée en bas ; static : dans le flux (aperçu /design). */
  position?: "fixed" | "static";
};

/**
 * Navigation responsive (DESIGN.md §3, §5) : un seul composant.
 * Téléphone : en-tête compact 56 px (logo + aside) et barre d'onglets en bas.
 * PC (≥ 1024 px) : en-tête collant 56 px, logo à gauche et 5 pilules à droite (active = fond text).
 */
export function AppNav({ current, items = NAV_ITEMS, aside, position = "fixed" }: AppNavProps) {
  return (
    <>
      <header
        className={`flex h-(--header-height) items-center justify-between border-b-(length:--border-hairline) border-line bg-bg/85 px-page-x backdrop-blur ${
          position === "fixed" ? "sticky top-0 z-20" : ""
        }`}
      >
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-md text-text">
          <span className="grid size-8 place-items-center rounded-md bg-accent text-on-accent">
            <Icon name="today" className="size-4.5" />
          </span>
          <span className="font-display text-title-sm">Target 42</span>
        </Link>
        {aside && <span className="text-caption text-text-subtle lg:hidden">{aside}</span>}
        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex gap-1">
            {items.map((item) => {
              const active = item.href === current;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`focus-ring inline-flex min-h-9 items-center rounded-pill px-4 text-nav transition-colors duration-(--motion-fast) ease-out motion-reduce:transition-none ${
                      active ? "bg-text text-surface" : "text-text-muted hover:bg-surface-raised hover:text-text"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <BottomNav items={items} current={current} position={position} />
    </>
  );
}
