import { Decoder, Stream } from "@garmin/fitsdk";
import type { NeutralStream } from "@/connectors/types";
import { toNeutralStream, type FitRecord } from "./convert";

/** Décode un fichier FIT avec le SDK officiel Garmin (D21) et en extrait les séries temporelles. */
export function fitToStream(fit: Buffer): NeutralStream | null {
  const decoder = new Decoder(Stream.fromBuffer(fit));
  if (!decoder.isFIT()) throw new Error("Fichier FIT invalide");
  const { messages, errors } = decoder.read();
  if (errors.length > 0 && !messages.recordMesgs?.length) throw new Error(`FIT illisible : ${String(errors[0])}`);
  return toNeutralStream((messages.recordMesgs ?? []) as FitRecord[]);
}
