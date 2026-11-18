// Seul point d'accès aux données pour les écrans et les scripts. Les données viennent de Supabase :
//  - lectures des écrans : client de la requête (session de l'utilisateur, RLS « propriétaire uniquement ») ;
//  - écritures de la synchro : client admin (clé secrète, scripts uniquement), user_id explicite.
// Le plan a été généré par planner/buildPlan puis inséré par le seed : la base fait foi (D11).

import type { TablesInsert } from "@/db/database.types";
import { toActivityRecord, toActivityResult, toPlannedSession, toRace, type PlannedSessionRow } from "@/db/mappers";
import { DESIGN_PREVIEW } from "@/db/seed/mock/design";
import { FORM_DEMO } from "@/db/seed/mock/form";
import { createSupabaseAdminClient } from "@/db/supabase/admin";
import { createSupabaseServerClient } from "@/db/supabase/server";
import type { ActivityRecord, Race } from "@/db/types";
import type { WellnessDay } from "@/engine/wellness";
import { linkSessions } from "@/planner/sessions";
import type { Session } from "@/planner/types";

function fail(what: string, error: { message: string } | null): never {
  throw new Error(`Lecture impossible (${what}) : ${error?.message ?? "aucune donnée — utilisateur connecté et base initialisée ?"}`);
}

// ── Lectures (écrans) ──────────────────────────────────────────────────────

/** Événement objectif de l'athlète. */
export async function getRace(): Promise<Race> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("athlete_profile")
    .select("event:goal_event_id (name, date, distance_m, target_time_s)")
    .maybeSingle();
  if (error || !data?.event) fail("objectif", error);
  return toRace(data.event);
}

/** Lundi de la semaine 1 du plan actif. */
export async function getPlanStart(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("plan").select("start_date").eq("is_active", true).maybeSingle();
  if (error || !data) fail("plan actif", error);
  return data.start_date;
}

const SESSION_SELECT = `
  id, date, week, type, title, details, distance_m, pace_min_s_km, pace_max_s_km, hr_min, hr_max,
  plan_phase (code),
  session_link (
    activity (source, start_time, distance_m, moving_time_s, avg_hr, avg_speed_mps, journal_entry (feeling, rpe, comment))
  )
`;

/** Toutes les séances du plan actif, liées au réalisé (session_link) ; statut calculé par planner/ à la date `today`. */
export async function getSessions(today: string): Promise<Session[]> {
  const supabase = await createSupabaseServerClient();
  const plan = await supabase.from("plan").select("id").eq("is_active", true).maybeSingle();
  if (plan.error || !plan.data) fail("plan actif", plan.error);
  const { data, error } = await supabase
    .from("planned_session")
    .select(SESSION_SELECT)
    .eq("plan_id", plan.data.id)
    .order("date")
    .returns<PlannedSessionRow[]>();
  if (error || !data) fail("séances", error);

  // Le réalisé fictif du seed (source = 'mock') n'est affiché que tant qu'aucune vraie activité n'est synchronisée.
  const real = await supabase.from("activity").select("id", { count: "exact", head: true }).neq("source", "mock");
  const ignoreMock = (real.count ?? 0) > 0;

  const results = new Map(data.map((row) => [row.id, toActivityResult(row, { ignoreMock })]));
  return linkSessions(data.map(toPlannedSession), today, (s) => results.get(s.id) ?? { skipped: true });
}

/**
 * Toutes les activités réalisées (tous sports, marche comprise : rien n'est masqué, D04/D28).
 * Le filtrage « compte pour le plan » est fait par engine/ et planner/.
 * Les activités fictives (source = 'mock', seed --mock) ne sont rendues que s'il n'existe aucune vraie activité.
 */
export async function getActivities(): Promise<ActivityRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("activity")
    .select("id, source, local_date, start_time, sport, distance_m, moving_time_s, avg_hr, avg_speed_mps")
    .order("start_time")
    .range(0, 9999);
  if (error || !data) fail("activités", error);
  const real = data.filter((a) => a.source !== "mock");
  return (real.length > 0 ? real : data).map(toActivityRecord);
}

/** Bien-être (VFC, FC de repos, sommeil) entre deux dates incluses. */
export async function getWellness(from: string, to: string): Promise<WellnessDay[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("wellness").select("date, hrv_ms, resting_hr, sleep_s").gte("date", from).lte("date", to);
  if (error) fail("bien-être", error);
  return data.map((w) => ({ date: w.date, hrvMs: w.hrv_ms, restingHr: w.resting_hr, sleepS: w.sleep_s }));
}

