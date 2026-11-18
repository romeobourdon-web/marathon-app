# Target 42

App web perso de pilotage d'une préparation marathon (Défi G1-G2, Centrale Lille).
Specs et décisions : voir [`docs/`](docs/) et [`CLAUDE.md`](CLAUDE.md).

## Démarrer en local

**Lancer l'app : double-clic sur Target 42 (Bureau).** Il ouvre Docker si besoin, démarre la base et l'app, puis ouvre http://localhost:3000 (équivalent en terminal : `npm run app`). Le lanceur est versionné dans `scripts/Target42.command`.

Installation (une seule fois) :

1. Ouvrir Docker Desktop, puis dans le dossier du projet : `npm install` (la première fois seulement).
2. `npm run db:start` : démarre Supabase en local (Studio : http://localhost:54323).
3. Compléter `.env.local` avec les variables listées dans `.env.example` (valeurs : `npm run db:status`).
4. `npm run dev`, puis ouvrir http://localhost:3000 (`Ctrl + C` pour arrêter).
5. Autres commandes : `npm run db:stop`, `npm run db:reset`, `npm run lint`, `npm run build`, `npm test`.

Données : `npm run sync` (Garmin, relit au moins les 14 derniers jours, D31) ; `npm run import:phone` (sorties enregistrées au téléphone, une seule fois, D32 ; sans risque si relancé).

## Sauvegarder / restaurer la base locale (D23)

La base contient des données réelles (journal non resynchronisable) : **jamais de `db:reset` sans sauvegarde**.
- Sauvegarder : `npm run db:backup` → `backups/AAAA-MM-JJ.sql` (dossier ignoré par git ; une 2e sauvegarde le même jour ajoute l'heure au nom, rien n'est écrasé).
- Restaurer : `npm run db:reset`, puis `docker exec -i supabase_db_Application_marathon psql -U postgres < backups/AAAA-MM-JJ.sql`.

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
