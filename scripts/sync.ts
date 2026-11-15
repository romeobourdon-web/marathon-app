/**
 * Synchro Garmin → base (mission M5, D13, D17 à D21).
 * Lancement : npm run sync            (depuis PROJECT_START, le 2026-04-04)
 *             npm run sync -- --from AAAA-MM-JJ
 *
 * Ouvre une entrée sync_run, récupère activités (toutes, avec leur sport), séries FIT des nouvelles
 * activités et bien-être, fait les upserts via le repository (aucun doublon : clés uniques),
 * lie chaque course à la séance prévue du même jour, puis ferme sync_run (succès ou erreur).
 * Pas de logique métier ici : le script orchestre connectors/, db/repository et engine/.
 */
import { createGarminSource } from "@/connectors/garmin";
import type { NeutralActivity, NeutralStream } from "@/connectors/types";
import type { Json } from "@/db/database.types";
import {
  finishSyncRun,
  getActivitySourceIds,
  getLinkState,
  getUserIdByEmail,
  linkSession,
  startSyncRun,
  upsertActivities,
  upsertStreams,
  upsertWellness,
  type ActivityInput,
  type StreamInput,
} from "@/db/repository";
import { PROJECT_START } from "@/db/seed/reference";
import { countsForPlan } from "@/engine/activity";
import { addDays, todayInParis } from "@/lib/dates";
import { autoLinks } from "@/planner/link";

function parseFrom(argv: string[]): string {
  const i = argv.indexOf("--from");
  if (i === -1) return PROJECT_START;
  const value = argv[i + 1] ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("--from attend une date AAAA-MM-JJ");
  return value;
}

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} absente de .env.local (voir .env.example)`);
  return value;
}

const toActivityInput = (a: NeutralActivity): ActivityInput => ({
  source: "garmin",
  source_id: a.sourceId,
  start_time: a.startTime,
  local_date: a.localDate,
  sport: a.sport,
  distance_m: a.distanceM,
  moving_time_s: a.movingTimeS,
  elapsed_time_s: a.elapsedTimeS,
  avg_hr: a.avgHr,
  max_hr: a.maxHr,
  avg_speed_mps: a.avgSpeedMps,
  elevation_gain_m: a.elevationGainM,
  device_rpe: a.deviceRpe,
  device_feel: a.deviceFeel,
  raw: a.raw as Json,
});

// Les tableaux Postgres acceptent des null (mesure absente à un instant) ; les types générés ne le disent pas.
const toStreamInput = (activityId: string, s: NeutralStream): StreamInput => ({
  activity_id: activityId,
  time_s: s.timeS,
  distance_m: s.distanceM as number[],
  hr: s.hr as number[],
  speed_mps: s.speedMps as number[],
  altitude_m: s.altitudeM as number[],
  cadence: s.cadence as number[],
  lat: s.lat as number[],
  lng: s.lng as number[],
});

async function main() {
  const from = parseFrom(process.argv.slice(2));
  const to = todayInParis();
  const userId = await getUserIdByEmail(env("SEED_USER_EMAIL"));
  const source = createGarminSource(env("GARMIN_PERSONAL_API_KEY"));
  const runId = await startSyncRun(userId, "garmin", from, to);
  console.log(`Synchro Garmin du ${from} au ${to}…`);

  let upserted = 0;
  try {
    // 1. Activités (détail demandé seulement pour les nouvelles)
    const known = await getActivitySourceIds(userId, "garmin");
    const activities = await source.fetchActivities(from, to, { knownSourceIds: known });
    const rows = await upsertActivities(userId, activities.map(toActivityInput));
    upserted += rows.length;
    const idBySource = new Map(rows.map((r) => [r.source_id, r.id]));
    const fresh = activities.filter((a) => !known.has(a.sourceId));
    console.log(`Activités : ${activities.length} reçues, dont ${fresh.length} nouvelles.`);

    // 2. Séries temporelles (FIT) des nouvelles activités
    let streams = 0;
    const streamFailures: string[] = [];
    for (const a of fresh) {
      try {
        const stream = await source.fetchStreams(a.sourceId);
        if (stream) streams += await upsertStreams(userId, [toStreamInput(idBySource.get(a.sourceId)!, stream)]);
      } catch (e) {
        streamFailures.push(`${a.localDate} ${a.sport} : ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    upserted += streams;
    console.log(`Séries temporelles : ${streams} importées${streamFailures.length ? `, ${streamFailures.length} en échec` : ""}.`);
    streamFailures.forEach((f) => console.warn(`  ⚠︎ ${f}`));

    // 3. Bien-être (FC repos, VFC, sommeil)
    const wellness = await source.fetchWellness(from, to);
    upserted += await upsertWellness(
      userId,
      wellness.map((w) => ({
        date: w.date,
        resting_hr: w.restingHr,
        hrv_ms: w.hrvMs,
        sleep_s: w.sleepS,
        sleep_score: w.sleepScore,
        raw: w.raw as Json,
      })),
    );
    console.log(`Bien-être : ${wellness.length} jours.`);

    // 4. Liaison automatique (D28) : le jour même, sinon une séance non liée à ± 1 jour (la plus proche en distance).
    //    Seules les courses qui comptent pour le plan sont liées (D22 : pas d'autre sport ; D28 : pas de marche).
    //    Fenêtre élargie d'un jour de chaque côté ; les liaisons existantes ne sont jamais modifiées.
    const state = await getLinkState(userId, addDays(from, -1), addDays(to, 1));
    const newLinks = autoLinks(
      state.sessions,
      state.activities.map((a) => ({ ...a, eligible: countsForPlan(a, state.planStart) })),
    );
    for (const l of newLinks) await linkSession(userId, l.sessionId, l.activityId, "auto");
    console.log(`Liaisons prévu ↔ réalisé : ${newLinks.length} nouvelles.`);

    await finishSyncRun(runId, { status: "success", upserted });
    console.log(`Synchro terminée : ${upserted} lignes écrites.`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await finishSyncRun(runId, { status: "error", upserted, error: message });
    throw e;
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
