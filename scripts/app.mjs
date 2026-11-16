// Lanceur de l'app en local (npm run app) — aucune dépendance.
// 1. Démarre Supabase local (rien à faire s'il tourne déjà).
// 2. Lance next dev.
// 3. Ouvre http://localhost:3000 dans le navigateur par défaut dès que l'app répond.
// Ctrl + C arrête l'app (Supabase continue de tourner : npm run db:stop pour l'arrêter).

import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const URL_APP = "http://localhost:3000";
const BIN = (name) => fileURLToPath(new URL(`../node_modules/.bin/${name}`, import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function step(message) {
  console.log(`\n▶ ${message}`);
}

// 1. Supabase
step("Base de données (Supabase local)…");
const status = spawnSync(BIN("supabase"), ["status"], { cwd: ROOT, stdio: "ignore" });
if (status.status === 0) {
  console.log("  déjà démarrée.");
} else {
  const start = spawnSync(BIN("supabase"), ["start"], { cwd: ROOT, stdio: "inherit" });
  if (start.status !== 0) {
    console.error("\n✗ Supabase n'a pas démarré. Docker Desktop est-il ouvert ?");
    process.exit(1);
  }
}

// 2. next dev
step("Démarrage de l'app (next dev)…");
const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev"], { cwd: ROOT, stdio: "inherit" });
const stop = () => {
  next.kill("SIGINT");
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
next.on("exit", (code) => process.exit(code ?? 0));

// 3. Ouvre le navigateur quand l'app répond (la première requête compile la page, elle peut prendre quelques secondes).
for (let i = 0; i < 120; i++) {
  try {
    const res = await fetch(URL_APP, { redirect: "manual" });
    if (res.status < 500) {
      step(`App prête : ${URL_APP}`);
      // T42_NO_OPEN=1 : ne pas ouvrir le navigateur (tests).
      if (!process.env.T42_NO_OPEN) spawn("open", [URL_APP], { stdio: "ignore", detached: true }).unref();
      console.log("  (Ctrl + C pour arrêter)");
      break;
    }
  } catch {
    // pas encore prête
  }
  await sleep(1000);
}
