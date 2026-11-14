// Variables Supabase lues dans l'environnement (.env.local en local, jamais dans le code).

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} absente de l'environnement (voir .env.example)`);
  return value;
}

/** URL et clé publique : utilisables côté navigateur comme côté serveur. */
export function publicSupabaseEnv() {
  // Accès explicites : Next.js remplace les NEXT_PUBLIC_* à la compilation.
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  };
}

/** Clé secrète : scripts uniquement (seed, synchro). Contourne la RLS. */
export function secretSupabaseKey(): string {
  return required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);
}
