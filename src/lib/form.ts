// Lecture des champs de formulaire (server actions) : valeurs bornées, jamais de confiance dans le navigateur.

/** Entier entre 1 et `max` ; null si vide ou hors échelle. */
export function parseScale(value: FormDataEntryValue | null, max: number): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= max ? n : null;
}

/** Texte nettoyé, tronqué à `maxLength` ; null si vide. */
export function parseText(value: FormDataEntryValue | null, maxLength = 2000): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim().slice(0, maxLength);
  return t === "" ? null : t;
}

/** Chemin interne de retour (« /journal », « /seances/… ») ; sinon `fallback` (pas de redirection vers un autre site). */
export function parseReturnPath(value: FormDataEntryValue | null, fallback: string): string {
  if (typeof value !== "string") return fallback;
  return /^\/(journal|seances|echeances|plan)?(\/[\w-]*)*(\?[\w=&-]*)?$/.test(value) && !value.startsWith("//") ? value : fallback;
}

/** Identifiant uuid ; null sinon. */
export function parseUuid(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

/** Durée « 45:12 », « 1:06:00 » ou « 45 » (minutes) → secondes ; null si invalide ou nulle. */
export function parseDuration(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const v = value.trim().replace(/[hH']/g, ":").replace(/"/g, "");
  if (!/^\d{1,3}(:\d{1,2}){0,2}$/.test(v)) return null;
  const parts = v.split(":").map(Number);
  if (parts.slice(1).some((p) => p >= 60)) return null;
  const s = parts.length === 1 ? parts[0] * 60 : parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] * 3600 + parts[1] * 60 + parts[2];
  return s > 0 ? s : null;
}

/** Nombre décimal positif (« 10,5 » ou « 10.5 ») borné à `max` ; null sinon. */
export function parsePositive(value: FormDataEntryValue | null, max: number): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value.trim().replace(",", "."));
  return Number.isFinite(n) && n > 0 && n <= max ? n : null;
}

/** Date « AAAA-MM-JJ » valide ; null sinon. */
export function parseDate(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value ? value : null;
}

/** Heure « HH:MM » ; null sinon. */
export function parseTime(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null;
}