/** Dernier questionnaire du matin (daily_checkin) daté au plus tard de `today`, ou null. */
export async function getLatestCheckin(today: string): Promise<{ date: string; soreness: number | null } | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("daily_checkin")
    .select("date, soreness")
    .lte("date", today)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) fail("questionnaire du matin", error);
  return data;
}

/** Score de forme de démonstration (D16, phase 3) : toujours affiché avec un Chip « démo ». */
export function getFormDemo() {
  return FORM_DEMO;
}

/** Données fictives de la page /design (D16) : toujours affichées avec un Chip « démo ». */
export function getDesignPreview() {
  return DESIGN_PREVIEW;
}

// ── Connexion ──────────────────────────────────────────────────────────────

/** Ouvre une session (cookies posés par le client serveur). Renvoie false si les identifiants sont refusés. */
export async function signIn(email: string, password: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return !error;
}

// ── Lectures pour la synchro (scripts uniquement, client admin) ───────────────

/** Identifiant de l'utilisateur local (D03 : un seul utilisateur). */
export async function getUserIdByEmail(email: string): Promise<string> {
  const { data, error } = await createSupabaseAdminClient().auth.admin.listUsers({ perPage: 1000 });
  if (error) fail("utilisateurs", error);
  const user = data.users.find((u) => u.email === email);
  if (!user) throw new Error(`Utilisateur ${email} introuvable : lance npm run db:seed.`);
  return user.id;
}

/** source_id des activités déjà en base pour une source. */
export async function getActivitySourceIds(userId: string, source: SyncSource): Promise<Set<string>> {
  const { data, error } = await createSupabaseAdminClient()
    .from("activity")
    .select("source_id")
    .eq("user_id", userId)
    .eq("source", source)
    .range(0, 9999);
  if (error) fail("activités connues", error);
  return new Set(data.map((a) => a.source_id));
}

/** Départ (ISO 8601) et date de chaque activité d'une source, pour repérer une sortie déjà enregistrée (D32). */
export async function getActivityStarts(userId: string, source: SyncSource): Promise<{ startTime: string; date: string }[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from("activity")
    .select("start_time, local_date")
    .eq("user_id", userId)
    .eq("source", source)
    .range(0, 9999);
  if (error) fail("départs des activités", error);
  return data.map((a) => ({ startTime: a.start_time, date: a.local_date }));
}

export interface LinkState {
  /** Début du plan actif (la base fait foi, D11). */
  planStart: string;
  sessions: { id: string; date: string; distanceKm: number }[];
  activities: ActivityRecord[];
  /** Liaisons existantes dont l'activité est dans la fenêtre, avec leur méthode (auto | manual). */
  links: { id: string; activityId: string; sessionId: string; method: "auto" | "manual" }[];
}

/**
 * État de la liaison prévu ↔ réalisé entre deux dates (incluses) : séances du plan actif, vraies activités
 * (Garmin et import téléphone, D32 ; pas les fictives) et liaisons existantes. Sert à planner/computeAutoLinks (D28 à D30).
 */
export async function getLinkState(userId: string, from: string, to: string): Promise<LinkState> {
  const admin = createSupabaseAdminClient();
  const plan = await admin.from("plan").select("id, start_date").eq("user_id", userId).eq("is_active", true).maybeSingle();
  if (plan.error || !plan.data) fail("plan actif", plan.error);
  const sessions = await admin
    .from("planned_session")
    .select("id, date, distance_m")
    .eq("plan_id", plan.data.id)
    .gte("date", from)
    .lte("date", to);
  if (sessions.error) fail("séances prévues", sessions.error);
  const activities = await admin
    .from("activity")
    .select("id, local_date, start_time, sport, distance_m, moving_time_s, avg_hr, avg_speed_mps, session_link (id, planned_session_id, method)")
    .eq("user_id", userId)
    .neq("source", "mock")
    .gte("local_date", from)
    .lte("local_date", to)
    .range(0, 9999);
  if (activities.error) fail("activités", activities.error);
  return {
    planStart: plan.data.start_date,
    sessions: sessions.data.map((s) => ({ id: s.id, date: s.date, distanceKm: s.distance_m / 1000 })),
    activities: activities.data.map(toActivityRecord),
    links: activities.data.flatMap((a) =>
      asList(a.session_link).map((l) => ({
        id: l.id,
        activityId: a.id,
        sessionId: l.planned_session_id,
        method: l.method as "auto" | "manual",
      })),
    ),
  };
}

