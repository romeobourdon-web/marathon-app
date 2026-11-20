"use server";

import { redirect } from "next/navigation";
import { addEvent } from "@/db/repository";
import { parseDate, parseDuration, parsePositive, parseText } from "@/lib/form";

/** Nouvelle échéance (course ou test, D33). Aucune échéance fictive : seulement ce que Roméo saisit. */
export async function addEventAction(formData: FormData): Promise<void> {
  const name = parseText(formData.get("name"), 120);
  const date = parseDate(formData.get("date"));
  const distanceKm = parsePositive(formData.get("distance"), 300);
  const target = formData.get("target");
  const targetTimeSec = typeof target === "string" && target.trim() !== "" ? parseDuration(target) : null;
  const kind = formData.get("kind") === "test" ? "test" : "race";
  if (!name || !date || !distanceKm || (typeof target === "string" && target.trim() !== "" && targetTimeSec === null)) {
    redirect("/echeances/ajout?erreur=1");
  }
  await addEvent({ name, date, distanceKm, targetTimeSec, kind });
  redirect("/echeances");
}
