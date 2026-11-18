# Maquettes — Journal, Saisie, Plan, Échéances

Résumé des maquettes v2.1 (canvas claude.ai, version 1794690802-f558), pour Claude Code.
Classes = `t42-reference.css`. Chiffres et textes fictifs : ne jamais les recopier. DESIGN.md fait foi.

## Journal (`/journal`)

### Téléphone (390)
1. En-tête : « Journal » + « Ressenti, effort perçu (RPE) et notes après chaque séance. »
2. Carte **Questionnaire du matin** (eyebrow + date du jour à droite), une fois par jour :
   - 4 `ScaleInput` 1–5 (fieldset + radios natifs, segments `seg`, sélection `seg on`, extrêmes nommés sous l'échelle) :
     Fatigue (Reposé ↔ Épuisé) · Sommeil ressenti (Très mauvais ↔ Excellent) · Douleur (Achille) (Aucune ↔ Forte) · Motivation (Faible ↔ Très forte) ;
   - champ texte « Une note ? (facultatif) » ;
   - bouton primary pleine largeur « Envoyer ».
   Une fois rempli : la carte affiche les 4 réponses (et permet de modifier).
3. `eyebrow` « Entrées récentes », puis une carte par entrée :
   - à gauche : date longue (`caption subtle` 600), titre de la séance (`label` 16) + `Chip` de type (ou `Chip off` hors plan, ou `Chip warn ✕ Non réalisée`), ligne de chiffres « 7,0 km · 5'38 /km · 141 bpm » (ou « prévu : 7 km » si non réalisée) ;
   - à droite : ressenti en `n-md` + mot en `accent-ink` (Épuisé · Difficile · Correct · Bien · Excellent) ;
   - RPE : `cmp-l` « RPE » + « 5/10 » en `n-sm`, barre de 10 segments (remplis `accent`, vides `surface-raised`) ;
   - commentaire en citation italique dans une tuile.
   Une séance **non réalisée** peut avoir une entrée (raison de l'écart, D20) : pas de ressenti ni de RPE, juste le commentaire.

### PC (1280)
En-tête + bouton secondary « Questionnaire du matin » à droite. Entrées en **2 colonnes**. Questionnaire et saisie s'ouvrent dans un **panneau latéral** (`sheet`, 480 px, `scrim` derrière), bouton primary « Enregistrer » en bas du panneau.

## Saisie après séance (téléphone : écran plein ; PC : panneau latéral)
- En-tête : « ✕ Fermer » à gauche, titre `t-sm` « Après la séance ».
- Tuile de rappel de la séance : date + `Chip` type, titre, ligne de chiffres.
- `caption subtle` : « Pré-rempli depuis ta montre : ressenti 4, RPE 5. Modifie si besoin. » (seulement si `device_feel` / `device_rpe` existent, D20).
- `ScaleInput` Ressenti 1–5 (légende + mot de la sélection en `accent-ink` : « · Bien ») ; `ScaleInput` RPE 1–10 (variante `s10`, Très facile ↔ Maximal) ; `ScaleInput` Douleur (Achille) 1–5 ; `TextField` multiligne « Commentaire » avec l'aide « Écris à chaud : ce qui a marché, ce qui a coincé. ».
- Bouton primary « Enregistrer » collé en bas (barre blanche à 95 %, bordure `line`).

## Plan (`/plan`)

### Téléphone (390)
1. En-tête : « Plan » + « 30 semaines en 4 phases, jusqu'au jour J. »
2. Carte `PhaseTimeline` (segments 8/10/9/3, phase courante remplie en `accent` au prorata, noms dessous, courante en `accent-ink` « Base aérobie · S1–8 »).
3. Ligne « Semaine en cours » (eyebrow) + lien « Aujourd'hui ».
4. Carte de la **semaine en cours** (`ring-acc`) : « Semaine 8 » + badge « en cours » (fond `accent-ink`, texte blanc), dates ; à droite « réalisé / prévu km » + `Chip` de statut (✓ Dans les clous · ↑ En avance · ! En retard). Puis une ligne par séance : jour court (32 px), titre + `Chip` type, ligne d'écart éventuelle en `accent-ink` (« Δ allure −14 s · FC +4 »), « réalisé / prévu » en `n-sm` 18, pastille de statut 28 px (`dot-done` ✓, `dot-skip` ✕, `dot-plan` •).
5. Par phase : numéro en `n-lg` corail + nom (`t-sm`) + « Semaines 1 à 8 · objectif de la phase » ; puis les autres semaines **repliées**, une carte-ligne chacune : « S7 », dates, « 36,8 / 42 », `Chip` de statut (ou `Chip neutral` « à venir » pour le futur, avec seulement le km prévu). Tap → semaine dépliée.

### PC (1280)
En-tête + bouton secondary « Aller à aujourd'hui ». `PhaseTimeline` pleine largeur. Par phase : cartes de semaine **dépliées en 2 colonnes** ; dans la phase en cours, seules les 4 dernières semaines sont dépliées, les plus anciennes regroupées sur un lien « Semaines 1 à 4 · réalisé / prévu km · afficher ». Semaines futures : cartes-lignes en 2 colonnes. Mention « allégée » à côté des dates des semaines allégées.

## Échéances (`/echeances`)

### Téléphone (390)
1. En-tête : « Échéances » + « Les courses et les tests jusqu'au jour J. »
2. Une carte par échéance à venir : `Chip` (« Course cible » en `quality` pour la course A, « Test » en `neutral`), nom (`t-sm`), « dimanche 18 avril 2027 · semaine 30 », à droite `J-n` en `n-md` (`accent-ink` pour la course cible) ; filet ; « Objectif : 3:30:00 · 4'58 /km ». La course cible a l'anneau `ring-acc` et vient en tête.
3. `eyebrow` « Passées » : cartes avec `Chip good ✓ Fait`, « Réalisé : 18'51 · 3'46 /km » (temps lu sur l'activité liée).
4. Bouton secondary pleine largeur « Ajouter une échéance ».
Les tests de la maquette (10 km, semi) portent un `Chip demo` « exemple » : ce sont des exemples, **pas des données à insérer**.

### PC (1280)
En-tête + bouton « Ajouter une échéance » à droite. Carte « Le plan et ses échéances » : `PhaseTimeline` avec repères verticaux (`ev-pin`) et étiquettes au-dessus, course cible en `accent-ink` (`ev-pin target`), aujourd'hui en trait `accent`. Puis les échéances en 2 colonnes.
