// Source Garmin Personal API (D13) : implémente DataSource avec des types neutres.
// Endpoints et limites : docs/GARMIN.md.

import type { DataSource, FetchActivitiesOptions, NeutralActivity, NeutralStream, NeutralWellness } from "@/connectors/types";
import { dateChunks } from "@/lib/dates";
import {
  toNeutralActivity,
  toNeutralWellness,
  type GarminActivity,
  type GarminActivityDetail,
  type GarminDailySummary,
  type GarminHrvSummary,
  type GarminSleepSummary,
} from "./convert";
import { fitToStream } from "./fit";
import { GarminHttp } from "./http";
import { unzipFirst } from "./zip";

const PAGE_SIZE = 100;
// Plages max. par requête constatées (GARMIN.md §3) : sommeil ≤ 32 jours ; résumés et VFC : 365 jours.
const SLEEP_CHUNK_DAYS = 31;
const LONG_CHUNK_DAYS = 180;

export function createGarminSource(apiKey: string, http = new GarminHttp(apiKey)): DataSource {
  return {
    source: "garmin",

    async fetchActivities(from: string, to: string, options: FetchActivitiesOptions = {}): Promise<NeutralActivity[]> {
      const list: GarminActivity[] = [];
      for (let start = 0; ; start += PAGE_SIZE) {
        const page = await http.getJson<GarminActivity[]>(
          `/activitylist-service/activities/search/activities?start=${start}&limit=${PAGE_SIZE}&startDate=${from}&endDate=${to}`,
        );
        if (!page || page.length === 0) break;
        list.push(...page);
        if (page.length < PAGE_SIZE) break;
      }
      const activities: NeutralActivity[] = [];
      for (const a of list) {
        // Détail (ressenti saisi sur la montre, D20) seulement pour les nouvelles activités.
        const known = options.knownSourceIds?.has(String(a.activityId));
        const detail = known ? null : await http.getJson<GarminActivityDetail>(`/activity-service/activity/${a.activityId}`);
        activities.push(toNeutralActivity(a, detail));
      }
      return activities;
    },

    async fetchStreams(sourceId: string): Promise<NeutralStream | null> {
      const zip = await http.getBinary(`/download-service/files/activity/${sourceId}`);
      return fitToStream(unzipFirst(zip).data);
    },

    async fetchWellness(from: string, to: string): Promise<NeutralWellness[]> {
      const summaries: GarminDailySummary[] = [];
      const hrv: GarminHrvSummary[] = [];
      const sleep: GarminSleepSummary[] = [];
      for (const c of dateChunks(from, to, LONG_CHUNK_DAYS)) {
        const s = await http.getJson<{ data?: GarminDailySummary[] }>(`/usersummary-service/v2/dailysummaries?startDate=${c.from}&endDate=${c.to}`);
        summaries.push(...(s?.data ?? []));
        const h = await http.getJson<{ hrvSummaries?: GarminHrvSummary[] }>(`/hrv-service/hrv/daily/${c.from}/${c.to}`);
        hrv.push(...(h?.hrvSummaries ?? []));
      }
      for (const c of dateChunks(from, to, SLEEP_CHUNK_DAYS)) {
        const s = await http.getJson<GarminSleepSummary[]>(`/sleep-service/sleep/dailySleepSummariesByDate?startDate=${c.from}&endDate=${c.to}`);
        sleep.push(...(s ?? []));
      }
      return toNeutralWellness(summaries, hrv, sleep);
    },
  };
}