/** Relation 1–1 renvoyée par PostgREST sous forme d'objet, de tableau ou de null. */
function asList<T>(v: T | T[] | null): T[] {
  return v === null ? [] : Array.isArray(v) ? v : [v];
}

// ── Écritures (synchro, scripts uniquement) ─────────────────────────────────

type Owned<T> = Omit<T, "user_id">;
export type ActivityInput = Owned<TablesInsert<"activity">>;
export type StreamInput = Owned<TablesInsert<"activity_stream">>;
export type WellnessInput = Owned<TablesInsert<"wellness">>;
export type SyncSource = TablesInsert<"sync_run">["source"];

function writeError(what: string, error: { message: string }): never {
  throw new Error(`Écriture impossible (${what}) : ${error.message}`);
}

/** Insère ou met à jour des activités (clé : source + source_id). Renvoie id et source_id de chaque ligne. */
export async function upsertActivities(userId: string, rows: ActivityInput[]): Promise<{ id: string; source_id: string }[]> {
  if (rows.length === 0) return [];
  const { data, error } = await createSupabaseAdminClient()
    .from("activity")
    .upsert(
      rows.map((r) => ({ ...r, user_id: userId })),
      { onConflict: "source,source_id" },
    )
    .select("id, source_id");
  if (error) writeError("activités", error);
  return data;
}

/** Insère ou remplace les séries temporelles (une ligne par activité). */
export async function upsertStreams(userId: string, rows: StreamInput[]): Promise<number> {
  if (rows.length === 0) return 0;
  const { error, count } = await createSupabaseAdminClient()
    .from("activity_stream")
    .upsert(
      rows.map((r) => ({ ...r, user_id: userId })),
      { onConflict: "activity_id", count: "exact" },
    );
  if (error) writeError("séries temporelles", error);
  return count ?? rows.length;
}

/** Insère ou met à jour le bien-être quotidien (clé : utilisateur + date). */
export async function upsertWellness(userId: string, rows: WellnessInput[]): Promise<number> {
  if (rows.length === 0) return 0;
  const { error, count } = await createSupabaseAdminClient()
    .from("wellness")
    .upsert(
      rows.map((r) => ({ ...r, user_id: userId })),
      { onConflict: "user_id,date", count: "exact" },
    );
  if (error) writeError("bien-être", error);
  return count ?? rows.length;
}

/** Lie une activité à une séance prévue. Sans effet si l'activité est déjà liée (activity_id UNIQUE). */
export async function linkSession(
  userId: string,
  plannedSessionId: string,
  activityId: string,
  method: "auto" | "manual" = "auto",
): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from("session_link")
    .upsert(
      { user_id: userId, planned_session_id: plannedSessionId, activity_id: activityId, method },
      { onConflict: "activity_id", ignoreDuplicates: true },
    );
  if (error) writeError("liaison", error);
}

/** Supprime des liaisons (recalcul des liaisons automatiques, D29). Les liaisons manuelles ne sont jamais passées ici. */
export async function deleteLinks(linkIds: string[]): Promise<void> {
  if (linkIds.length === 0) return;
  const { error } = await createSupabaseAdminClient().from("session_link").delete().in("id", linkIds).eq("method", "auto");
  if (error) writeError("suppression de liaisons", error);
}

/** Ouvre une entrée sync_run (statut running) et renvoie son id. */
export async function startSyncRun(userId: string, source: SyncSource, rangeFrom: string, rangeTo: string): Promise<string> {
  const { data, error } = await createSupabaseAdminClient()
    .from("sync_run")
    .insert({ user_id: userId, source, range_from: rangeFrom, range_to: rangeTo, status: "running" })
    .select("id")
    .single();
  if (error) writeError("début de synchro", error);
  return data.id;
}

/** Ferme une entrée sync_run : succès (nombre de lignes écrites) ou erreur (message). */
export async function finishSyncRun(
  syncRunId: string,
  result: { status: "success"; upserted: number } | { status: "error"; upserted: number; error: string },
): Promise<void> {
  const { error } = await createSupabaseAdminClient()
    .from("sync_run")
    .update({
      status: result.status,
      upserted: result.upserted,
      error: result.status === "error" ? result.error : null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", syncRunId);
  if (error) writeError("fin de synchro", error);
}
