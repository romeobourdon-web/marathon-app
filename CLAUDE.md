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

## Règles de travail
1. **Mode plan d'abord** pour toute fonctionnalité ou restructuration : propose, attends validation, puis exécute.
2. **Petites étapes** : une étape = un commit clair (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
3. **Respecte les frontières de modules** (voir ARCHITECTURE.md) :
   - `engine/` = fonctions pures, testées, sans réseau ni base de données.
   - `connectors/` = seul endroit qui connaît Garmin/Strava.
   - Les composants UI n'effectuent aucun calcul métier.
4. **Aucun secret dans le code** : tout passe par `.env.local` (jamais commité).
5. **Pas de nouvelle dépendance** sans l'annoncer et expliquer pourquoi.
6. Si une demande contredit `docs/`, **signale-le** au lieu de trancher seul.
7. Fin de tâche : résume ce qui a changé, ce qui reste, et coche la tâche dans `docs/ROADMAP.md`.

## Conventions
- TypeScript strict. Interface en français, code et noms de variables en anglais.
- Mobile d'abord : chaque écran doit être utilisable sur un téléphone (390 px de large).
- Données fictives uniquement dans `db/seed/`, jamais en dur dans les composants.
