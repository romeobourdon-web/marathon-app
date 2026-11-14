import type { Metadata } from "next";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { login } from "./actions";

export const metadata: Metadata = { title: "Connexion — Target 42" };

// Connexion minimale (M4) : email + mot de passe, tokens du design system, aucun travail de design.
export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-5 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-title-lg text-text">Target 42</h1>
        <p className="text-body-sm text-text-muted">Connecte-toi pour suivre ta préparation.</p>
      </header>
      <form action={login} className="flex flex-col gap-5">
        <TextField id="email" name="email" type="email" label="Email" autoComplete="email" required />
        <TextField id="password" name="password" type="password" label="Mot de passe" autoComplete="current-password" required />
        <Suspense fallback={null}>
          <LoginError searchParams={searchParams} />
        </Suspense>
        <Button type="submit">Se connecter</Button>
      </form>
    </main>
  );
}

async function LoginError({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { erreur } = await searchParams;
  if (!erreur) return null;
  return (
    <p role="alert" className="text-body-sm text-alert">
      Email ou mot de passe incorrect.
    </p>
  );
}
