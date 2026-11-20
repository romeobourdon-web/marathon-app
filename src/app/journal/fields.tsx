import { ScaleInput } from "@/components/ui/scale-input";
import { TextField } from "@/components/ui/text-field";
import type { Checkin } from "@/db/repository";

export const FEELING_WORDS = ["Épuisé", "Difficile", "Correct", "Bien", "Excellent"];

/** Les 4 échelles du questionnaire du matin + la note (DESIGN.md §6 « Journal »). */
export function CheckinFields({ checkin }: { checkin: Checkin | null }) {
  return (
    <>
      <ScaleInput legend="Fatigue" name="fatigue" lowLabel="Reposé" highLabel="Épuisé" defaultValue={checkin?.fatigue ?? undefined} required />
      <ScaleInput legend="Sommeil ressenti" name="sleep" lowLabel="Très mauvais" highLabel="Excellent" defaultValue={checkin?.sleepQuality ?? undefined} required />
      <ScaleInput legend="Douleur (Achille)" name="pain" lowLabel="Aucune" highLabel="Forte" defaultValue={checkin?.pain ?? undefined} required />
      <ScaleInput legend="Motivation" name="motivation" lowLabel="Faible" highLabel="Très forte" defaultValue={checkin?.motivation ?? undefined} required />
      <TextField id="checkin-note" name="note" label="Une note ? (facultatif)" defaultValue={checkin?.note ?? ""} maxLength={500} />
    </>
  );
}
