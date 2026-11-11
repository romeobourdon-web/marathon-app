# Roadmap

Marathon : Annecy, avril 2027 (date à confirmer). Départ à l'EPFL : 16 février 2027 → fonctionnalités figées avant cette date.

## Données de référence
- Course : Marathon du Lac d'Annecy 2027. Date provisoire : **dimanche 18 avril 2027** (⚠️ à confirmer dès publication).
- Début du plan : **lundi 21 septembre 2026** (30 semaines). En réalité, phase libre pour l'instant : ~40-50 km/semaine, sortie longue à 22 km.
- FC max : **185 bpm** (identique aux zones Strava).
- Ces valeurs vivent dans `src/db/seed/reference.ts`.

## Phase 0 — Cadrage (semaine du 11 nov.)
- [x] Git : commit de l'existant, tag `v0-prototype`, repo GitHub privé
- [x] `docs/` + `CLAUDE.md` ajoutés au repo
- [ ] Audit du code existant par Claude Code (mode plan) et décision garder/supprimer
- [ ] Projet Claude QG configuré (instructions + docs)
- [ ] Benchmark : apps concurrentes, méthodes d'entraînement, design
- [ ] Direction design précisée (`DESIGN.md`)

## Phase 1 — Fondations (fin nov.)
- [ ] Restructuration selon ARCHITECTURE.md
- [ ] `src/engine/` créé dès maintenant : calculs sortis de l'UI + tests (vitest)
- [ ] Supabase local + schéma V1 + données fictives
- [ ] Connecteur Garmin (ou Strava en transition) : import des vraies activités
- [ ] Design system de base (couleurs, typo, composants)

## Phase 2 — Utile (mi-déc.)
- [ ] Calendrier : prévu / réalisé / écarts
- [ ] Historique des activités + détail d'une séance
- [ ] Questionnaire du matin + journal après séance (mobile)
- [ ] Échéances (courses) et compte à rebours

## Phase 3 — Intelligence (janv.)
- [ ] `SCIENCE.md` : formules et sources
- [ ] `src/engine/` : métriques d'entraînement (charge, forme/fatigue…) + tests
- [ ] Vue « état de forme »
- [ ] Coach IA dans l'app (prompt mis au point dans le projet Claude Coach)

## Phase 4 — En ligne et mobile (fin janv.)
- [ ] Déploiement Vercel + Supabase cloud
- [ ] PWA installable
- [ ] Accès tuteur en lecture seule

## Phase 5 — Utilisation (fév.–avril)
- [ ] Corrections et petites améliorations uniquement
- [ ] Bilan prévu vs réalisé pour le rendu du Défi
