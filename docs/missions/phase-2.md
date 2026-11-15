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

## P2-M4 — Écran Aujourd'hui · Opus

À préparer au QG après P2-M3. Maquettes : docs/maquettes/Today-390.html et Today-1280.html.
