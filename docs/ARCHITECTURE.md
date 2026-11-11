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
connectors/  ── récupère activités, séries temporelles, bien-être (VFC, sommeil, FC repos)
   │
db/ (Supabase · Postgres)
   │
engine/      ── « l'ingénieur » : calcule les métriques (code pur, testé)
   │
planner/     ── plan prévu (phases → semaines → séances) + règles d'adaptation
   │
coach/       ── « le coach » : API Claude, lit les données via des outils, explique, propose (phase 3)
   │
app/ + components/ ── interface (PWA mobile d'abord)
```

## 3. Modules

| Dossier | Rôle | Règles |
|---|---|---|
| `connectors/` | Accès aux sources (Garmin cible, Strava possible) | Même interface `DataSource` pour toutes les sources. Aucun autre module ne connaît Garmin ou Strava. |
| `db/` | Schéma, migrations, données fictives (`seed/`) | Migrations versionnées. |
| `engine/` | Calculs : temps par zone, charge de séance, forme/fatigue, découplage FC/allure, prédictions | Fonctions pures, pas de réseau ni de base de données, tests obligatoires, formules référencées dans `SCIENCE.md`. |
| `planner/` | Structure du plan, liaison prévu↔réalisé, règles d'adaptation | Le plan est une donnée, pas du texte. |
| `coach/` | Prompts et outils du coach IA (phase 3) | Outils en lecture seule + un outil « proposer une modification », toujours validée par Roméo. |
| `app/`, `components/` | Écrans et design system | Aucun calcul métier dans l'UI. |

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
1. **Local** : `npm run dev` + Supabase local
2. **En ligne** (phase 4) : GitHub → Vercel (aperçu par branche) + Supabase cloud
Secrets : `.env.local` en local, variables d'environnement Vercel en ligne. Jamais dans le repo.
