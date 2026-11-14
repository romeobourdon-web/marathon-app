/**
 * Sonde Garmin Personal API (mission M1, D13/D15) — exploration uniquement.
 *
 * Lancement : node --env-file=.env.local scripts/garmin-probe.ts
 *
 * - Lit GARMIN_PERSONAL_API_KEY dans l'environnement ; la clé et le jeton ne sont jamais affichés ni écrits.
 * - Enregistre les réponses brutes dans samples/garmin/ (ignoré par git : traces GPS, données de santé).
 * - Produit aussi des fichiers sans valeurs (_structure.json, _log.json, _summary.json) pour rédiger docs/GARMIN.md.
 * Aucune dépendance : fetch, fs et zlib natifs de Node 24.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { inflateRawSync } from "node:zlib";

const BASE_URL = "https://personal.connectapi.garmin.com";
const TOKEN_PATH = "/personalapitoken-service/personal-api/personal-api-key/token";
const OUT_DIR = join(process.cwd(), "samples", "garmin");
const PROJECT_START = "2026-04-04"; // 5 km de référence, lancement du Défi (D17)
const PAUSE_MS = 700;

type LogEntry = {
  name: string;
  path: string;
  status: number;
  ms: number;
  bytes: number;
  limitHeaders: Record<string, string>;
  error?: string;
};

const log: LogEntry[] = [];
const structures: Record<string, unknown> = {};
const summary: Record<string, unknown> = {};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function daysAgo(n: number): string {
  return isoDay(new Date(Date.now() - n * 86_400_000));
}

/** Remplace chaque valeur par son type : on garde la forme, jamais le contenu. */
function shape(value: unknown, depth = 0): unknown {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return { array: 0 };
    if (depth > 6) return { array: value.length };
    const objects = value.filter((v) => v && typeof v === "object" && !Array.isArray(v)).slice(0, 50);
    if (objects.length > 0) {
      const merged: Record<string, unknown> = {};
      for (const o of objects) {
        for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
          if (!(k in merged) || merged[k] === "null") merged[k] = shape(v, depth + 1);
        }
      }
      return { array: value.length, item: merged };
    }
    return { array: value.length, item: shape(value[0], depth + 1) };
  }
  if (typeof value === "object") {
    if (depth > 6) return "object";
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, shape(v, depth + 1)]));
  }
  return typeof value;
}

function limitHeaders(h: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  h.forEach((v, k) => {
    if (/rate|limit|retry|quota/i.test(k)) out[k] = v;
  });
  return out;
}

async function getToken(key: string): Promise<string> {
  const res = await fetch(BASE_URL + TOKEN_PATH, {
    method: "POST",
    headers: { Accept: "*/*", Authorization: `ApiKey ${key}` },
  });
  log.push({ name: "token", path: TOKEN_PATH, status: res.status, ms: 0, bytes: 0, limitHeaders: limitHeaders(res.headers) });
  if (!res.ok) throw new Error(`Échec d'obtention du jeton : HTTP ${res.status}`);
  const token = (await res.text()).trim();
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")) as { exp?: number; iat?: number };
    summary.tokenLifetimeHours = payload.exp && payload.iat ? (payload.exp - payload.iat) / 3600 : "inconnu";
  } catch {
    summary.tokenLifetimeHours = "jeton non JWT";
  }
  return token;
}

async function call(token: string, name: string, path: string, opts: { binary?: boolean; save?: boolean } = {}) {
  await sleep(PAUSE_MS);
  const t0 = Date.now();
  const res = await fetch(BASE_URL + path, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: opts.binary ? "application/zip, application/x-zip-compressed, application/octet-stream" : "application/json",
    },
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const entry: LogEntry = {
    name,
    path,
    status: res.status,
    ms: Date.now() - t0,
    bytes: buf.length,
    limitHeaders: limitHeaders(res.headers),
  };
  log.push(entry);
  console.log(`${res.status}  ${name}  (${buf.length} o)`);
  if (opts.binary) {
    if (res.ok && opts.save !== false) writeFileSync(join(OUT_DIR, `${name}.zip`), buf);
    return res.ok ? buf : null;
  }
  const text = buf.toString("utf8");
  if (opts.save !== false) writeFileSync(join(OUT_DIR, `${name}.json`), text);
  if (!res.ok) {
    entry.error = text.slice(0, 200);
    return null;
  }
  try {
    const json = text ? JSON.parse(text) : null;
    structures[name] = shape(json);
    return json;
  } catch {
    entry.error = "réponse non JSON";
    return null;
  }
}

// ── FIT : on compte les types de messages, sans décoder les valeurs ──────────
const FIT_MESSAGES: Record<number, string> = {
  0: "file_id", 12: "sport", 18: "session", 19: "lap", 20: "record", 21: "event", 23: "device_info",
  34: "activity", 49: "file_creator", 78: "hrv", 101: "length", 206: "field_description", 207: "developer_data_id",
  216: "time_in_zone", 285: "jump", 312: "split", 313: "split_summary",
};
const RECORD_FIELDS: Record<number, string> = {
  0: "position_lat", 1: "position_long", 2: "altitude", 3: "heart_rate", 4: "cadence", 5: "distance", 6: "speed",
  7: "power", 13: "temperature", 53: "fractional_cadence", 73: "enhanced_speed", 78: "enhanced_altitude", 253: "timestamp",
};

