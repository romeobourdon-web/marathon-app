# Marathon App — instructions pour Claude Code

App web perso de pilotage d'une préparation marathon (Défi G1-G2, Centrale Lille).
Un seul utilisateur (Roméo) + un accès tuteur en lecture seule.

## Avant toute tâche
Lis les documents utiles dans `docs/` :
- `docs/VISION.md` — pourquoi l'app existe, périmètre, principes
- `docs/ARCHITECTURE.md` — modules, flux de données, règles (À RESPECTER)
- `docs/DECISIONS.md` — décisions prises (ne pas les contredire sans le signaler)
- `docs/ROADMAP.md` — phase en cours et tâches
- `docs/DESIGN.md` — direction visuelle

Avant d'écrire du code Next.js : lis `AGENTS.md` et le guide correspondant dans `node_modules/next/dist/docs/` (cette version de Next.js diffère de ce que tu connais).

## Règles de travail
1. **Mode plan d'abord** pour toute fonctionnalité ou restructuration : propose, attends validation, puis exécute.
2. **Petites étapes** : une étape = un commit clair (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
3. **Respecte les frontières de modules** (voir ARCHITECTURE.md) :
   - `src/engine/` = fonctions pures, testées, sans réseau ni base de données.
   - `src/connectors/` = seul endroit qui connaît Garmin/Strava.
   - Les composants UI n'effectuent aucun calcul métier.
4. **Aucun secret dans le code** : tout passe par `.env.local` (jamais commité).
5. **Pas de nouvelle dépendance** sans l'annoncer et expliquer pourquoi.
6. Si une demande contredit `docs/`, **signale-le** au lieu de trancher seul.
7. Fin de tâche : résume ce qui a changé, ce qui reste, et coche la tâche dans `docs/ROADMAP.md`.

## Autonomie
Voir D12 (`docs/DECISIONS.md`) et les permissions de `.claude/settings.json`.
- Quand un plan est validé, exécute-le jusqu'au bout sans redemander.
- Après chaque étape : `npm run lint` + `npm run build` + `npm test`. Si tout passe, commit. À la fin, push.
- Arrête-toi seulement si : nouvelle dépendance, suppression non prévue, contradiction avec `docs/`, ou deux échecs de suite sur le même problème.
- Termine toujours par un résumé de 10 lignes maximum : fait / écarts / hors cadre.

## Conventions
- TypeScript strict. Interface en français, code et noms de variables en anglais.
- Mobile d'abord : chaque écran doit être utilisable sur un téléphone (390 px de large).
- Données de référence réelles (course, profil athlète, zones) uniquement dans `src/db/seed/reference.ts`.
- Données fictives uniquement dans `src/db/seed/mock/`. Jamais de données en dur dans les composants.
