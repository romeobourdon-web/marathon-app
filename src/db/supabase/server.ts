import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/db/database.types";
import { publicSupabaseEnv } from "./env";

/**
 * Client Supabase d'une requête serveur (pages, server actions), avec la session de l'utilisateur
 * lue dans les cookies : la RLS s'applique. Un nouveau client par requête.
 * next/headers est importé à l'appel, pour que repository.ts reste importable depuis les scripts Node.
 */
export async function createSupabaseServerClient() {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const { url, publishableKey } = publicSupabaseEnv();
  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Appel depuis une page : écriture impossible, le proxy (src/proxy.ts) rafraîchit la session.
        }
      },
    },
  });
}
