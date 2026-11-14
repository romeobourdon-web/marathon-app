// Accès HTTP à la Garmin Personal API (docs/GARMIN.md §2, §6).
//  - Jeton : obtenu avec la clé personnelle, valable 24 h ; redemandé quand il reste moins d'une heure.
//  - Rythme : au moins PAUSE_MS entre deux appels ; 429 → attente (Retry-After) puis nouvel essai.
// La clé et le jeton ne sont jamais affichés ni écrits.

const BASE_URL = "https://personal.connectapi.garmin.com";
const TOKEN_PATH = "/personalapitoken-service/personal-api/personal-api-key/token";
const PAUSE_MS = 700;
const REFRESH_MARGIN_MS = 60 * 60 * 1000;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Date d'expiration (ms) lue dans le claim exp du JWT, sans vérifier la signature. */
export function jwtExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export class GarminHttp {
  private token: string | null = null;
  private expiresAt = 0;
  private lastCall = 0;
  // Champs explicites (pas de « parameter properties ») : Node exécute ce fichier en supprimant seulement les types.
  private readonly apiKey: string;
  private readonly fetchFn: typeof fetch;
  private readonly now: () => number;

  constructor(apiKey: string, fetchFn: typeof fetch = fetch, now: () => number = Date.now) {
    this.apiKey = apiKey;
    this.fetchFn = fetchFn;
    this.now = now;
  }

  private async getToken(force = false): Promise<string> {
    if (!force && this.token && this.expiresAt - this.now() > REFRESH_MARGIN_MS) return this.token;
    const res = await this.fetchFn(BASE_URL + TOKEN_PATH, {
      method: "POST",
      headers: { Accept: "*/*", Authorization: `ApiKey ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`Garmin : jeton refusé (HTTP ${res.status}). Clé expirée ou invalide ?`);
    const token = (await res.text()).trim();
    this.token = token;
    this.expiresAt = jwtExpiryMs(token) ?? this.now() + 23 * 60 * 60 * 1000;
    return token;
  }

  private async pace() {
    const wait = this.lastCall + PAUSE_MS - this.now();
    if (wait > 0) await sleep(wait);
    this.lastCall = this.now();
  }

  /** GET authentifié. Renvoie la réponse brute (statut 2xx) ; 204 → corps vide. */
  private async get(path: string, accept: string): Promise<Response> {
    let refreshed = false;
    for (let attempt = 0; ; attempt++) {
      await this.pace();
      const token = await this.getToken();
      const res = await this.fetchFn(BASE_URL + path, { headers: { Authorization: `Bearer ${token}`, Accept: accept } });
      if (res.status === 401 && !refreshed) {
        refreshed = true;
        await this.getToken(true);
        continue;
      }
      if (res.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter = Number(res.headers.get("retry-after"));
        await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 30_000 * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`Garmin : ${path.split("?")[0]} → HTTP ${res.status}`);
      return res;
    }
  }

  /** JSON d'un endpoint ; null si la réponse est vide (204, jour sans donnée). */
  async getJson<T>(path: string): Promise<T | null> {
    const res = await this.get(path, "application/json");
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : null;
  }

  /** Fichier binaire (ZIP du FIT). */
  async getBinary(path: string): Promise<Buffer> {
    const res = await this.get(path, "application/zip, application/x-zip-compressed, application/octet-stream");
    return Buffer.from(await res.arrayBuffer());
  }
}
