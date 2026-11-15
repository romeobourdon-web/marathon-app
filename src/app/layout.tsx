import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

// Polices du design system v2.1 (DESIGN.md §4), auto-hébergées par next/font.
// Barlow : texte courant (400 à 700).
const sans = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Barlow Condensed : chiffres et titres (600, 700).
const display = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Target 42",
  description: "Target 42 — pilotage de la préparation marathon (Annecy, avril 2027, objectif sub 3h30).",
};

// Layout racine : uniquement <html> et <body>. Les écrans du prototype ont leur layout dans (prototype)/.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
