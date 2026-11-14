// Permet aux scripts Node (seed, synchro) d'importer le code de src/ tel quel, sans dépendance :
//  - « @/x » → src/x (alias du tsconfig) ;
//  - import sans extension → essaie .ts, .tsx puis /index.ts.
// Node 24 exécute le TypeScript directement (suppression des types) ; ce hook ne fait que résoudre les chemins.
// Usage : node --import ./scripts/register-paths.mjs scripts/seed.ts

import { statSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));
// Code du projet uniquement : les imports internes de node_modules sont laissés à Node.
const PROJECT_DIRS = [new URL("../src/", import.meta.url).href, new URL("./", import.meta.url).href];
const inProject = (url) => typeof url === "string" && PROJECT_DIRS.some((dir) => url.startsWith(dir));
const EXTENSIONS = [".ts", ".tsx", "/index.ts"];

const isFile = (path) => statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;

function withExtension(path) {
  if (isFile(path)) return path;
  for (const ext of EXTENSIONS) if (isFile(path + ext)) return path + ext;
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const file = withExtension(SRC + specifier.slice(2));
      if (file) return nextResolve(pathToFileURL(file).href, context);
    }
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && inProject(context.parentURL)) {
      const file = withExtension(fileURLToPath(new URL(specifier, context.parentURL)));
      if (file) return nextResolve(pathToFileURL(file).href, context);
    }
    return nextResolve(specifier, context);
  },
});
