"use server";

import { redirect } from "next/navigation";
import { MANUAL_SPORTS, manualRunToActivity } from "@/connectors/manual";
import { relink } from "@/db/relink";
import { addManualActivity, getCurrentUserId } from "@/db/repository";
import { parseDate, parseDuration, parsePositive, parseTime } from "@/lib/form";

/** Sortie faite sans montre (D18, D33) : enregistrée avec source = 'manual', puis liaisons recalculées. */
export async function addManualRunAction(formData: FormData): Promise<void> {
  const date = parseDate(formData.get("date"));
  const time = parseTime(formData.get("time"));
  const sport = String(formData.get("sport") ?? "");
  const distanceKm = parsePositive(formData.get("distance"), 300);
  const durationSec = parseDuration(formData.get("duration"));
  const hr = parsePositive(formData.get("hr"), 250);
  if (!date || !time || !distanceKm || !durationSec || !(MANUAL_SPORTS as readonly string[]).includes(sport)) {
    redirect("/seances/ajout?erreur=1");
  }
  const activity = manualRunToActivity(
    { date, time, sport, distanceKm, durationSec, avgHr: hr ? Math.round(hr) : null },
    `manual:${crypto.randomUUID()}`,
  );
  const id = await addManualActivity(activity);
  await relink(await getCurrentUserId(), date, date);
  redirect(`/seances/${id}`);
}
