import { inflateRawSync } from "node:zlib";

// Lecture du premier fichier d'un ZIP (le FIT d'une activité Garmin), sans dépendance.
// Les tailles sont lues dans le répertoire central : l'en-tête local peut les laisser à 0 (GARMIN.md §4).

const EOCD_SIGNATURE = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
const CENTRAL_SIGNATURE = 0x02014b50;

export function unzipFirst(zip: Buffer): { name: string; data: Buffer } {
  const eocd = zip.lastIndexOf(EOCD_SIGNATURE);
  if (eocd < 0) throw new Error("ZIP invalide : fin de répertoire central absente");
  const cd = zip.readUInt32LE(eocd + 16);
  if (zip.readUInt32LE(cd) !== CENTRAL_SIGNATURE) throw new Error("ZIP invalide : répertoire central introuvable");
  const method = zip.readUInt16LE(cd + 10);
  const compressedSize = zip.readUInt32LE(cd + 20);
  const nameLength = zip.readUInt16LE(cd + 28);
  const name = zip.subarray(cd + 46, cd + 46 + nameLength).toString("utf8");
  const local = zip.readUInt32LE(cd + 42);
  const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
  const raw = zip.subarray(start, start + compressedSize);
  if (method === 0) return { name, data: raw };
  if (method === 8) return { name, data: inflateRawSync(raw) };
  throw new Error(`ZIP : méthode de compression ${method} non gérée`);
}
