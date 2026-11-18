# Phase 2 — Missions Claude Code

Préparé par le QG. Une mission = une session (ou une file d'attente dans la même session).
Pour lancer : « git pull, puis exécute la mission P2-Mx de docs/missions/phase-2.md ».

P2-M1 (valeurs justes, D22, D23, D26, D28) : ✅ faite (commit 07f847a).

---

## P2-M2 — Liaison : seuil et recalcul (D29) · Sonnet

```
Mission P2-M2. Lis D28 et D29 dans docs/DECISIONS.md.
1. planner/link : une liaison à ± 1 jour n'est faite que si la distance de l'activité ≥ 50 % de la distance prévue. Le jour même, toute course compte et s'agrège (inchangé).
2. À chaque npm run sync, recalcule les liaisons method = 'auto' (jamais les 'manual') : une activité du jour même remplace une liaison à ± 1 jour.
3. Tests vitest : 0,41 km la veille d'une sortie longue de 18 km → pas de liaison ; 14,5 km la veille d'une sortie longue de 21 km → liaison ; même cas puis une course le jour même → la liaison passe à la course du jour ; liaison manuelle intacte après recalcul.
4. Applique aux données existantes (npm run db:backup avant), puis vérifie le 17-18 oct. et le 14-15 nov.
```
**Fin :** tests verts, cas du 17 oct. délié, lint/build/tests, ROADMAP cochée, push.

---

## P2-M3 — Design system v2.1 « Corail » · Opus

```
Mission P2-M3. Lis docs/DESIGN.md (v2.1) en entier, D24, D25, D27. Référence visuelle exacte : docs/maquettes/t42-reference.css et docs/maquettes/Today-*.html (chiffres fictifs, ne pas les recopier).
1. globals.css : remplace les valeurs v1 par les tokens v2.1 (§4), mêmes noms ; ajoute les tokens marqués +, renomme --font-mono → --font-display. Ombres, mouvement, tailles, rayons.
2. Polices : Barlow (400-700) et Barlow Condensed (600, 700) via next/font/google ; retire Schibsted Grotesk et Fragment Mono.
3. Les 12 composants de src/components/ui/ prennent l'aspect v2.1 (§5) sans changer leurs props existantes ; ajoute les variantes v2.1 (Chip off/demo, Button toggle, Stat compare, zone visée de TrendChart line) et le 13e composant PhaseTimeline. Chaque composant est responsive par lui-même (390 px et ≥ 1024 px).
4. La nav responsive (barre en bas sur téléphone, pilules dans l'en-tête sur PC, 5 destinations §3) devient un composant de ui/ ; ne branche encore aucun écran dessus.
5. /design montre chaque composant et chaque variante, en 390 et 1280 px, valeurs fictives marquées « démo » (données dans src/db/seed/mock/).
6. Ne touche pas aux écrans du prototype (src/app/(prototype)/) : leur migration est P2-M4 (D25).
```
**Fin :** /design conforme à DESIGN.md v2.1 à 390 et 1280 px, contrastes de §4 respectés, aucune couleur ou taille en dur hors tokens dans ui/, lint/build/tests, ROADMAP cochée, push.

---

## P2-M3b — Sécurité Next.js + D30 · Sonnet

```
1. Sécurité : Next.js 16.4.2 a une faille connue (alerte de l'overlay de dev). Lance `npx next upgrade --agent=security` et suis ses instructions pour passer à la version corrigée de la même version majeure (16.x). Annonce la version dans ton résumé. Relis AGENTS.md après la mise à jour.
2. D30 : dans planner/link, une liaison à ± 1 jour reste dans la même semaine du plan (lundi → dimanche). Test : 10,5 km un lundi ne réalise pas la sortie longue de la veille. db:backup, puis applique aux données (cas du 18-19 oct.).
```
**Fin :** plus d'alerte de sécurité dans l'overlay, test D30 vert.

---

## P2-M3c — Données complètes (D31, D32) · Opus

```
1. Synchro (D31) : chaque npm run sync relit au minimum les 14 derniers jours et met à jour les activités existantes (sport, distance, durées, FC…), puis recalcule les liaisons automatiques (D29).
2. Libellés de sport en français dans lib/format.ts (running → Course, treadmill_running → Tapis, trail_running → Trail, cycling → Vélo, soccer/football → Football, walking → Marche, hiking → Randonnée, stand_up_paddleboarding → Paddle, autre → Autre). Vérifie dans samples/ ou en base le typeKey Garmin réel du football.
3. Import téléphone (D32) : scripts/import-phone-runs.ts + npm run import:phone. Lit data/imports/strava-phone-runs.json, insère chaque sortie avec source = 'manual', source_id = 'strava:<id>', start_time converti depuis Europe/Paris, pas de séries temporelles. Idempotent (UNIQUE source, source_id). Saute toute sortie dont le départ est à ± 30 min d'une activité Garmin, et la liste. db:backup avant, puis lance l'import et recalcule les liaisons.
4. Vérification : rends le tableau des km par semaine du plan S1 à S9 (course uniquement, D28) avant/après import. Attendu après import (QG, depuis Strava) : S1 39,1 · S2 42,4 · S3 29,6 · S4 36,0 · S5 51,1 · S6 47,4 · S7 48,0 · S8 43,0 hors foot · S9 selon la synchro. Explique tout écart > 0,5 km.
```
**Fin :** 47 sorties importées (ou la liste de celles sautées), totaux hebdo conformes, les activités de foot présentes en base avec leur sport.

---

## P2-M4 — Écran Aujourd'hui · Opus

```
Maquettes : docs/maquettes/Today-390.html et Today-1280.html (chiffres fictifs). DESIGN.md v2.2 §6 « Aujourd'hui ».
1. Sors / du route group (prototype) : nouvelle page / en v2.2, avec AppNav (5 destinations ; les écrans pas encore migrés restent accessibles tels quels, /echeances peut afficher « bientôt »).
2. Cartes, dans l'ordre de la maquette : StatusBand · Séance du jour (règle « jour de repos » → « Prochaine séance ») · Forme · Cette semaine · Focus endurance · Tendance du volume (8 semaines sur téléphone, tout le plan sur PC). Grille 6 colonnes sur PC selon la maquette.
3. Forme : le score reste « démo » (D16, phase 3) mais les 4 Stat utilisent les vraies valeurs de wellness et du dernier questionnaire si elles existent (sinon « — »). Le bouton « Questionnaire du matin » est le seul primary ; il mène à /journal tant que la saisie n'existe pas.
4. Cette semaine : réalisé = toutes les courses (D28), pastilles par jour, et la ligne « + n activités hors plan (sport, km) » (D31).
5. Tous les chiffres viennent de engine/ ou planner/ (ajoute les fonctions manquantes, avec tests) ; l'UI ne calcule rien. Vérifie à 390 et 1280 px.
```
**Fin :** / conforme aux maquettes avec les vraies données, aucun chiffre en dur, lint/build/tests.

---

## P2-M5 — Séances + détail · Opus

```
Maquettes : docs/maquettes/seances-et-detail.md (+ t42-reference.css). DESIGN.md §6 « Séances » et « Détail ».
1. /seances en v2.2 : filtres (Toutes · Course · Hors plan · Non réalisées), groupes par semaine du plan puis « Avant le plan », cartes réalisée / non réalisée / hors plan (D31), écarts signés seulement hors zone.
2. /seances/[id] : en-tête, Prévu/réalisé (+ durée, D+, cadence × 2), Mon ressenti (ou bouton « Ajouter mon ressenti » → /journal), Allure et FC par km avec zone visée (TrendChart line), Tours km par km, Analyse du coach « phase 3 ». Une activité sans séries (import téléphone) n'affiche que Prévu/réalisé et ressenti.
3. engine/ : découpage km par km depuis activity_stream (allure, FC), détection « dérive en fin » (FC au-dessus de la zone sur les 3 derniers km), avec tests.
4. Retire les anciennes pages /seances du prototype une fois remplacées (D25).
```
**Fin :** les deux écrans conformes à 390 et 1280 px avec les vraies données, lint/build/tests.
