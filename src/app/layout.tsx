import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Objectif 3h30",
  description: "Suivi d'entraînement marathon — objectif sub 3h30 au printemps 2027.",
};

// Layout racine : uniquement <html> et <body>. Les écrans du prototype ont leur layout dans (prototype)/.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
