import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import { publicSupabaseEnv, secretSupabaseKey } from "./env";

/**
 * Client « administrateur » pour les scripts (synchro) : clé secrète, contourne la RLS.
 * Jamais utilisé par les écrans. Chaque écriture précise explicitement le user_id.
 */
export function createSupabaseAdminClient() {
  const { url } = publicSupabaseEnv();
  return createClient<Database>(url, secretSupabaseKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