/** Premier fichier du ZIP. Tailles lues dans le répertoire central (l'en-tête local peut les laisser à 0). */
function unzipFirst(zip: Buffer): { name: string; data: Buffer } | null {
  const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) return null;
  const cd = zip.readUInt32LE(eocd + 16);
  if (zip.readUInt32LE(cd) !== 0x02014b50) return null;
  const method = zip.readUInt16LE(cd + 10);
  const compSize = zip.readUInt32LE(cd + 20);
  const nameLen = zip.readUInt16LE(cd + 28);
  const name = zip.subarray(cd + 46, cd + 46 + nameLen).toString("utf8");
  const local = zip.readUInt32LE(cd + 42);
  const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
  const raw = zip.subarray(start, start + compSize);
  return { name, data: method === 0 ? raw : inflateRawSync(raw) };
}

function fitMessageCounts(fit: Buffer) {
  const headerSize = fit[0];
  const dataSize = fit.readUInt32LE(4);
  const end = Math.min(headerSize + dataSize, fit.length);
  const defs = new Map<number, { global: number; size: number; fields: number[] }>();
  const counts: Record<string, number> = {};
  let recordFields: string[] = [];
  let p = headerSize;
  while (p < end) {
    const h = fit[p++];
    if (h & 0x80) {
      const def = defs.get((h >> 5) & 0x03);
      if (!def) break;
      const n = FIT_MESSAGES[def.global] ?? `global_${def.global}`;
      counts[n] = (counts[n] ?? 0) + 1;
      p += def.size;
    } else if (h & 0x40) {
      const local = h & 0x0f;
      const big = fit[p + 1] === 1;
      const global = big ? fit.readUInt16BE(p + 2) : fit.readUInt16LE(p + 2);
      const nFields = fit[p + 4];
      p += 5;
      let size = 0;
      const fields: number[] = [];
      for (let i = 0; i < nFields; i++, p += 3) {
        fields.push(fit[p]);
        size += fit[p + 1];
      }
      if (h & 0x20) {
        const nDev = fit[p++];
        for (let i = 0; i < nDev; i++, p += 3) size += fit[p + 1];
      }
      defs.set(local, { global, size, fields });
      if (global === 20) recordFields = fields.map((f) => RECORD_FIELDS[f] ?? `field_${f}`);
    } else {
      const def = defs.get(h & 0x0f);
      if (!def) break;
      const n = FIT_MESSAGES[def.global] ?? `global_${def.global}`;
      counts[n] = (counts[n] ?? 0) + 1;
      p += def.size;
    }
  }
  return { counts, recordFields, parsedToEnd: p >= end };
}

// ── Programme ───────────────────────────────────────────────────────────────
type Activity = { activityId: number; startTimeLocal?: string; activityType?: { typeKey?: string } };

async function listActivities(token: string, from: string | null, to: string | null, prefix: string) {
  const all: Activity[] = [];
  const limit = 100;
  for (let page = 0; page < 30; page++) {
    const range = from && to ? `&startDate=${from}&endDate=${to}` : "";
    const batch = (await call(
      token,
      `${prefix}-p${page}`,
      `/activitylist-service/activities/search/activities?start=${page * limit}&limit=${limit}${range}`,
    )) as Activity[] | null;
    if (!batch || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < limit) break;
  }
  return all;
}

