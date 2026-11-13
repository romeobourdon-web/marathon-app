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
Montre Garmin → Garmin Connect Personal API (D13)
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
| `src/connectors/` | Accès aux sources : Garmin Personal API (D13) ; plan B = import de fichiers .FIT — phase 1 | Même interface `DataSource` pour toutes les sources, types neutres en sortie. Aucun autre module ne connaît Garmin. Lecture seule. |
| `src/db/` | `types.ts` (types des données), `repository.ts` (seul point d'accès aux données pour l'UI), `seed/` | `seed/reference.ts` = données réelles de référence (course, profil athlète, zones). `seed/mock/` = données fictives, et seulement là. |
| `supabase/` (racine) | Migrations SQL et configuration Supabase CLI — phase 1 | Migrations versionnées. |
| `scripts/` (racine) | Commandes ponctuelles : sonde Garmin, seed, `npm run sync` | Pas de logique métier : orchestre `connectors/` et `db/repository`. |
| `samples/` (racine) | Réponses brutes de l'API pour l'exploration | **Ignoré par git**, jamais commité (traces GPS). |
| `src/engine/` | Calculs : écarts, statuts, pourcentages ; plus tard temps par zone, charge, forme/fatigue, découplage FC/allure, prédictions | Fonctions pures, pas de réseau ni de base de données, tests obligatoires (`*.test.ts`, vitest). Formules référencées dans `SCIENCE.md` (à venir). |
| `src/planner/` | Génération du plan (`buildPlan`), calendrier (semaine courante, phases), liaison prévu↔réalisé, résumés de semaine, règles d'adaptation | Fonctions pures qui reçoivent les données en argument. Le plan est une donnée, pas du texte (voir D11). |
| `src/coach/` | Prompts et outils du coach IA (phase 3) | Outils en lecture seule + un outil « proposer une modification », toujours validée par Roméo. |
| `src/lib/` | Utilitaires neutres : dates (`dates.ts`), formatage d'affichage (`format.ts`) | Fonctions pures, sans notion métier. |
| `src/app/`, `src/components/` | Écrans et design system (`src/components/ui/` = composants de `DESIGN.md`) | Aucun calcul métier dans l'UI : les écrans appellent `db/repository`, `planner/`, `engine/` et `lib/`, puis affichent. Les composants `ui/` reçoivent tout en props et n'importent jamais `db/`, `engine/` ni `planner/`. |

### Règles de dépendance
- `engine/`, `planner/` et `lib/` ne lisent jamais la base ni le réseau : les données leur sont passées en argument.
- `db/repository.ts` est le seul module qui sait d'où viennent les données (aujourd'hui : `seed/` ; demain : Supabase).
- Le plan est **généré** par `planner/buildPlan` à partir de `seed/reference.ts`, puis inséré en base. Ensuite, c'est la base qui fait foi (D11).

## 4. Modèle de données (V1 — D14, à ajuster après la sonde M1)

Principes : `user_id` + RLS sur chaque table · mesures brutes uniquement (m, s, m/s, bpm) · écarts, allures et statuts **calculés** par `engine/` et `planner/`, jamais stockés · `text` + `CHECK` plutôt que des enums · une table n'est créée que quand elle sert.

```
── Référence ─────────────────────────────────────────
athlete_profile   user_id PK · hr_max · hr_rest? · zones jsonb (TrainingZones) · goal_event_id → event
event             id · name · date · distance_m · target_time_s · priority (A/B/C)

── Prévu (D11 : généré par buildPlan, puis la base fait foi) ──
plan              id · name · start_date · is_active · generator_version
plan_phase        id · plan_id → plan · code (base|construction|specifique|affutage) · name · goal · week_from · week_to
planned_session   id · plan_id → plan · phase_id → plan_phase · date · week · type (SessionType)
                  · title · details · distance_m · pace_min_s_km · pace_max_s_km · hr_min · hr_max
                  · origin (generator|manual|coach) · updated_at

── Réalisé (source : Garmin, D13) ─────────────────────
activity          id · source (garmin|fit_file|mock) · source_id · UNIQUE(source, source_id)
                  · start_time timestamptz · local_date · sport · distance_m · moving_time_s · elapsed_time_s
                  · avg_hr · max_hr · avg_speed_mps · elevation_gain_m · raw jsonb
activity_stream   activity_id PK → activity · time_s[] · distance_m[] · hr[] · speed_mps[] · altitude_m[] · cadence[] · lat[] · lng[]
wellness          (user_id, date) PK · resting_hr · hrv_ms · sleep_s · sleep_score · raw jsonb
sync_run          id · source · started_at · finished_at · status · range_from · range_to · upserted · error

── Liaison & ressenti ────────────────────────────────
session_link      id · planned_session_id → planned_session · activity_id → activity (UNIQUE) · method (auto|manual)
journal_entry     id · activity_id → activity (UNIQUE) · feeling 1-5 · rpe 1-10 · note
daily_checkin     (user_id, date) PK · fatigue 1-5 · sleep_quality 1-5 · soreness 1-5 · motivation 1-5 · pain_note
```

Relations : plan 1→n plan_phase 1→n planned_session ; planned_session 1→0..n activity (via session_link, ex. double footing) ; activity 1→0..1 journal_entry.

Plus tard (créées quand elles servent) :
- `plan_change` — trace des modifications du plan (D11), à la première modification manuelle (phase 2-3)
- `coach_message` — historique du coach (phase 3)
- `activity_metrics` — seulement si le calcul à la volée par `engine/` devient trop lent

## 5. Stack
- Next.js + TypeScript + Tailwind
- Supabase : Postgres + authentification (local via Supabase CLI, puis cloud)
- Vercel pour la mise en ligne (phase 4)
- PWA : installable sur le téléphone (une app native seulement si un besoin réel apparaît)
- API Claude pour le coach (phase 3)

## 6. Environnements
1. **Local** : `npm run dev` + Supabase local (Docker Desktop requis) ; `npm test` pour les tests ; `npm run sync` pour importer depuis Garmin
2. **En ligne** (phase 4) : GitHub → Vercel (aperçu par branche) + Supabase cloud
Secrets : `.env.local` en local, variables d'environnement Vercel en ligne. Jamais dans le repo.
