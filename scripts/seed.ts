/**
 * Données de départ de la base locale (mission M3, D11).
 * Lancement : npm run db:seed (après npm run db:reset).
 *
 * 1. Crée l'utilisateur local (SEED_USER_EMAIL / SEED_USER_PASSWORD de .env.local) via l'API admin.
 * 2. Insère le profil et l'événement depuis src/db/seed/reference.ts.
 * 3. Génère le plan avec planner/buildPlan et l'insère : ensuite, c'est la base qui fait foi (D11).
 * 4. Ajoute le réalisé fictif de seed/mock/ (source = 'mock') pour les séances passées, avec liaison et journal.
 *
 * Aucune dépendance : fetch vers l'API REST et l'API d'authentification de Supabase local, avec la clé secrète.
 * Pas de logique métier ici : le script orchestre reference, planner et mock.
 */
import { mockActivity } from "@/db/seed/mock/activity";
import { HR_MAX, PLAN_START, RACE, ZONES } from "@/db/seed/reference";
import { todayInParis } from "@/lib/dates";
import { PHASES, buildPlan } from "@/planner/plan";

const GENERATOR_VERSION = "buildPlan v1";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} absente de .env.local (voir .env.example)`);
  return value;
}

const API_URL = env("NEXT_PUBLIC_SUPABASE_URL");
const SECRET_KEY = env("SUPABASE_SECRET_KEY");
const HEADERS = { apikey: SECRET_KEY, "Content-Type": "application/json" };

async function request<T>(path: string, init: { method: string; body?: unknown; prefer?: string }): Promise<T> {
  const res = await fetch(API_URL + path, {
    method: init.method,
    headers: { ...HEADERS, ...(init.prefer ? { Prefer: init.prefer } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method} ${path} → HTTP ${res.status} : ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : null) as T;
}

/** Insère des lignes et renvoie les lignes créées (dans l'ordre d'envoi). */
function insert<T>(table: string, rows: object | object[]): Promise<T[]> {
  return request<T[]>(`/rest/v1/${table}`, { method: "POST", body: rows, prefer: "return=representation" });
}

async function createUser(email: string, password: string): Promise<string> {
  const list = await request<{ users: { id: string; email: string }[] }>("/auth/v1/admin/users?per_page=1000", { method: "GET" });
  if (list.users.some((u) => u.email === email)) {
    throw new Error("L'utilisateur local existe déjà : lance d'abord npm run db:reset (le seed ne réécrit pas une base existante).");
  }
  const user = await request<{ id: string }>("/auth/v1/admin/users", {
    method: "POST",
    body: { email, password, email_confirm: true },
  });
  return user.id;
}

async function main() {
  const today = todayInParis();
  const userId = await createUser(env("SEED_USER_EMAIL"), env("SEED_USER_PASSWORD"));
  const owned = <T extends object>(row: T) => ({ ...row, user_id: userId });

  // Référence : événement objectif et profil athlète
  const [event] = await insert<{ id: string }>(
    "event",
    owned({
      name: RACE.name,
      date: RACE.date,
      distance_m: Math.round(RACE.distanceKm * 1000),
      target_time_s: RACE.targetTimeSec,
      priority: "A",
    }),
  );
  await insert("athlete_profile", owned({ hr_max: HR_MAX, zones: ZONES, goal_event_id: event.id }));

  // Prévu : plan généré par planner/ (D11)
  const [plan] = await insert<{ id: string }>(
    "plan",
    owned({ name: `Préparation ${RACE.name}`, start_date: PLAN_START, is_active: true, generator_version: GENERATOR_VERSION }),
  );
  const phases = await insert<{ id: string; code: string }>(
    "plan_phase",
    PHASES.map((p) => owned({ plan_id: plan.id, code: p.id, name: p.name, goal: p.goal, week_from: p.weeks.min, week_to: p.weeks.max })),
  );
  const phaseId = new Map(phases.map((p) => [p.code, p.id]));

  const planned = buildPlan({ start: PLAN_START, raceName: RACE.name, zones: ZONES });
  const sessionRows = await insert<{ id: string; date: string }>(
    "planned_session",
    planned.map((s) =>
      owned({
        plan_id: plan.id,
        phase_id: phaseId.get(s.phase),
        date: s.date,
        week: s.week,
        type: s.type,
        title: s.title,
        details: s.details,
        distance_m: Math.round(s.distanceKm * 1000),
        pace_min_s_km: s.targetPace.min,
        pace_max_s_km: s.targetPace.max,
        hr_min: s.targetHr.min,
        hr_max: s.targetHr.max,
        origin: "generator",
      }),
    ),
  );
  // Une séance prévue par jour au plus : la date identifie la ligne insérée.
  const sessionIdByDate = new Map(sessionRows.map((r) => [r.date, r.id]));

  // Réalisé fictif (seed/mock/) pour les séances passées, comme le faisait linkSessions.
  const past = planned
    .filter((s) => s.date < today)
    .map((s) => ({ s, result: mockActivity(s) }))
    .flatMap(({ s, result }) => (result.skipped ? [] : [{ s, actual: result.actual, journal: result.journal }]));

  let activities: { id: string; source_id: string }[] = [];
  if (past.length > 0) {
    activities = await insert<{ id: string; source_id: string }>(
      "activity",
      past.map(({ s, actual }) =>
        owned({
          source: "mock",
          source_id: s.id,
          start_time: `${s.date}T07:00:00+01:00`,
          local_date: s.date,
          sport: "running",
          distance_m: Math.round(actual.distanceKm * 1000),
          moving_time_s: actual.durationSec,
          elapsed_time_s: actual.durationSec,
          avg_hr: actual.avgHr,
          // Vitesse issue de l'allure moyenne du mock : relue en base, elle redonne exactement la même allure.
          avg_speed_mps: 1000 / actual.avgPace,
        }),
      ),
    );
    const activityIdBySource = new Map(activities.map((a) => [a.source_id, a.id]));
    await insert(
      "session_link",
      past.map(({ s }) =>
        owned({ planned_session_id: sessionIdByDate.get(s.date), activity_id: activityIdBySource.get(s.id), method: "auto" }),
      ),
    );
    await insert(
      "journal_entry",
      past.flatMap(({ s, journal }) =>
        journal
          ? [owned({ activity_id: activityIdBySource.get(s.id), feeling: journal.feeling, rpe: journal.rpe, comment: journal.note })]
          : [],
      ),
    );
  }

  const weeks = new Set(planned.map((s) => s.week)).size;
  console.log(`Utilisateur local créé (identifiants dans .env.local).`);
  console.log(`Plan : ${phases.length} phases, ${sessionRows.length} séances prévues sur ${weeks} semaines.`);
  console.log(`Réalisé fictif (source = 'mock') au ${today} : ${activities.length} activités liées, avec journal.`);
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
