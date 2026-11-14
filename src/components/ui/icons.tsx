// Icônes au trait (DESIGN.md §4) : 24 px, épaisseur 1,8, currentColor. Pas d'icône pleine, pas d'emoji.

const PATHS = {
  today: "M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  calendar: "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7ZM4 10h16M8 3v4M16 3v4",
  journal: "M6 3h9l4 4v14H6V3ZM14 3v5h5M9 12h7M9 16h5",
  deadlines: "M5 21V4M5 4h11l-2 4 2 4H5",
  chevron: "m9 6 6 6-6 6",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "size-6" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}
