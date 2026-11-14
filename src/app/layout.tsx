import type { Metadata } from "next";
import { Fragment_Mono, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

// Polices du design system (DESIGN.md §3), auto-hébergées par next/font.
// Schibsted Grotesk : police variable, un seul fichier couvre les graisses 400 à 600.
const sans = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
});

// Fragment Mono : une seule graisse (400). Les chiffres ne sont jamais en gras.
const mono = Fragment_Mono({
  variable: "--font-fragment",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Objectif 3h30",
  description: "Suivi d'entraînement marathon — objectif sub 3h30 au printemps 2027.",
};

// Layout racine : uniquement <html> et <body>. Les écrans du prototype ont leur layout dans (prototype)/.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
