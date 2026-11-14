# Phase 1 — Missions Claude Code

Préparé par le QG le 2026-11-13 (D13 à D16). Une mission = une session Claude Code.
Pour lancer : « Exécute la mission Mx de docs/missions/phase-1.md », en **mode plan d'abord**, puis exécution une fois le plan validé.

Ordre : **M1 → M2 → M3 → M4 → M5**. M6 est indépendante : elle peut tourner en parallèle (session cloud possible).
M1 et M5 se lancent **en local sur le Mac** : la clé Garmin n'existe que dans `.env.local`.

| Mission | Modèle | Où | Dépend de |
|---|---|---|---|
| M1 Sonde Garmin | Opus 5.5 | local | clé Garmin |
| M2 Supabase local | Sonnet 5.5 | local | Docker Desktop |
| M3 Schéma V1 + seed | Opus 5.5 | local | M1 (retour au QG), M2 |
| M4 Repository Supabase | Sonnet 5.5 | local | M3 |
| M5 Connecteur Garmin | Opus 5.5 | local | M4 |
| M6 Design system v1 | Opus 5.5 | local ou cloud | — |

---

## M1 — Sonde Garmin

**Avant (Roméo) :**
1. Garmin Connect (web) → page « Personal API Key » → créer une clé valable **1 an**. Lire les conditions : affichage à un tiers (tuteur) ? envoi à une IA ?
2. Terminal, à la racine du projet : `echo 'GARMIN_PERSONAL_API_KEY=TA_CLE' >> .env.local`. Ne jamais coller la clé ailleurs.

```
Mission M1 — Sonde Garmin (exploration, aucun code produit).
Contexte : D13 et D15 dans docs/DECISIONS.md. La clé est dans .env.local sous GARMIN_PERSONAL_API_KEY.
But : savoir ce que l'API renvoie VRAIMENT avant d'écrire les migrations.
1. Lis la doc : https://developer.garmin.com/gc-developer-program/personal/personal-api, la FAQ et le Swagger lié. Liste les endpoints utiles : liste d'activités, détail ou fichier FIT, séries temporelles, résumés quotidiens, sommeil, VFC, FC de repos.
2. AVANT tout appel, ajoute samples/ au .gitignore.
3. Écris scripts/garmin-probe.ts (Node 24, fetch natif, AUCUNE dépendance). Le script obtient un token, appelle chaque endpoint sur les 30 derniers jours et enregistre les réponses brutes dans samples/garmin/.
4. Teste jusqu'où remonte l'historique (3 mois, 6 mois, 1 an) et note les limites de requêtes rencontrées.
5. Rédige docs/GARMIN.md : endpoints, champs disponibles comparés au schéma de docs/ARCHITECTURE.md §4 (activity, activity_stream, wellness), trous (VFC ? séries temporelles en JSON ou seulement via FIT ?), limites, historique disponible.
Interdits : afficher, logger ou committer la clé ; committer samples/ (traces GPS = adresse du domicile) ; écrire dans src/.
```
**Fin :** `docs/GARMIN.md` est commité et `git status` ne montre aucun fichier de `samples/`.
➡️ **Retour au QG avec GARMIN.md** avant M3 : on ajuste le schéma si besoin.

---

## M2 — Supabase local

**Avant (Roméo) :** installer **Docker Desktop** et l'ouvrir.

```
Mission M2 — Supabase local.
Lis docs/ARCHITECTURE.md (sections 3, 5 et 6).
1. Ajoute la CLI Supabase en dépendance de dev (package npm "supabase") : annonce cette nouvelle dépendance.
2. Lance npx supabase init : le dossier supabase/ doit être à la racine.
3. Ajoute les scripts npm : db:start, db:stop, db:reset, db:status.
4. Démarre Supabase local. Mets les URL et clés locales dans .env.local (jamais dans le repo) et crée .env.example avec les noms de variables, sans valeurs.
5. Désactive les inscriptions publiques dans supabase/config.toml (un seul utilisateur, D03).
6. Ajoute au README une section « Démarrer en local » de 5 lignes maximum.
```
**Fin :** `npm run db:status` répond sans erreur, Supabase Studio s'ouvre sur localhost, et lint, build et tests passent.

---

## M3 — Migrations et données de départ

