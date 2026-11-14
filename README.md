# Marathon App

App web perso de pilotage d'une préparation marathon (Défi G1-G2, Centrale Lille).
Specs et décisions : voir [`docs/`](docs/) et [`CLAUDE.md`](CLAUDE.md).

## Démarrer en local

1. Ouvrir Docker Desktop, puis dans le dossier du projet : `npm install` (la première fois seulement).
2. `npm run db:start` : démarre Supabase en local (Studio : http://localhost:54323).
3. Compléter `.env.local` avec les variables listées dans `.env.example` (valeurs : `npm run db:status`).
4. `npm run dev`, puis ouvrir http://localhost:3000 (`Ctrl + C` pour arrêter).
5. Autres commandes : `npm run db:stop`, `npm run db:reset`, `npm run lint`, `npm run build`, `npm test`.

## Structure

```
docs/            specs, architecture, décisions, roadmap, design
src/app/         écrans (Next.js App Router)
src/components/  composants d'interface
src/db/          types des données, repository (accès aux données), seed/ (référence + mock/)
src/planner/     génération du plan, calendrier, prévu ↔ réalisé
src/engine/      calculs purs et testés
src/lib/         utilitaires neutres (dates, formatage)
```

Détails et règles : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
