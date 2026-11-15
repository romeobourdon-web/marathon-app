import Link from "next/link";
import { Icon, type IconName } from "./icons";

export type BottomNavItem = { href: string; label: string; icon: IconName };

type BottomNavProps = {
  items: BottomNavItem[];
  /** href de l'onglet actif : reçu de l'écran, le composant ne lit pas l'URL. */
  current: string;
  /** fixed (défaut) : collée en bas de l'écran sur téléphone ; static : dans le flux (aperçu /design). */
  position?: "fixed" | "static";
};

/**
 * Barre d'onglets du téléphone (DESIGN.md §3) : fond blanc à 95 % + flou, onglet actif en accent-ink,
 * icône + libellé. Masquée sur PC (≥ 1024 px), où AppNav affiche des pilules dans l'en-tête.
 */
export function BottomNav({ items, current, position = "fixed" }: BottomNavProps) {
  return (
    <nav
      aria-label="Navigation principale"
      className={`border-t-(length:--border-hairline) border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden ${
        position === "fixed" ? "fixed inset-x-0 bottom-0 z-20" : ""
      }`}
    >
      <ul className="grid h-(--nav-height)" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = item.href === current;
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring flex min-h-(--touch-min) flex-1 flex-col items-center justify-center gap-1 text-nav transition-colors duration-(--motion-fast) ease-out motion-reduce:transition-none ${
                  active ? "text-accent-ink" : "text-text-subtle hover:text-text"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
