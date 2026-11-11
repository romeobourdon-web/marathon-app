# Architecture

## 1. Deux mondes à ne pas mélanger

| | L'usine (construire) | Le produit (utiliser) |
|---|---|---|
| Quand | Pendant le développement | Quand Roméo ouvre l'app |
| Qui | Roméo (décide), QG = projet Claude (architecte), Claude Code (atelier) | Le code : connecteurs, engine, planner, coach, UI |
| Mémoire | `docs/` dans ce repo | Base de données |

Seul pont entre QG et atelier : les fichiers `docs/`.
L'ingénieur et le coach **ne sont pas des conversations Claude** : ce sont des modules du produit.

## 2. Flux du produit

```
Montre Garmin
   │
src/connectors/  ── récupère activités, séries temporelles, bien-être (VFC, sommeil, FC repos) (phase 1)
   │
src/db/ (Supabase · Postgres) ── types, accès aux données (repository), seed
   │
src/engine/      ── « l'ingénieur » : calcule les métriques (code pur, testé)
   │
src/planner/     ── génère le plan (phases → semaines → séances), liaison prévu↔réalisé, règles d'adaptation
   │
src/coach/       ── « le coach » : API Claude, lit les données via des outils, explique, propose (phase 3)
   │
src/app/ + src/components/ ── interface (PWA mobile d'abord)
```

Tout le code applicatif est sous `src/` (alias d'import `@/*` → `src/*`). Les migrations SQL sont à la racine, dans `supabase/`.
Un dossier n'est créé que lorsqu'il reçoit du code (pas de dossier vide).
## 3. Modules

| Dossier | Rôle | Règles |
|---|---|---|
| `src/connectors/` | Accès aux sources (Garmin cible, Strava possible) — phase 1 | Même interface `DataSource` pour toutes les sources. Aucun autre module ne connaît Garmin ou Strava. |
| `src/db/` | `types.ts` (types des données), `repository.ts` (seul point d'accès aux données pour l'UI), `seed/` | `seed/reference.ts` = données réelles de référence (course, profil athlète, zones). `seed/mock/` = données fictives, et seulement là. |
| `supabase/` (racine) | Migrations SQL et configuration Supabase CLI — phase 1 | Migrations versionnées. |
| `src/engine/` | Calculs : écarts, statuts, pourcentages ; plus tard temps par zone, charge, forme/fatigue, découplage FC/allure, prédictions | Fonctions pures, pas de réseau ni de base de données, tests obligatoires (`*.test.ts`, vitest). Formules référencées dans `SCIENCE.md` (à venir). |
| `src/planner/` | Génération du plan (`buildPlan`), calendrier (semaine courante, phases), liaison prévu↔réalisé, résumés de semaine, règles d'adaptation | Fonctions pures qui reçoivent les données en argument. Le plan est une donnée, pas du texte (voir D11). |
| `src/coach/` | Prompts et outils du coach IA (phase 3) | Outils en lecture seule + un outil « proposer une modification », toujours validée par Roméo. |
| `src/lib/` | Utilitaires neutres : dates (`dates.ts`), formatage d'affichage (`format.ts`) | Fonctions pures, sans notion métier. |
| `src/app/`, `src/components/` | Écrans et design system | Aucun calcul métier dans l'UI : les écrans appellent `db/repository`, `planner/`, `engine/` et `lib/`, puis affichent. |

### Règles de dépendance
- `engine/`, `planner/` et `lib/` ne lisent jamais la base ni le réseau : les données leur sont passées en argument.
- `db/repository.ts` est le seul module qui sait d'où viennent les données (aujourd'hui : `seed/` ; demain : Supabase).
- Le plan est **généré** par `planner/buildPlan` à partir de `seed/reference.ts`, puis inséré en base. Ensuite, c'est la base qui fait foi (D11).

## 4. Modèle de données (V1, à affiner en phase 1)
- `athlete_profile` — FC max, zones, allures de référence, objectif
- `event` — courses et échéances (10 km, marathon…)
- `activity` + `activity_stream` — séances réalisées et séries temporelles
- `activity_metrics` — sorties de `engine/`
- `plan` → `plan_phase` → `planned_session` — le prévu
- `session_link` — liaison prévu ↔ réalisé + écart
- `daily_checkin` — questionnaire du matin (fatigue, sommeil ressenti, douleurs, motivation)
- `journal_entry` — ressenti après séance (RPE, notes)
- `wellness` — VFC, FC repos, sommeil (source Garmin)
- `coach_message` — historique du coach (phase 3)

## 5. Stack
- Next.js + TypeScript + Tailwind
- Supabase : Postgres + authentification (local via Supabase CLI, puis cloud)
- Vercel pour la mise en ligne (phase 4)
- PWA : installable sur le téléphone (une app native seulement si un besoin réel apparaît)
- API Claude pour le coach (phase 3)

## 6. Environnements
1. **Local** : `npm run dev` + Supabase local (`npm test` pour les tests)
2. **En ligne** (phase 4) : GitHub → Vercel (aperçu par branche) + Supabase cloud
Secrets : `.env.local` en local, variables d'environnement Vercel en ligne. Jamais dans le repo.
