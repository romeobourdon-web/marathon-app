"use server";

import { redirect } from "next/navigation";
import { saveCheckin, saveJournal } from "@/db/repository";
import { todayInParis } from "@/lib/dates";
import { parseReturnPath, parseScale, parseText, parseUuid } from "@/lib/form";

/** Questionnaire du matin : une ligne par jour, remplacée si on le refait (upsert sur la date). */
export async function saveCheckinAction(formData: FormData): Promise<void> {
  await saveCheckin({
    date: todayInParis(),
    fatigue: parseScale(formData.get("fatigue"), 5),
    sleepQuality: parseScale(formData.get("sleep"), 5),
    pain: parseScale(formData.get("pain"), 5),
    motivation: parseScale(formData.get("motivation"), 5),
    note: parseText(formData.get("note")),
  });
  redirect(parseReturnPath(formData.get("from"), "/journal"));
}

/** Journal après séance (activité réalisée) ou raison de l'écart (séance prévue non faite, D20). */
export async function saveJournalAction(formData: FormData): Promise<void> {
  const activityId = parseUuid(formData.get("activity"));
  const sessionId = parseUuid(formData.get("session"));
  if (!activityId && !sessionId) throw new Error("Séance ou activité manquante.");
  await saveJournal(activityId ? { activityId } : { sessionId: sessionId! }, {
    feeling: activityId ? parseScale(formData.get("feeling"), 5) : null,
    rpe: activityId ? parseScale(formData.get("rpe"), 10) : null,
    pain: parseScale(formData.get("pain"), 5),
    comment: parseText(formData.get("comment")),
  });
  redirect(parseReturnPath(formData.get("from"), "/journal"));
}
