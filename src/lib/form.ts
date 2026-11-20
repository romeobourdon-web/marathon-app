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
