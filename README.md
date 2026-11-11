# Marathon App

App web perso de pilotage d'une préparation marathon (Défi G1-G2, Centrale Lille).
Specs et décisions : voir [`docs/`](docs/) et [`CLAUDE.md`](CLAUDE.md).

## Lancer l'app

```bash
cd "/Users/romeo/Desktop/Centrale G1/DEFI G1G2/Application marathon"
npm install   # la première fois seulement
npm run dev
```

Ouvre ensuite http://localhost:3000. `Ctrl + C` dans le terminal pour arrêter.

Autres commandes : `npm run lint`, `npm run build`, `npm test`.

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
