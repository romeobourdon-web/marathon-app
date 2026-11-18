// Recalcul des liaisons automatiques prévu ↔ réalisé (D28 à D30), partagé par la synchro et l'import téléphone.
// Le jour même d'abord, sinon une séance libre à ± 1 jour de la même semaine si l'activité fait ≥ 50 % du prévu.
// Seules les courses qui comptent pour le plan sont liées. Les liaisons manuelles ne sont jamais modifiées.
import { deleteLinks, getLinkState, linkSession } from "@/db/repository";
import { countsForPlan } from "@/engine/activity";
import { addDays } from "@/lib/dates";
import { computeAutoLinks, diffLinks } from "@/planner/link";

/** Recalcule les liaisons automatiques entre deux dates (fenêtre élargie d'un jour de chaque côté). */
export async function relink(userId: string, from: string, to: string): Promise<{ created: number; deleted: number; manual: number }> {
  const state = await getLinkState(userId, addDays(from, -1), addDays(to, 1));
  const manual = state.links.filter((l) => l.method === "manual");
  const desired = computeAutoLinks(
    state.sessions,
    state.activities.map((a) => ({ ...a, eligible: countsForPlan(a, state.planStart) })),
    manual,
  );
  const { toDelete, toInsert } = diffLinks(
    state.links.filter((l) => l.method === "auto"),
    desired,
  );
  await deleteLinks(toDelete.map((l) => l.id));
  for (const l of toInsert) await linkSession(userId, l.sessionId, l.activityId, "auto");
  return { created: toInsert.length, deleted: toDelete.length, manual: manual.length };
}
