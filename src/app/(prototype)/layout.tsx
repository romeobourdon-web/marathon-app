import { Barlow, Barlow_Condensed } from "next/font/google";
import { Nav } from "@/components/nav";

// Layout du prototype v0 (D10) : conservé tel quel jusqu'à la refonte, puis supprimé.
// La classe theme-prototype rétablit ses anciennes valeurs (globals.css), sans toucher aux tokens Ardoise.

// Barlow : texte courant. Barlow Condensed : grandes valeurs chiffrées.
const body = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const numbers = Barlow_Condensed({
  variable: "--font-numbers",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export default function PrototypeLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`theme-prototype ${body.variable} ${numbers.variable} min-h-dvh bg-bg text-ink font-sans`}>
      <Nav />
      <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-28 sm:px-6 md:pt-8 md:pb-12">{children}</main>
    </div>
  );
}