```
Mission M3 — Schéma V1.
Lis docs/ARCHITECTURE.md §4, docs/DECISIONS.md (D11, D14) et docs/GARMIN.md.
1. Écris la migration supabase/migrations/<timestamp>_schema_v1.sql pour toutes les tables de ARCHITECTURE.md §4, daily_checkin compris, mais pas celles marquées « plus tard ».
Règles :
- user_id sur chaque table, RLS activée, politique « propriétaire uniquement » ;
- mesures brutes uniquement (m, s, m/s, bpm), rien de dérivé, pas d'écart stocké ;
- text + CHECK plutôt que des enums ;
- UNIQUE(source, source_id) sur activity ;
- séries temporelles = une ligne par activité, colonnes en tableaux ;
- colonne raw jsonb sur activity et wellness.
Si docs/GARMIN.md contredit le schéma, signale-le au lieu de trancher.
2. Écris un script de seed (npm run db:seed, dans scripts/). Il crée l'utilisateur local, insère le profil et l'événement depuis src/db/seed/reference.ts, génère le plan avec planner/buildPlan et l'insère (D11), puis ajoute les activités fictives de seed/mock/ avec source = 'mock'.
3. Génère les types TypeScript de la base (supabase gen types) dans src/db/database.types.ts.
```
**Fin :** `npm run db:reset && npm run db:seed` passe. Dans Studio : 30 semaines de séances prévues et la RLS active sur toutes les tables. Lint, build et tests passent.

---

## M4 — Repository branché sur Supabase

```
Mission M4 — Le repository lit Supabase.
Lis docs/ARCHITECTURE.md (règles de dépendance) et src/db/repository.ts.
1. Ajoute @supabase/supabase-js et @supabase/ssr : annonce ces dépendances.
2. Réécris src/db/repository.ts pour lire Supabase, en gardant les MÊMES signatures publiques (getRace, getPlanStart, getSessions…). Les écrans ne doivent pas changer.
3. Ajoute les fonctions d'écriture dont la synchro aura besoin : upsertActivities, upsertStreams, upsertWellness, linkSession, startSyncRun et finishSyncRun.
4. Connexion minimale : une page /login (email + mot de passe), les pages protégées redirigent vers /login. Utilise les tokens de DESIGN.md s'ils existent déjà, sinon reste neutre. Aucun travail de design.
5. La liaison prévu↔réalisé lit session_link ; le statut reste calculé par planner/.
```
**Fin :** une fois connecté, l'app affiche le même plan qu'avant, mais lu depuis la base. Les tests passent, et aucun écran n'importe `seed/` directement.

---

## M5 — Connecteur Garmin et synchro

```
Mission M5 — Connecteur Garmin et synchro.
Lis docs/ARCHITECTURE.md (connectors/, scripts/), docs/GARMIN.md et docs/DECISIONS.md (D13).
1. Crée src/connectors/types.ts avec l'interface DataSource : fetchActivities(from, to), fetchStreams(activityId), fetchWellness(from, to). Elle doit renvoyer des types neutres, sans rien de spécifique à Garmin.
2. Crée src/connectors/garmin/ : gestion du token (un nouveau token quand il expire, 24 h), appels et conversion Garmin → types neutres. Tests de conversion sur des données JSON anonymisées tirées de samples/ (pas de GPS réel dans les tests).
3. Si les séries temporelles n'existent qu'en FIT, propose une dépendance de lecture FIT (de préférence le SDK officiel Garmin) et attends ma validation.
4. Commande npm run sync [--from AAAA-MM-JJ] (scripts/sync.ts) : elle ouvre une entrée sync_run, récupère les données, fait les upserts via le repository, lie automatiquement chaque activité à la séance prévue du même jour et ferme l'entrée sync_run (succès ou erreur).
5. L'import initial part du 2026-04-04 (lancement du Défi, constante PROJECT_START).
```
**Fin :** `npm run sync` importe les vraies activités. Une **2ᵉ exécution n'ajoute aucun doublon**. Une entrée `sync_run` est en succès. L'app affiche le réalisé réel. Lint, build et tests passent.

---

## M6 — Design system v1

```
Mission M6 — Design system v1 (D16).
Lis docs/DESIGN.md en entier, docs/ARCHITECTURE.md §3, et le guide next/font dans node_modules/next/dist/docs/.
1. Tokens : déclare TOUS les tokens de DESIGN.md §3 (couleurs, typographie, espacements, rayons, bordures, tailles) dans src/app/globals.css, en variables CSS et dans @theme de Tailwind v4, avec les mêmes noms. Un seul fichier de tokens.
2. Polices Schibsted Grotesk et Fragment Mono via next/font/google (aucune dépendance npm).
3. Formats de DESIGN.md §3 dans src/lib/format.ts (allure, durée, distance avec virgule, écart signé avec le signe moins U+2212), avec tests.
4. Les 11 composants de DESIGN.md §4 dans src/components/ui/ : uniquement des props, accessibles (§6), aucune valeur en dur hors tokens.
5. Page /design (aperçu) : chaque composant dans toutes ses variantes. Les données viennent de src/db/seed/mock/ (crée-les là si besoin : score de forme, temps prédit, tendances). Toute valeur fictive affichée porte un Chip « démo » (D16).
6. Ne touche pas aux écrans existants (D10).
```
**Fin :** `/design` affiche les 11 composants correctement à 390 px de large, et lint, build et tests passent.

---

Hors de cette phase : le bouton « Synchroniser » et la synchro automatique arrivent en phase 4, avec la mise en ligne.
