# Roadmap

Marathon : Annecy, avril 2027 (date à confirmer). Départ à l'EPFL : 16 février 2027 → fonctionnalités figées avant cette date.

## Données de référence
- Course : Marathon du Lac d'Annecy 2027. Date provisoire : **dimanche 18 avril 2027** (⚠️ à confirmer dès publication).
- Début du plan : **lundi 21 septembre 2026** (30 semaines). En réalité, phase libre pour l'instant : ~40-50 km/semaine, sortie longue à 22 km.
- FC max : **185 bpm**.
- Ces valeurs vivent dans `src/db/seed/reference.ts`.

## Phase 0 — Cadrage (semaine du 11 nov.)
- [x] Git : commit de l'existant, tag `v0-prototype`, repo GitHub privé
- [x] `docs/` + `CLAUDE.md` ajoutés au repo
- [x] Audit du code existant par Claude Code (mode plan) et décision garder/supprimer
- [x] Projet Claude QG configuré (instructions + docs)
- [ ] Benchmark : apps concurrentes, méthodes d'entraînement, design
- [x] Direction design précisée (`DESIGN.md` v1, D16)

## Phase 1 — Fondations (fin nov.)
- [x] Restructuration selon ARCHITECTURE.md
- [x] `src/engine/` créé dès maintenant : calculs sortis de l'UI + tests (vitest)
- [x] Source de données tranchée : Garmin Personal API (D13), schéma V1 (D14)
- [x] M1 — Sonde Garmin → `docs/GARMIN.md` (D15), puis retour au QG
- [x] M2 — Supabase local
- [ ] M3 — Migrations du schéma V1 + seed (référence, plan généré, données fictives)
- [ ] M4 — Repository branché sur Supabase + connexion
- [ ] M5 — Connecteur Garmin + `npm run sync` : import des vraies activités
- [ ] Rattrapage des sorties faites au téléphone depuis le 2026-04-04 (D18)
- [ ] M6 — Design system v1 (tokens, polices, 11 composants, page `/design`)

Prompts prêts à l'emploi : `docs/missions/phase-1.md`.

## Phase 2 — Utile (mi-déc.)
- [ ] Calendrier : prévu / réalisé / écarts
- [ ] Historique des activités + détail d'une séance
- [ ] Questionnaire du matin + journal après séance (mobile) : commentaire libre juste après la séance, pré-rempli avec le ressenti saisi sur la montre ; aussi pour une séance prévue non faite (D20)
- [ ] Saisie manuelle d'une sortie faite sans montre (D18)
- [ ] Échéances (courses) et compte à rebours

## Phase 3 — Intelligence (janv.)
- [ ] `SCIENCE.md` : formules et sources
- [ ] `src/engine/` : métriques d'entraînement (charge, forme/fatigue…) + tests
- [ ] Vue « état de forme » (score calculé par `engine/`, remplace les valeurs « démo » de D16)
- [ ] Coach IA dans l'app (prompt mis au point dans le projet Claude Coach)
- [ ] Analyse IA de chaque séance : données + journal (`session_analysis`, D20)

## Phase 4 — En ligne et mobile (fin janv.)
- [ ] Déploiement Vercel + Supabase cloud
- [ ] Synchro Garmin automatique (tâche planifiée) + bouton « Synchroniser »
- [ ] PWA installable
- [ ] Accès tuteur en lecture seule

## Phase 5 — Utilisation (fév.–avril)
- [ ] Corrections et petites améliorations uniquement
- [ ] Bilan prévu vs réalisé pour le rendu du Défi
