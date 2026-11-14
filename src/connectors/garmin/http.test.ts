import { describe, expect, it } from "vitest";
import { GarminHttp, jwtExpiryMs } from "./http";

const HOUR = 3600_000;
const jwt = (expSeconds: number) =>
  `x.${Buffer.from(JSON.stringify({ exp: expSeconds })).toString("base64url")}.y`;

/** fetch simulé : jetons numérotés, puis les réponses données pour les appels de données. */
function fakeFetch(dataResponses: Response[], tokenExp: () => number) {
  const calls: { url: string; auth: string }[] = [];
  let tokens = 0;
  const fn = (async (url: string | URL | Request, init?: RequestInit) => {
    const auth = String((init?.headers as Record<string, string>)?.Authorization ?? "");
    calls.push({ url: String(url), auth });
    if (String(url).endsWith("/personal-api-key/token")) {
      tokens++;
      return new Response(jwt(tokenExp()));
    }
    return dataResponses.shift() ?? new Response("[]");
  }) as typeof fetch;
  return { fn, calls, tokenCount: () => tokens };
}

describe("jwtExpiryMs", () => {
  it("lit le claim exp", () => {
    expect(jwtExpiryMs(jwt(1_800_000_000))).toBe(1_800_000_000_000);
    expect(jwtExpiryMs("pas-un-jwt")).toBeNull();
  });
});

describe("GarminHttp", () => {
  it("réutilise le jeton tant qu'il reste plus d'une heure, puis en redemande un", async () => {
    let now = 1_000_000_000_000;
    const f = fakeFetch([], () => (now + 24 * HOUR) / 1000);
    const http = new GarminHttp("cle-fictive", f.fn, () => now);
    await http.getJson("/a");
    now += HOUR; // il reste 23 h
    await http.getJson("/b");
    expect(f.tokenCount()).toBe(1);
    now += 22.5 * HOUR; // il reste 30 min
    await http.getJson("/c");
    expect(f.tokenCount()).toBe(2);
    expect(f.calls.find((c) => c.url.endsWith("/token"))?.auth).toBe("ApiKey cle-fictive");
    expect(f.calls.find((c) => c.url.endsWith("/a"))?.auth).toMatch(/^Bearer /);
  });

  it("redemande un jeton après un 401, puis réessaie", async () => {
    let now = 1_000_000_000_000;
    const f = fakeFetch([new Response("", { status: 401 }), new Response('{"ok":true}')], () => (now + 24 * HOUR) / 1000);
    const http = new GarminHttp("cle", f.fn, () => (now += 1000));
    expect(await http.getJson("/a")).toEqual({ ok: true });
    expect(f.tokenCount()).toBe(2);
  });

  it("attend puis réessaie après un 429", async () => {
    let now = 1_000_000_000_000;
    const f = fakeFetch(
      [new Response("", { status: 429, headers: { "retry-after": "0.001" } }), new Response('{"ok":true}')],
      () => (now + 24 * HOUR) / 1000,
    );
    const http = new GarminHttp("cle", f.fn, () => (now += 1000));
    expect(await http.getJson("/a")).toEqual({ ok: true });
  });

  it("renvoie null pour une réponse vide (204)", async () => {
    let now = 1_000_000_000_000;
    const f = fakeFetch([new Response(null, { status: 204 })], () => (now + 24 * HOUR) / 1000);
    const http = new GarminHttp("cle", f.fn, () => (now += 1000));
    expect(await http.getJson("/a")).toBeNull();
  });
});
