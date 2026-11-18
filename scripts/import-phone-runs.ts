/**
 * Import des sorties enregistrées au téléphone (D32) : npm run import:phone
 * Lit data/imports/strava-phone-runs.json et insère chaque sortie avec source = 'manual', source_id = 'strava:<id>'
 * (idempotent : clé unique source + source_id), sans séries temporelles. Saute toute sortie dont le départ est
 * à ± 30 min d'une activité Garmin (même sortie enregistrée deux fois) et la liste. Recalcule ensuite les liaisons.
 * Pas de logique métier ici : le script orchestre connectors/, db/repository et engine/.
 */
import { readFileSync } from "node:fs";
import { phoneRunToActivity, type PhoneRunFile } from "@/connectors/phone-import";
import { toActivityInput } from "@/db/mappers";
import { finishSyncRun, getActivityStarts, getUserIdByEmail, startSyncRun, upsertActivities } from "@/db/repository";
import { isSameRun } from "@/engine/activity";
import { formatDistance } from "@/lib/format";
import { relink } from "./relink";

const FILE = "data/imports/strava-phone-runs.json";

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  if (!email) throw new Error("SEED_USER_EMAIL absente de .env.local (voir .env.example)");
  const userId = await getUserIdByEmail(email);

  const file = JSON.parse(readFileSync(FILE, "utf8")) as PhoneRunFile;
  const runs = file.activities.map(phoneRunToActivity);
  if (runs.length !== file.count) throw new Error(`${FILE} : ${runs.length} sorties pour count = ${file.count}`);

  const garmin = await getActivityStarts(userId, "garmin");
  const skipped = runs.filter((r) => garmin.some((g) => isSameRun(r.startTime, g.startTime)));
  const toImport = runs.filter((r) => !skipped.includes(r));

  const dates = runs.map((r) => r.localDate).sort();
  const runId = await startSyncRun(userId, "manual", dates[0], dates[dates.length - 1]);
  try {
    const rows = await upsertActivities(
      userId,
      toImport.map((r) => toActivityInput("manual", r)),
    );
    console.log(`Sorties téléphone : ${rows.length} importées sur ${runs.length}.`);
    if (skipped.length) {
      console.log(`Sautées (départ à ± 30 min d'une activité Garmin) : ${skipped.length}`);
      skipped.forEach((r) => console.log(`  - ${r.localDate} ${r.sourceId} ${formatDistance(r.distanceM ?? 0)}`));
    }
    const links = await relink(userId, dates[0], dates[dates.length - 1]);
    console.log(`Liaisons prévu ↔ réalisé : ${links.created} créées, ${links.deleted} supprimées (manuelles intactes : ${links.manual}).`);
    await finishSyncRun(runId, { status: "success", upserted: rows.length });
  } catch (e) {
    await finishSyncRun(runId, { status: "error", upserted: 0, error: e instanceof Error ? e.message : String(e) });
    throw e;
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
