import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Objectif 3h30",
  description: "Suivi d'entraînement marathon — objectif sub 3h30 au printemps 2027.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${body.variable} ${numbers.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-28 sm:px-6 md:pt-8 md:pb-12">{children}</main>
      </body>
    </html>
  );
}
