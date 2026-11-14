// Permet aux scripts Node (seed, synchro) d'importer le code de src/ tel quel, sans dépendance :
//  - « @/x » → src/x (alias du tsconfig) ;
//  - import sans extension → essaie .ts, .tsx puis /index.ts.
// Node 24 exécute le TypeScript directement (suppression des types) ; ce hook ne fait que résoudre les chemins.
// Usage : node --import ./scripts/register-paths.mjs scripts/seed.ts

import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));
const EXTENSIONS = [".ts", ".tsx", "/index.ts"];

function withExtension(path) {
  if (existsSync(path) && !path.endsWith("/")) return path;
  for (const ext of EXTENSIONS) if (existsSync(path + ext)) return path + ext;
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const file = withExtension(SRC + specifier.slice(2));
      if (file) return nextResolve(pathToFileURL(file).href, context);
    }
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
      const file = withExtension(fileURLToPath(new URL(specifier, context.parentURL)));
      if (file) return nextResolve(pathToFileURL(file).href, context);
    }
    return nextResolve(specifier, context);
  },
});
