// Icônes au trait (DESIGN.md, maquettes v2.1) : 24 × 24, épaisseur 2, currentColor. Pas d'icône pleine, pas d'emoji.

const PATHS = {
  today: "M3 12h4l3-8 4 16 3-8h4",
  plan: "M4 5h16M4 12h16M4 19h10",
  sessions: "M5 20V10M12 20V4M19 20v-7",
  journal: "M6 3h10l3 3v15H6zM9 9h7M9 13h7M9 17h4",
  deadlines: "M5 21V4M5 4h12l-2 4 2 4H5",
  chevron: "m9 6 6 6-6 6",
  // Ancien nom (v1) gardé pour compatibilité : équivalent de « plan ».
  calendar: "M4 5h16M4 12h16M4 19h10",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}