async function main() {
  const key = process.env.GARMIN_PERSONAL_API_KEY;
  if (!key) throw new Error("GARMIN_PERSONAL_API_KEY absente : lance avec --env-file=.env.local");
  mkdirSync(OUT_DIR, { recursive: true });

  const token = await getToken(key);
  const today = isoDay(new Date());
  const from30 = daysAgo(30);
  const yesterday = daysAgo(1);

  // 1. Activités : depuis le lancement du Défi, puis sans filtre (plus ancienne activité du compte)
  const sinceStart = await listActivities(token, PROJECT_START, today, "activities-since-project-start");
  const allTime = await listActivities(token, null, null, "activities-all");
  const dates = (list: Activity[]) => list.map((a) => a.startTimeLocal ?? "").filter(Boolean).sort();
  const typeCounts = (list: Activity[]) =>
    list.reduce<Record<string, number>>((acc, a) => {
      const t = a.activityType?.typeKey ?? "inconnu";
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {});
  summary.activitiesSinceProjectStart = {
    count: sinceStart.length,
    oldest: dates(sinceStart)[0]?.slice(0, 10) ?? null,
    newest: dates(sinceStart).at(-1)?.slice(0, 10) ?? null,
    types: typeCounts(sinceStart),
  };
  summary.activitiesAllTime = {
    count: allTime.length,
    oldest: dates(allTime)[0]?.slice(0, 10) ?? null,
    newest: dates(allTime).at(-1)?.slice(0, 10) ?? null,
    truncated: allTime.length >= 3000,
  };

  // 2. Détail : course la plus récente et course la plus ancienne depuis le lancement du Défi
  const runs = sinceStart
    .filter((a) => /running/.test(a.activityType?.typeKey ?? ""))
    .sort((a, b) => (a.startTimeLocal ?? "").localeCompare(b.startTimeLocal ?? ""));
  const picks = [runs.at(-1), runs[0]].filter((a): a is Activity => Boolean(a));
  const fitReports: unknown[] = [];
  for (const [i, act] of picks.entries()) {
    const tag = i === 0 ? "latest-run" : "oldest-run";
    await call(token, `activity-detail-${tag}`, `/activity-service/activity/${act.activityId}`);
    await call(token, `activity-workouts-${tag}`, `/activity-service/activity/${act.activityId}/workouts`);
    const zip = await call(token, `activity-fit-${tag}`, `/download-service/files/activity/${act.activityId}`, { binary: true });
    if (zip) {
      const report: Record<string, unknown> = { tag, date: act.startTimeLocal?.slice(0, 10), zipBytes: zip.length };
      try {
        const entry = unzipFirst(zip);
        if (entry) {
          report.fileInZip = entry.name.replace(/^\d+/, "<id>");
          report.fitBytes = entry.data.length;
          Object.assign(report, fitMessageCounts(entry.data));
        }
      } catch (e) {
        report.parseError = String(e);
      }
      fitReports.push(report);
    }
  }
  summary.fit = fitReports;
  await call(token, "activity-types", "/activity-service/activity/activityTypes/simple");

  // 3. Bien-être sur 30 jours
  await call(token, "daily-summaries-30d", `/usersummary-service/v2/dailysummaries?startDate=${from30}&endDate=${today}`);
  await call(token, "sleep-summaries-30d", `/sleep-service/sleep/dailySleepSummariesByDate?startDate=${from30}&endDate=${today}`);
  await call(token, "sleep-day", `/sleep-service/sleep/dailySleep?date=${yesterday}`);
  await call(token, "hrv-daily-30d", `/hrv-service/hrv/daily/${from30}/${today}`);
  await call(token, "hrv-day", `/hrv-service/hrv/${yesterday}`);
  await call(token, "heart-rate-day", `/wellness-service/wellness/dailyHeartRate?date=${yesterday}`);
  await call(token, "hr-zones", "/biometric-service/heartRateZones/v2");
  await call(token, "vo2max-30d", `/metrics-service/metrics/maxmet/daily/${from30}/${today}`);
  await call(token, "stress-30d", `/usersummary-service/stats/stress/daily/${from30}/${today}`);
  await call(token, "body-battery-30d", `/wellness-service/wellness/bodyBattery/reports/daily?startDate=${from30}&endDate=${today}`);
  await call(token, "wellness-activity-30d", `/wellnessactivity-service/activity/summary/range/${from30}/${today}`);

  // 4. Profondeur d'historique (bien-être) et plage maximale par requête
  for (const [label, day] of [["3m", daysAgo(91)], ["6m", daysAgo(182)], ["project-start", PROJECT_START], ["1y", daysAgo(365)]]) {
    await call(token, `history-daily-summary-${label}`, `/usersummary-service/v2/dailysummaries?startDate=${day}&endDate=${day}`);
    await call(token, `history-sleep-${label}`, `/sleep-service/sleep/dailySleep?date=${day}`);
    await call(token, `history-hrv-${label}`, `/hrv-service/hrv/${day}`);
  }
  for (const days of [90, 180, 365]) {
    await call(token, `range-daily-summaries-${days}d`, `/usersummary-service/v2/dailysummaries?startDate=${daysAgo(days)}&endDate=${today}`);
    await call(token, `range-hrv-daily-${days}d`, `/hrv-service/hrv/daily/${daysAgo(days)}/${today}`);
    await call(token, `range-sleep-${days}d`, `/sleep-service/sleep/dailySleepSummariesByDate?startDate=${daysAgo(days)}&endDate=${today}`);
  }
  // Plages intermédiaires pour le sommeil et le stress (400 au-delà d'une certaine durée)
  for (const days of [7, 28, 31, 32, 45, 60]) {
    await call(token, `range-sleep-${days}d`, `/sleep-service/sleep/dailySleepSummariesByDate?startDate=${daysAgo(days - 1)}&endDate=${today}`, { save: false });
    await call(token, `range-stress-${days}d`, `/usersummary-service/stats/stress/daily/${daysAgo(days - 1)}/${today}`, { save: false });
  }

  writeFileSync(join(OUT_DIR, "_structure.json"), JSON.stringify(structures, null, 2));
  writeFileSync(join(OUT_DIR, "_log.json"), JSON.stringify(log, null, 2));
  writeFileSync(join(OUT_DIR, "_summary.json"), JSON.stringify(summary, null, 2));
  console.log(`\n${log.length} appels. Résultats dans samples/garmin/ (non versionné).`);
}

main().catch((e: unknown) => {
  writeFileSync(join(OUT_DIR, "_log.json"), JSON.stringify(log, null, 2));
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
