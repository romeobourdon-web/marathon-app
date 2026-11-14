import Link from "next/link";
import { Icon, type IconName } from "./icons";

export type BottomNavItem = { href: string; label: string; icon: IconName };

type BottomNavProps = {
  items: BottomNavItem[];
  /** href de l'onglet actif : reçu de l'écran, le composant ne lit pas l'URL. */
  current: string;
};

/** Navigation : pilule flottante, 4 onglets, actif en accent + aria-current (DESIGN.md §4). Le positionnement revient à l'écran. */
export function BottomNav({ items, current }: BottomNavProps) {
  return (
    <nav aria-label="Navigation principale" className="h-(--nav-height) rounded-pill border-(length:--border-hairline) border-line bg-surface-raised p-1">
      <ul className="grid h-full grid-cols-4">
        {items.map((item) => {
          const active = item.href === current;
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring flex min-h-(--touch-min) flex-1 flex-col items-center justify-center gap-1 rounded-pill text-nav transition-colors duration-(--motion-fast) ease-out motion-reduce:transition-none ${
                  active ? "text-accent" : "text-text-muted hover:text-text"
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
