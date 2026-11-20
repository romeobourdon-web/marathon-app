/**
 * Synchro Garmin → base (mission M5, D13, D17 à D21).
 * Lancement : npm run sync            (depuis PROJECT_START, le 2026-04-04)
 *             npm run sync -- --from AAAA-MM-JJ   (relit toujours au moins les 14 derniers jours, D31)
 *
 * Ouvre une entrée sync_run, récupère activités (toutes, avec leur sport), séries FIT des nouvelles
 * activités et bien-être, fait les upserts via le repository (aucun doublon : clés uniques ; les activités
 * existantes sont mises à jour, ex. un sport corrigé dans Garmin Connect, D31),
 * recalcule les liaisons automatiques (db/relink), puis ferme sync_run (succès ou erreur).
 * Pas de logique métier ici : le script orchestre connectors/, db/repository et engine/.
 */
import { createGarminSource } from "@/connectors/garmin";
import type { NeutralStream } from "@/connectors/types";
import type { Json } from "@/db/database.types";
import {
  finishSyncRun,
  getActivitySourceIds,
  getUserIdByEmail,
  startSyncRun,
  upsertActivities,
  upsertStreams,
  upsertWellness,
  type StreamInput,
} from "@/db/repository";
import { toActivityInput } from "@/db/mappers";
import { PROJECT_START } from "@/db/seed/reference";
import { addDays, todayInParis } from "@/lib/dates";
import { relink } from "@/db/relink";

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

/** Fenêtre minimale relue à chaque synchro, pour récupérer les corrections faites dans Garmin Connect (D31). */
const REREAD_DAYS = 14;

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
  const to = todayInParis();
  const requested = parseFrom(process.argv.slice(2));
  const minFrom = addDays(to, -REREAD_DAYS);
  const from = requested < minFrom ? requested : minFrom;
  const userId = await getUserIdByEmail(env("SEED_USER_EMAIL"));
  const source = createGarminSource(env("GARMIN_PERSONAL_API_KEY"));
  const runId = await startSyncRun(userId, "garmin", from, to);
  console.log(`Synchro Garmin du ${from} au ${to}…`);

  let upserted = 0;
  try {
    // 1. Activités : les nouvelles sont insérées (avec leur détail) ; les existantes mises à jour (D31),
    //    sans toucher au ressenti saisi sur la montre, qui n'est pas redemandé (D20).
    const known = await getActivitySourceIds(userId, "garmin");
    const activities = await source.fetchActivities(from, to, { knownSourceIds: known });
    const fresh = activities.filter((a) => !known.has(a.sourceId));
    const updates = activities
      .filter((a) => known.has(a.sourceId))
      .map((a) => {
        const row = toActivityInput("garmin", a);
        delete row.device_rpe;
        delete row.device_feel;
        return row;
      });
    const rows = [...(await upsertActivities(userId, fresh.map((a) => toActivityInput("garmin", a)))), ...(await upsertActivities(userId, updates))];
    upserted += rows.length;
    const idBySource = new Map(rows.map((r) => [r.source_id, r.id]));
    console.log(`Activités : ${activities.length} reçues, dont ${fresh.length} nouvelles et ${updates.length} mises à jour.`);

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

    // 4. Liaisons automatiques recalculées (D28 à D30)
    const links = await relink(userId, from, to);
    console.log(`Liaisons prévu ↔ réalisé : ${links.created} créées, ${links.deleted} supprimées (manuelles intactes : ${links.manual}).`);

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
