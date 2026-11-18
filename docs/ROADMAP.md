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
- [x] M3 — Migrations du schéma V1 + seed (référence, plan généré, données fictives)
- [x] M4 — Repository branché sur Supabase + connexion
- [x] M5 — Connecteur Garmin + `npm run sync` : import des vraies activités
- [x] Rattrapage des sorties faites au téléphone depuis le 2026-04-04 (D18) → P2-M3c (D32)
- [x] M6 — Design system v1 (tokens, polices, 12 composants, page `/design`)

Prompts prêts à l'emploi : `docs/missions/phase-1.md`.

## Phase 2 — Utile (mi-déc.)
- [x] `npm run db:backup` + `db:seed --mock` (D22, D23)
- [x] Connexion automatique en local, `/login` masqué (D26)
- [x] P2-M1 — Valeurs justes : réalisé hebdo, doubles sorties, liaison ± 1 jour, marche exclue (D28)
- [x] P2-M2 — Liaison : seuil de 50 % et recalcul à chaque synchro (D29)
- [x] P2-M3 — Design system v2.1 « Corail » : tokens, polices, 13 composants, page `/design` (D24, D27)
- [x] Lanceur « Target 42 » sur le Bureau (`npm run app`)
- [x] P2-M3b — Mise à jour de sécurité Next.js (16.4.6) + règle « même semaine » dans le code (D30)
- [x] P2-M3c — Données complètes : synchro sur 14 jours, activités hors course visibles (D31), import des sorties au téléphone (D32)
- [x] P2-M4 — Écran Aujourd'hui en v2.1, téléphone et PC (D25)
- [ ] P2-M5 — Séances + détail d'une séance en v2.1 (remplace « Historique des activités + détail »)
- [ ] P2-M6 — Journal : questionnaire du matin + saisie après séance, aussi pour une séance non faite (D20, D33)
- [ ] P2-M7 — Plan : calendrier prévu / réalisé / écarts
- [ ] P2-M8 — Échéances + saisie manuelle d'une sortie (D18, D33)
- [ ] P2-M9 — Nettoyage du prototype (D25) et contrôle de fin de phase

## Phase 3 — Intelligence (janv.)
- [ ] `SCIENCE.md` : formules et sources
- [ ] `src/engine/` : métriques d'entraînement (charge, forme/fatigue…) + tests
- [ ] Vue « état de forme » (score calculé par `engine/`, remplace les valeurs « démo » de D16)
- [ ] Coach IA dans l'app (prompt mis au point dans le projet Claude Coach)
- [ ] Analyse IA de chaque séance : données + journal (`session_analysis`, D20)

## Phase 4 — En ligne et mobile (fin janv.)
- [ ] Écran de connexion réel (e-mail + mot de passe), obligatoire avant la mise en ligne (D26)
- [ ] Déploiement Vercel + Supabase cloud
- [ ] Synchro Garmin automatique (tâche planifiée) + bouton « Synchroniser »
- [ ] PWA installable
- [ ] Accès tuteur en lecture seule

## Phase 5 — Utilisation (fév.–avril)
- [ ] Corrections et petites améliorations uniquement
- [ ] Bilan prévu vs réalisé pour le rendu du Défi
